import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

interface NotificationBarProps {
  notifications: Notification[];
  onDismiss: () => void;
}

export function NotificationBar({ notifications, onDismiss }: NotificationBarProps) {
  if (notifications.length === 0) return null;

  const notification = notifications[0];
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-success bg-success/5';
      case 'warning': return 'border-l-warning bg-warning/5';
      case 'error': return 'border-l-destructive bg-destructive/5';
      default: return 'border-l-primary bg-primary/5';
    }
  };

  const Icon = getIcon(notification.type);

  return (
    <Alert className={`border-l-4 animate-slide-up ${getColorClass(notification.type)}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <Bell className="h-4 w-4" />
      </div>
      <AlertDescription className="flex items-center justify-between">
        <span className="font-medium">{notification.message}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          className="hover:bg-background/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}