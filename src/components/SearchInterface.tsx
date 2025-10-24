import { useState, useEffect } from "react";
import { Search, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
interface SearchInterfaceProps {
  query: string;
  onNewSearch: (query: string) => void;
  conversationId: string | null;
  onConversationChange: (id: string | null) => void;
}

interface SearchResult {
  answer: string;
  sources: Array<{ url: string; title: string; snippet: string }>;
  followUpQuestions?: string[];
}

export const SearchInterface = ({ query, onNewSearch, conversationId, onConversationChange }: SearchInterfaceProps) => {
  const [input, setInput] = useState(query);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [language, setLanguage] = useState<'auto' | 'ne' | 'en'>('auto');
  const { toast } = useToast();

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setResult(null);

    try {
      // Ensure a conversation exists
      let convId = conversationId;
      if (!convId) {
        const { data: conv, error: convErr } = await supabase
          .from("conversations")
          .insert({ title: searchQuery.slice(0, 80), language })
          .select("id")
          .single();
        if (convErr) throw convErr;
        convId = conv?.id as string;
        onConversationChange(convId);
      }

      const { data, error } = await supabase.functions.invoke("search-query", {
        body: { query: searchQuery, language },
      });

      if (error) throw error;

      setResult(data);

      // Save to history linked to conversation
      await supabase.from("search_history").insert({
        query: searchQuery,
        result: data,
        conversation_id: convId,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onNewSearch(input.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="mb-8 sticky top-4 z-20">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full pl-12 pr-44 py-6 text-lg bg-card/80 backdrop-blur-xl border-border rounded-2xl shadow-lg"
          />
          <div className="absolute right-28 top-1/2 -translate-y-1/2 w-36">
            <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
              <SelectTrigger className="h-10 bg-muted/40 border-border text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="ne">Nepali</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-accent hover:opacity-90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">खोजी भइरहेको छ...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-slide-up">
          {/* AI Answer */}
          <Card className="p-6 bg-card/60 backdrop-blur-xl border-border">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-gradient-accent rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">AI Answer</h2>
                <p className="text-sm text-muted-foreground">Powered by Gemini</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => performSearch(query)}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                {result.answer}
              </ReactMarkdown>
            </div>
          </Card>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <Card className="p-6 bg-card/60 backdrop-blur-xl border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Sources & Web Mentions
              </h3>
              <div className="space-y-3">
                {result.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {source.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {source.snippet}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2 truncate">{source.url}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Follow-up Questions */}
          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <Card className="p-6 bg-card/60 backdrop-blur-xl border-border">
              <h3 className="text-lg font-semibold mb-4">Related Questions</h3>
              <div className="flex flex-wrap gap-2">
                {result.followUpQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50"
                    onClick={() => onNewSearch(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
