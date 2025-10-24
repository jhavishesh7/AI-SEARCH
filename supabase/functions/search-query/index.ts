/// <reference path="./types.d.ts" />
// @ts-ignore: Deno types are resolved at runtime
import { GoogleGenAI } from "@google/genai";

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
    // Use DuckDuckGo search as a simpler alternative to Google
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    console.log("Fetching search results from:", searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error("Search failed:", response.status, response.statusText);
      return [];
    }

    const html = await response.text();
    
    // Simple parsing of DuckDuckGo results
    const results: ScrapedData[] = [];
    const resultRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetRegex = /<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    
    let match;
    const urls: string[] = [];
    const titles: string[] = [];
    
    while ((match = resultRegex.exec(html)) !== null && urls.length < 3) {
      urls.push(match[1]);
      titles.push(match[2]);
    }
    
    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < 3) {
      snippets.push(match[1]);
    }

    for (let i = 0; i < Math.min(urls.length, 3); i++) {
      results.push({
        url: urls[i],
        title: titles[i] || "Search Result",
        snippet: snippets[i] || "Relevant web result",
        content: snippets[i] || "",
      });
    }

    console.log("Scraped results:", results.length);
    return results;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
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
    const { query, language } = await req.json();
    console.log("Processing search query:", query, "language:", language);

    if (!query) {
      throw new Error("Query is required");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyCcJLhphmyywQLnetwn-E_notYhh2XXmJw";
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Scrape web data
    const scrapedData = await scrapeWeb(query);
    console.log("Web scraping completed");

    // Prepare context for AI
    const webContext = scrapedData
      .map((item, i) => `[Source ${i + 1}] ${item.title}\n${item.snippet}`)
      .join("\n\n");

    // Language selection: 'ne' | 'en' | 'auto'
    const lang = language === 'ne' || language === 'en' ? language : 'auto';
    const hasNepali = lang === 'auto' ? /[\u0900-\u097F]/.test(query) : (lang === 'ne');

    // System prompt with formatting guidance
    const systemPrompt = hasNepali
      ? `तपाईं NepDex AI हुनुहुन्छ - नेपालको लागि बनाइएको स्मार्ट खोज सहायक। नेपालीमा मात्र जवाफ दिनुहोस् (यदि प्रयोगकर्ताले अंग्रेजी आग्रह नगरेसम्म)। उत्तरहरू स्पष्ट शीर्षकहरू, साना अनुच्छेद, बुलेट सूची र तथ्य बिन्दुहरूमा सुन्दर ढंगले ढाँचा बनाई प्रस्तुत गर्नुहोस्।`
      : `You are NepDex AI - a smart search assistant built for Nepal. Reply strictly in English (unless the user explicitly asks for Nepali). Format responses with clear headings, concise paragraphs, bullet lists, and key facts.`;

    const userPrompt = `Query: ${query}\n\nRecent Web Data:\n${webContext || "No additional web data available."}\n\nProvide a comprehensive answer that combines your knowledge with the web data above. Be conversational and helpful. If data is uncertain, say so.`;

    // Call Google Gemini API using SDK
    console.log("Calling Google Gemini API with gemini-2.5-flash...");
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const answer = response.text || "Unable to generate answer.";

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
