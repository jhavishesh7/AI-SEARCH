import { useState } from "react";
import { Search, Image, Paperclip, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

export const WelcomeScreen = ({ onSearch }: WelcomeScreenProps) => {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const suggestions = [
    { 
      icon: "🎓", 
      text: "Parenting", 
      desc: "Advice for parents",
      prompts: [
        "What is the best way to teach children about money management?",
        "How can I help my teenager deal with peer pressure?",
        "What are effective discipline strategies for toddlers?",
      ]
    },
    { 
      icon: "📚", 
      text: "NepDex 101", 
      desc: "Learn the basics",
      prompts: [
        "What is NepDex and how does it work?",
        "How is NepDex different from other search engines?",
        "What makes NepDex special for Nepal?",
      ]
    },
    { 
      icon: "🎯", 
      text: "Learn", 
      desc: "Explore topics",
      prompts: [
        "What is the best way to learn a new language?",
        "What is a ROTH IRA?",
        "What is passive income?",
      ]
    },
    { 
      icon: "📋", 
      text: "Plan", 
      desc: "Organize ideas",
      prompts: [
        "How do I create a monthly budget plan?",
        "What are the steps to plan a successful event?",
        "How can I plan my career path effectively?",
      ]
    },
    { 
      icon: "📍", 
      text: "Local", 
      desc: "Nepal context",
      prompts: [
        "What are the best trekking routes in Nepal?",
        "How is Nepal's economy growing?",
        "What are traditional Nepali festivals?",
      ]
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Logo */}
      <div className="mb-16 animate-fade-in">
        <h1 className="text-6xl font-light tracking-tight text-foreground">
          nepdex
        </h1>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8 animate-slide-up">
        <div className="relative">
          <Input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full pl-5 pr-14 py-7 text-base bg-background border-2 border-border/50 hover:border-border focus:border-primary/50 transition-all rounded-xl shadow-sm"
          />
          
          {/* Send Button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="relative">
            <Button
              variant="outline"
              className="h-auto py-2 px-4 rounded-full border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all"
              onClick={() => setSelectedCategory(selectedCategory === suggestion.text ? null : suggestion.text)}
            >
              <span className="mr-2">{suggestion.icon}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{suggestion.text}</span>
                <span className="text-xs text-muted-foreground">{suggestion.desc}</span>
              </div>
            </Button>
            
            {/* Dropdown with prompts */}
            {selectedCategory === suggestion.text && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-background border border-border rounded-xl shadow-lg p-3 z-10 animate-slide-up">
                <div className="space-y-2">
                  {suggestion.prompts.map((prompt, pIndex) => (
                    <button
                      key={pIndex}
                      onClick={() => {
                        onSearch(prompt);
                        setSelectedCategory(null);
                      }}
                      className="w-full text-left p-3 text-sm hover:bg-muted/50 rounded-lg transition-colors flex items-start gap-2 group"
                    >
                      <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
                      <span className="group-hover:text-primary">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
