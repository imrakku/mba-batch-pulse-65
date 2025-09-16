import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Clock } from "lucide-react";

interface SmartRecommendation {
  id: string;
  studentId: number;
  type: 'action' | 'meeting' | 'follow-up' | 'resource';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  suggestedDate?: Date;
}

interface SmartRecommendationsProps {
  recommendations: SmartRecommendation[];
  studentId: number;
  onApplyRecommendation: (recommendationId: string) => void;
}

export function SmartRecommendations({ 
  recommendations, 
  studentId, 
  onApplyRecommendation 
}: SmartRecommendationsProps) {
  const studentRecommendations = recommendations.filter(r => r.studentId === studentId).slice(0, 3);
  
  if (studentRecommendations.length === 0) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="dashboard-card border-l-4 border-l-primary animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-gradient">AI Recommendations</span>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {studentRecommendations.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentRecommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="p-4 bg-gradient-to-r from-muted/20 to-accent/20 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={getPriorityColor(rec.priority)} 
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Brain className="h-3 w-3" />
                      <span>{Math.round(rec.confidence * 100)}% confidence</span>
                    </div>
                    {rec.suggestedDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{rec.suggestedDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onApplyRecommendation(rec.id)}
                  className="shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}