import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ExternalLink, Share2, ArrowRight, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleData {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export default function ArticleView() {
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [relatedSources, setRelatedSources] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get article data from URL params
    const articleData = {
      title: searchParams.get("title") || "",
      description: searchParams.get("description") || "",
      url: searchParams.get("url") || "",
      source: searchParams.get("source") || "",
      publishedAt: searchParams.get("publishedAt") || "",
      imageUrl: searchParams.get("imageUrl") || "",
    };
    setArticle(articleData);
  }, [searchParams]);

  const askQuestion = async () => {
    if (!question.trim() || !article) return;

    setLoading(true);
    try {
      // Prepare article context for Gemini
      const articleContext = {
        title: article.title,
        description: article.description,
        source: article.source,
        url: article.url,
      };

      const { data, error } = await supabase.functions.invoke("search-query", {
        body: {
          query: `Based on this article: "${article.title}" - ${article.description}\n\nQuestion: ${question}`,
          language: "en",
          articleContext: JSON.stringify(articleContext),
        },
      });

      if (error) throw error;

      setAnswer(data.answer);
      if (data.sources) {
        setRelatedSources(data.sources);
      }
    } catch (error: any) {
      console.error("Question error:", error);
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion();
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{article.source}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-normal mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <Badge variant="secondary">{article.source}</Badge>
          </div>

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-96 object-cover rounded-xl mb-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            {article.description}
          </p>

          <Button
            variant="outline"
            onClick={() => window.open(article.url, '_blank')}
            className="mb-8"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read full article on {article.source}
          </Button>
        </div>

        {/* Chat Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowChat(!showChat)}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            💬 Learn about this article
          </Button>
        </div>
      </div>

      {/* Floating Chat Bar */}
      {showChat && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 shadow-2xl z-50 animate-slide-up">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Learn about this article</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowChat(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Question Input */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ask a question about this article..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full pl-4 pr-14 py-3 text-sm bg-background border-2 border-border/50 hover:border-border focus:border-primary/50 rounded-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!question.trim() || loading}
                    className="h-7 w-7 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Answer Display */}
            {answer && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>

                {/* Related Sources */}
                {relatedSources.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <h4 className="text-xs font-medium mb-2">Related Sources</h4>
                    <div className="space-y-1">
                      {relatedSources.slice(0, 3).map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-muted/20 hover:bg-muted/40 rounded text-xs transition-colors"
                        >
                          <p className="font-medium line-clamp-1">{source.title}</p>
                          <p className="text-muted-foreground line-clamp-1">{source.snippet}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!answer && !loading && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">Ask a question to learn more about this article</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating answer...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
