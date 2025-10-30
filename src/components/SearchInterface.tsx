import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ExternalLink, RefreshCw, Sparkles, Globe, Share2, Download, RotateCcw, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Image, Paperclip, Mic, ArrowRight } from "lucide-react";
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
  const [model, setModel] = useState<string>('gemini-2.0-flash-exp');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { icon: "🎓", text: "Parenting", prompt: "How can I help my teenager deal with peer pressure?" },
    { icon: "📚", text: "NepDex 101", prompt: "What is NepDex and how does it work?" },
    { icon: "🎯", text: "Learn", prompt: "What is the best way to learn a new language?" },
    { icon: "📋", text: "Plan", prompt: "How do I create a monthly budget plan?" },
    { icon: "📍", text: "Local", prompt: "What are the best trekking routes in Nepal?" },
  ];

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("search-query", {
        body: { query: searchQuery, language },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (error) throw error;

      console.log("Search response:", data);
      console.log("Sources found:", data?.sources?.length || 0);

      setResult(data);

      // Save to history linked to conversation (only for authenticated users)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("search_history").insert({
          query: searchQuery,
          result: data,
          conversation_id: convId,
          user_id: user.id,
        });
      }
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

      {/* Results or Loading */}
      {(result || loading) && (
        <div className="space-y-6 animate-slide-up pb-32">
          {/* Query Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-normal mb-4">{query}</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Rewrite
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* AI Answer */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary/10 rounded">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Answer</span>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating answer...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/30 rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted/30 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-muted/30 rounded animate-pulse w-4/6" />
                </div>
              </div>
            ) : result ? (
              <>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.answer}
                  </ReactMarkdown>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="h-8">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          {/* Sources */}
          {!loading && result && result.sources && result.sources.length > 0 && (
            <Card className="p-6 bg-background border border-border/50 shadow-sm">
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                Sources
              </h3>
              <div className="space-y-3">
                {result.sources.map((source, index) => {
                  const domain = new URL(source.url).hostname;
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                  
                  return (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-border/30 hover:border-border transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Website Favicon */}
                        <div className="flex-shrink-0 mt-1">
                          <img 
                            src={faviconUrl} 
                            alt={domain}
                            className="w-6 h-6 rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {source.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {source.snippet}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2 truncate">{domain}</p>
                        </div>
                        
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Follow-up Questions */}
          {!loading && result && result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3">Related</h3>
              <div className="flex flex-wrap gap-2">
                {result.followUpQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs rounded-full"
                    onClick={() => onNewSearch(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Input */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 py-4">
            <div className="max-w-4xl mx-auto px-6" ref={inputContainerRef}>
              {/* Quick Prompts */}
              {showSuggestions && (
                <div className="mb-3 flex flex-wrap gap-2 animate-slide-up">
                  {quickPrompts.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1.5 px-3 text-xs rounded-full"
                      onClick={() => {
                        setInput(item.prompt);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      {item.text}
                    </Button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ask a follow-up..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-4 pr-14 py-6 text-sm bg-background border-2 border-border/50 hover:border-border focus:border-primary/50 rounded-xl"
                  />
                  
                  {/* Send Button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim()}
                      className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
