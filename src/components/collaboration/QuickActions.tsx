import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Tag, Archive, Target } from "lucide-react";

interface QuickActionsProps {
  selectedNotesCount: number;
  selectedStudent: number | null;
  onBulkEmail: () => void;
  onBulkTag: () => void;
  onBulkExport: () => void;
  onCreateAssignment: () => void;
}

export function QuickActions({
  selectedNotesCount,
  selectedStudent,
  onBulkEmail,
  onBulkTag,
  onBulkExport,
  onCreateAssignment
}: QuickActionsProps) {
  const actions = [
    { 
      id: 'email', 
      label: 'Send Bulk Email', 
      icon: Mail, 
      action: onBulkEmail,
      disabled: selectedNotesCount === 0,
      color: 'hover:bg-primary/10 hover:border-primary/30'
    },
    { 
      id: 'tag', 
      label: 'Add Bulk Tags', 
      icon: Tag, 
      action: onBulkTag,
      disabled: selectedNotesCount === 0,
      color: 'hover:bg-secondary/10 hover:border-secondary/30'
    },
    { 
      id: 'export', 
      label: 'Export Selected', 
      icon: Archive, 
      action: onBulkExport,
      disabled: selectedNotesCount === 0,
      color: 'hover:bg-success/10 hover:border-success/30'
    },
    { 
      id: 'assignment', 
      label: 'Create Assignment', 
      icon: Target, 
      action: onCreateAssignment,
      disabled: !selectedStudent,
      color: 'hover:bg-warning/10 hover:border-warning/30'
    }
  ];

  return (
    <Card className="dashboard-card animate-fade-in border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-gradient">Quick Actions</span>
          </div>
          {selectedNotesCount > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              {selectedNotesCount} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-24 flex flex-col gap-3 transition-all duration-300 hover:scale-105 hover:shadow-md ${action.color} ${action.disabled ? 'opacity-50' : ''}`}
                onClick={action.action}
                disabled={action.disabled}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium text-center leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}