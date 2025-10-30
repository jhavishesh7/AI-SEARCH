import { useState, useEffect } from "react";
import { SearchInterface } from "@/components/SearchInterface";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { SearchHistory } from "@/components/SearchHistory";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    // Warn non-authenticated users about losing chat history
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (searchQuery && !isAuthenticated) {
        e.preventDefault();
        e.returnValue = "All your chat history will be lost. Are you sure you want to leave?";
        return "All your chat history will be lost. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [searchQuery, isAuthenticated]);

  const handleNewChat = () => {
    setSearchQuery("");
    setConversationId(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header with Menu/Close toggle and User Menu */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-2 pointer-events-none">
        {/* Menu button - hidden when sidebar is open */}
        {!showHistory && (
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted rounded-lg pointer-events-auto"
            onClick={() => setShowHistory(true)}
          >
            <Menu size={20} />
          </Button>
        )}

        {/* User Menu */}
        <div className="pointer-events-auto ml-auto">
          <UserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex">
        {/* Search History Sidebar - Hidden by default */}
        <div
          className={`fixed inset-y-0 left-0 w-80 bg-background border-r border-border transform transition-transform duration-300 ${
            showHistory ? "translate-x-0" : "-translate-x-full"
          } z-40`}
        >
          <SearchHistory 
            onSelectQuery={setSearchQuery} 
            onNewChat={handleNewChat}
            onClose={() => setShowHistory(false)}
          />
        </div>

        {/* Main search area */}
        <div className="flex-1 min-h-screen">
          {!searchQuery ? (
            <WelcomeScreen onSearch={setSearchQuery} />
          ) : (
            <SearchInterface 
              query={searchQuery} 
              onNewSearch={setSearchQuery}
              conversationId={conversationId}
              onConversationChange={setConversationId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
