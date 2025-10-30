import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, Clock, ExternalLink, Heart, Share2, Menu, X, Cpu, DollarSign, Palette, Trophy, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DiscoverSidebar } from "@/components/DiscoverSidebar";

interface NewsArticle {
  article_id: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  pubDate: string;
  source_name: string;
  category: string[];
}

export default function Discover() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { toast } = useToast();

  const topics = [
    { id: "top", label: "Top", icon: TrendingUp },
    { id: "technology", label: "Tech & Science" },
    { id: "business", label: "Finance" },
    { id: "entertainment", label: "Arts & Culture" },
    { id: "sports", label: "Sports" },
    { id: "world", label: "Entertainment" },
  ];

  useEffect(() => {
    checkUser();
    fetchNews();
  }, [selectedTopics]);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Build the API URL for Nepal news
      const url = new URL("https://newsdata.io/api/1/news");
      url.searchParams.append("apikey", "pub_51d4b6591fa64231bde59757ccbc5300");
      url.searchParams.append("country", "np");
      url.searchParams.append("language", "en");
      
      // Map topic IDs to API category names
      const categoryMap: { [key: string]: string } = {
        "technology": "technology",
        "business": "business",
        "entertainment": "entertainment",
        "sports": "sports",
        "world": "world",
      };
      
      // Add category if selected (use first category only, API limitation)
      if (selectedTopics.length > 0 && selectedTopics[0] !== "top") {
        const apiCategory = categoryMap[selectedTopics[0]];
        if (apiCategory) {
          url.searchParams.append("category", apiCategory);
        }
      } else {
        // For "top" or no selection, search for nepal news
        url.searchParams.append("q", "nepal");
      }
      
      console.log("Fetching news from:", url.toString());
      const response = await fetch(url.toString());
      
      const data = await response.json();
      console.log("News API response:", data);
      
      if (!response.ok) {
        console.error("API Error:", response.status, data);
        toast({
          title: "Error",
          description: data?.message || "Failed to fetch news",
          variant: "destructive",
        });
        return;
      }
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        setNews(data.results);
      } else {
        console.warn("No results in response:", data);
        toast({
          title: "Info",
          description: `No ${selectedTopics.length > 0 ? selectedTopics[0] : "news"} articles found for Nepal`,
        });
        setNews([]);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const saveInterests = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your interests.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_interests")
        .upsert({
          user_id: user.id,
          interests: selectedTopics,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your interests have been saved!",
      });
    } catch (error) {
      console.error("Failed to save interests:", error);
      toast({
        title: "Error",
        description: "Failed to save interests.",
        variant: "destructive",
      });
    }
  };

  const saveArticle = async (article: NewsArticle) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save articles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("saved_articles")
        .insert({
          user_id: user.id,
          article_id: article.article_id,
          title: article.title,
          description: article.description,
          url: article.link,
          image_url: article.image_url,
          source: article.source_name,
          published_at: article.pubDate,
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Article saved to your collection!",
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already saved",
          description: "This article is already in your collection.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save article.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-background border-r border-border transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        <DiscoverSidebar 
          selectedTopics={selectedTopics}
          onTopicToggle={toggleTopic}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Newspaper className="w-5 h-5" />
              <h1 className="text-xl font-light">Discover</h1>
            </div>
          </div>
        </div>

        {/* Floating Explore Nav Bar */}
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 sticky top-16 z-20">
          <div className="px-6 py-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: "top", label: "Top", icon: TrendingUp },
                { id: "technology", label: "Tech & Science", icon: Cpu },
                { id: "business", label: "Finance", icon: DollarSign },
                { id: "entertainment", label: "Arts & Culture", icon: Palette },
                { id: "sports", label: "Sports", icon: Trophy },
                { id: "world", label: "Entertainment", icon: Tv },
              ].map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                return (
                  <Button
                    key={topic.id}
                    variant="outline"
                    size="sm"
                    className={`whitespace-nowrap rounded-full transition-colors ${
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <topic.icon className="w-3.5 h-3.5 mr-1.5" />
                    {topic.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

      {/* Interest Customization Panel */}
      {selectedTopics.length > 0 && (
        <div className="bg-muted/30 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select topics to customize your Discover experience
              </p>
              <Button onClick={saveInterests} size="sm" className="rounded-full">
                Save Interests
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global News Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Trending Worldwide</h2>
            <p className="text-sm text-muted-foreground">
              {selectedTopics.length > 0 
                ? `Filtered by: ${selectedTopics.join(", ")}` 
                : "Top stories from around the world"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <Card
                key={article.article_id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Image */}
                {article.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {article.category && article.category[0] && (
                      <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur">
                        {article.category[0]}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {article.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.pubDate).toLocaleDateString()}
                    </span>
                    <span>{article.source_name}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const params = new URLSearchParams({
                          title: article.title,
                          description: article.description || '',
                          url: article.link,
                          source: article.source_name,
                          publishedAt: article.pubDate,
                          imageUrl: article.image_url || '',
                        });
                        window.location.href = `/article?${params.toString()}`;
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => saveArticle(article)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No news articles found.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
