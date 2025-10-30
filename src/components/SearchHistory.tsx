import { useEffect, useState } from "react";
import { Clock, Trash2, Plus, Newspaper, Home, Plane, GraduationCap, Trophy, BookOpen, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
  onNewChat?: () => void;
  onClose?: () => void;
}

interface HistoryItem {
  id: string;
  query: string;
  created_at: string;
}

export const SearchHistory = ({ onSelectQuery, onNewChat, onClose }: SearchHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadHistory();
      } else {
        setUser(null);
        setHistory([]);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  };

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

  const navSections = [
    { icon: Home, label: "Home", action: () => onNewChat?.() },
    { icon: Plane, label: "Travel", action: () => {} },
    { icon: GraduationCap, label: "Academic", action: () => {} },
    { icon: Trophy, label: "Sports", action: () => {} },
  ];

  return (
    <div className="h-screen flex flex-col p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Neuralaya</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground hover:bg-muted rounded-lg"
          onClick={() => onClose?.()}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-1 mb-6">
        {navSections.map((section, index) => (
          <div key={index} className="relative group">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 text-sm font-normal"
              onClick={section.action}
              disabled={index !== 0}
            >
              <section.icon className="w-4 h-4 mr-3" />
              {section.label}
            </Button>
            {index !== 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>


      {/* Discover Link */}
      <Button
        variant="ghost"
        className="w-full justify-start h-9 text-sm font-normal mb-4"
        onClick={() => window.location.href = "/discover"}
      >
        <Newspaper className="w-4 h-4 mr-3" />
        Discover
      </Button>

      <ScrollArea className="flex-1">
        {!user ? (
          <div className="text-center py-12 px-4">
            <LogIn className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-2">Sign in to view history</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Your search history will be saved when you're signed in
            </p>
            <Button
              onClick={() => window.location.href = "/signin"}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        ) : loading ? (
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
