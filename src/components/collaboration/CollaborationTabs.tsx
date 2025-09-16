import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Paperclip, Calendar, BarChart3, History } from "lucide-react";

interface CollaborationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CollaborationTabs({ activeTab, onTabChange }: CollaborationTabsProps) {
  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: History }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}