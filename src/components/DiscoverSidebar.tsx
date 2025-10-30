import { TrendingUp, Cpu, DollarSign, Palette, Trophy, Tv, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverSidebarProps {
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  onClose?: () => void;
}

export const DiscoverSidebar = ({ selectedTopics, onTopicToggle, onClose }: DiscoverSidebarProps) => {
  const topics = [
    { id: "top", label: "Top", icon: TrendingUp },
    { id: "technology", label: "Tech & Science", icon: Cpu },
    { id: "business", label: "Finance", icon: DollarSign },
    { id: "entertainment", label: "Arts & Culture", icon: Palette },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "world", label: "Entertainment", icon: Tv },
  ];

  return (
    <div className="h-screen flex flex-col p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discover</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Topics Section */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 px-3">Topics</h3>
        <div className="space-y-1">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <Button
                key={topic.id}
                variant="ghost"
                className={`w-full justify-start h-9 text-sm font-normal transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted"
                }`}
                onClick={() => onTopicToggle(topic.id)}
              >
                <topic.icon className="w-4 h-4 mr-3" />
                {topic.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Back to Home */}
      <Button
        variant="ghost"
        className="w-full justify-start h-9 text-sm font-normal mt-auto"
        onClick={() => window.location.href = "/"}
      >
        Back to Home
      </Button>
    </div>
  );
};
