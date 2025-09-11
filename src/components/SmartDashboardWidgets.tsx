import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Eye, EyeOff, TrendingUp, Users, Briefcase, GraduationCap, AlertCircle, Calendar, Mail, Download, BarChart3 } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'alert';
  icon: any;
  visible: boolean;
  data?: any;
}
export function SmartDashboardWidgets() {
  const {
    data: students
  } = useStudents();
  const [widgets, setWidgets] = useState<Widget[]>([{
    id: 'total-students',
    title: 'Total Students',
    type: 'stat',
    icon: Users,
    visible: true
  }, {
    id: 'avg-performance',
    title: 'Average Performance',
    type: 'stat',
    icon: TrendingUp,
    visible: true
  }, {
    id: 'experienced',
    title: 'Experienced Students',
    type: 'stat',
    icon: Briefcase,
    visible: true
  }, {
    id: 'recent-updates',
    title: 'Recent Updates',
    type: 'list',
    icon: Calendar,
    visible: true
  }, {
    id: 'alerts',
    title: 'System Alerts',
    type: 'alert',
    icon: AlertCircle,
    visible: true
  }, {
    id: 'quick-actions',
    title: 'Quick Actions',
    type: 'list',
    icon: BarChart3,
    visible: true
  }]);
  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(widgets.map(widget => widget.id === widgetId ? {
      ...widget,
      visible: !widget.visible
    } : widget));
  };
  const getWidgetData = (widgetId: string) => {
    if (!students) return null;
    switch (widgetId) {
      case 'total-students':
        return {
          value: students.length,
          change: '+12 from last batch'
        };
      case 'avg-performance':
        const definedUG = students.filter(s => typeof s.ugPercentage === 'number');
        const avgPerf = definedUG.length ? definedUG.reduce((sum, s) => sum + (s.ugPercentage as number), 0) / definedUG.length : 0;
        return {
          value: `${Math.round(avgPerf)}%`,
          change: '+3.2% from last semester'
        };
      case 'experienced':
        const expCount = students.filter(s => (s.totalExperience || 0) > 0).length;
        return {
          value: expCount,
          change: `${Math.round(expCount / students.length * 100)}% of batch`
        };
      case 'recent-updates':
        return [{
          action: 'New student enrolled',
          time: '2 hours ago',
          type: 'success'
        }, {
          action: 'Academic records updated',
          time: '4 hours ago',
          type: 'info'
        }, {
          action: 'Placement status changed',
          time: '1 day ago',
          type: 'warning'
        }];
      case 'alerts':
        const lowPerformers = students.filter(s => typeof s.ugPercentage === 'number' && s.ugPercentage < 70).length;
        return [{
          message: `${lowPerformers} students need academic support`,
          type: 'warning',
          urgent: lowPerformers > 5
        }, {
          message: 'Semester end reports due in 7 days',
          type: 'info',
          urgent: false
        }, {
          message: 'Placement season starts next month',
          type: 'success',
          urgent: false
        }];
      case 'quick-actions':
        return [{
          label: 'Export Student List',
          icon: Download,
          action: 'export'
        }, {
          label: 'Send Batch Email',
          icon: Mail,
          action: 'email'
        }, {
          label: 'Generate Reports',
          icon: BarChart3,
          action: 'report'
        }];
      default:
        return null;
    }
  };
  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;
    const data = getWidgetData(widget.id);
    const Icon = widget.icon;
    switch (widget.type) {
      case 'stat':
        return <Card key={widget.id} className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {widget.title}
                  </p>
                  
                  {(data as any)?.change}
                </div>
                <Icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>;
      case 'list':
        return <Card key={widget.id} className="dashboard-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-primary" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.isArray(data) && data?.map((item: any, index: number) => <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {widget.id === 'quick-actions' ? <>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.label}</span>
                      </> : <>
                        <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-success' : item.type === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
                        <span className="text-sm">{item.action}</span>
                      </>}
                  </div>
                  {widget.id === 'quick-actions' ? <Button variant="outline" size="sm">
                      Go
                    </Button> : <span className="text-xs text-muted-foreground">
                      {item.time}
                    </span>}
                </div>)}
            </CardContent>
          </Card>;
      case 'alert':
        return <Card key={widget.id} className="dashboard-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-primary" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.isArray(data) && data?.map((alert: any, index: number) => <div key={index} className={`p-3 rounded-lg border-l-4 ${alert.type === 'warning' ? 'border-warning bg-warning/10' : alert.type === 'success' ? 'border-success bg-success/10' : 'border-primary bg-primary/10'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{alert.message}</span>
                    {alert.urgent && <Badge variant="destructive" className="ml-2">
                        Urgent
                      </Badge>}
                  </div>
                </div>)}
            </CardContent>
          </Card>;
      default:
        return null;
    }
  };
  return <div className="space-y-6">
      {/* Widget Configuration */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Dashboard Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {widgets.map(widget => <Button key={widget.id} variant="outline" size="sm" onClick={() => toggleWidgetVisibility(widget.id)} className="flex items-center gap-2">
                {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {widget.title}
              </Button>)}
          </div>
        </CardContent>
      </Card>

      {/* Visible Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.filter(w => w.visible && w.type === 'stat').map(renderWidget)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.filter(w => w.visible && w.type !== 'stat').map(renderWidget)}
      </div>
    </div>;
}