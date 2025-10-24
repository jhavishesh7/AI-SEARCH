import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

export const WelcomeScreen = ({ onSearch }: WelcomeScreenProps) => {
  const [input, setInput] = useState("");

  const suggestions = [
    "नेपालको बजेट २०८२ मा के नयाँ छ?",
    "पोखरामा आजको मौसम कस्तो छ?",
    "Blockchain नेपालमा कसरी सुरु गर्ने?",
    "काठमाडौंको सबैभन्दा राम्रो मोमो कहाँ छ?",
    "नेपालमा AI को भविष्य के छ?",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 animate-fade-in">
      {/* Logo and Title */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-accent rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            NepDex
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-2">
          👋 Namaste! तपाईंको NepDex मा स्वागत छ
        </p>
        <p className="text-sm text-muted-foreground/80">
          नेपालमै बनेको — विश्वकै स्तरको AI सर्च
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Ask anything — from Kathmandu's best momo to cosmic physics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-lg bg-card/60 backdrop-blur-xl border-border hover:border-primary/50 focus:border-primary transition-all rounded-2xl shadow-lg"
          />
          <Button
            type="submit"
            size="lg"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-accent hover:opacity-90 transition-all shadow-lg"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="w-full max-w-3xl">
        <p className="text-sm text-muted-foreground mb-4">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="bg-card/40 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-card/60 transition-all"
              onClick={() => onSearch(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {[
          {
            title: "🧠 AI-Powered",
            desc: "Gemini AI साथ स्मार्ट उत्तर",
          },
          {
            title: "🌐 Real-time Web Data",
            desc: "Live web scraping for current info",
          },
          {
            title: "🇳🇵 Nepali Context",
            desc: "नेपाली संस्कृति र सन्दर्भमा केन्द्रित",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-card/40 backdrop-blur-xl border border-border rounded-xl hover:border-primary/50 transition-all animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
