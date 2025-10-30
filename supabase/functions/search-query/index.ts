/// <reference path="./types.d.ts" />

export {};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ScrapedData {
  url: string;
  title: string;
  snippet: string;
  content: string;
}

async function scrapeWeb(query: string): Promise<ScrapedData[]> {
  try {
    // Try using DuckDuckGo Instant Answer API
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    
    console.log("Fetching search results from DuckDuckGo API");
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error("API request failed:", response.status);
      return getFallbackSources(query);
    }

    const data = await response.json();
    const results: ScrapedData[] = [];

    // Extract related topics as sources
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (let i = 0; i < Math.min(data.RelatedTopics.length, 5); i++) {
        const topic = data.RelatedTopics[i];
        if (topic.FirstURL && topic.Text) {
          results.push({
            url: topic.FirstURL,
            title: topic.Text.split(' - ')[0] || "Related Topic",
            snippet: topic.Text,
            content: topic.Text,
          });
        }
      }
    }

    // If we got results, return them
    if (results.length > 0) {
      console.log("Found", results.length, "sources from DuckDuckGo API");
      return results;
    }

    // Otherwise return fallback sources
    return getFallbackSources(query);
  } catch (error) {
    console.error("Scraping error:", error);
    return getFallbackSources(query);
  }
}

function getFallbackSources(query: string): ScrapedData[] {
  // Return relevant fallback sources based on query
  console.log("Using fallback sources for query:", query);
  
  return [
    {
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      title: "Google Search Results",
      snippet: `Search results for: ${query}`,
      content: `Find more information about ${query} on Google`,
    },
    {
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      title: "Wikipedia",
      snippet: `Encyclopedia article about ${query}`,
      content: `Learn more about ${query} from Wikipedia`,
    },
    {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      title: "YouTube Videos",
      snippet: `Video content related to ${query}`,
      content: `Watch videos about ${query} on YouTube`,
    },
  ];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Check authorization header (optional - function is public)
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);

    const { query, language, articleContext } = await req.json();
    console.log("Processing search query:", query, "language:", language);

    if (!query) {
      throw new Error("Query is required");
    }

    // Parse article context if provided
    let parsedArticleContext = null;
    if (articleContext) {
      try {
        parsedArticleContext = typeof articleContext === 'string' ? JSON.parse(articleContext) : articleContext;
        console.log("Article context provided:", parsedArticleContext.title);
      } catch (e) {
        console.error("Failed to parse article context:", e);
      }
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyCcJLhphmyywQLnetwn-E_notYhh2XXmJw";
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Scrape web data
    const scrapedData = await scrapeWeb(query);
    console.log("Web scraping completed");

    // Prepare context for AI
    const webContext = scrapedData
      .map((item, i) => `[Source ${i + 1}] ${item.title}\n${item.snippet}`)
      .join("\n\n");

    // Add article context if available
    let articleContextText = "";
    if (parsedArticleContext) {
      articleContextText = `\n\nArticle Context:\nTitle: ${parsedArticleContext.title}\nDescription: ${parsedArticleContext.description}\nSource: ${parsedArticleContext.source}\n`;
    }

    // Language selection: 'ne' | 'en' | 'auto'
    const lang = language === 'ne' || language === 'en' ? language : 'auto';
    const hasNepali = lang === 'auto' ? /[\u0900-\u097F]/.test(query) : (lang === 'ne');

    // System prompt with formatting guidance
    const systemPrompt = hasNepali
      ? `तपाईं NepDex AI हुनुहुन्छ - नेपालको लागि बनाइएको स्मार्ट खोज सहायक। नेपालीमा मात्र जवाफ दिनुहोस् (यदि प्रयोगकर्ताले अंग्रेजी आग्रह नगरेसम्म)। उत्तरहरू स्पष्ट शीर्षकहरू, साना अनुच्छेद, बुलेट सूची र तथ्य बिन्दुहरूमा सुन्दर ढंगले ढाँचा बनाई प्रस्तुत गर्नुहोस्।`
      : `You are NepDex AI - a smart search assistant built for Nepal. Reply strictly in English (unless the user explicitly asks for Nepali). Format responses with clear headings, concise paragraphs, bullet lists, and key facts.${parsedArticleContext ? ' You are answering questions about a specific article.' : ''}`;

    const userPrompt = `Query: ${query}${articleContextText}\n\nRecent Web Data:\n${webContext || "No additional web data available."}\n\nProvide a comprehensive answer that combines your knowledge with the web data above${parsedArticleContext ? ' and the article context' : ''}. Be conversational and helpful. If data is uncertain, say so.`;

    // Call Google Gemini API directly
    console.log("Calling Google Gemini API with gemini-2.0-flash-exp...");
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate answer.";

    console.log("Search completed successfully");

    // Return structured response
    return new Response(
      JSON.stringify({
        answer,
        sources: scrapedData.map((item) => ({
          url: item.url,
          title: item.title,
          snippet: item.snippet,
        })),
        followUpQuestions: hasNepali
          ? [
              "यस बारेमा थप जानकारी?",
              "नेपालमा यसको प्रभाव के छ?",
              "अरू सम्बन्धित विषयहरू?",
            ]
          : [
              "Tell me more about this",
              "How does this impact Nepal?",
              "What are related topics?",
            ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
