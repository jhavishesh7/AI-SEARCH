import { useState } from "react";
import { SearchInterface } from "@/components/SearchInterface";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { SearchHistory } from "@/components/SearchHistory";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden text-foreground"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Main content */}
      <div className="relative z-10 flex">
        {/* Search History Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 w-80 bg-card/50 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ${
            showHistory ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } z-40`}
        >
          <SearchHistory onSelectQuery={setSearchQuery} />
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
