import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
}

interface HistoryItem {
  id: string;
  query: string;
  created_at: string;
}

export const SearchHistory = ({ onSelectQuery }: SearchHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("id, query, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await supabase.from("search_history").delete().eq("id", id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          History
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Recent searches</p>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted/30 rounded-lg animate-shimmer"
                style={{
                  backgroundSize: "200% 100%",
                  backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--muted)/0.5), transparent)",
                }}
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No search history yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Start searching to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="group p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => onSelectQuery(item.query)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1 line-clamp-2">{item.query}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {new Date(item.created_at).toLocaleDateString("ne-NP")}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
