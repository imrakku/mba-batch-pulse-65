import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Users, Target, Award, ChevronDown, ChevronUp } from "lucide-react";
import { Student } from "@/types/student";
import { useStudents } from "@/hooks/useStudents";
export function PerformanceAnalytics() {
  const {
    data: students
  } = useStudents();
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const analytics = useMemo(() => {
    if (!students || students.length === 0) return null;
    // Consider only defined UG percentages
    const ugDefined = students.filter(s => typeof s.ugPercentage === 'number');

    // Performance categorization
    const highPerformers = ugDefined.filter(s => s.ugPercentage as number >= 85);
    const averagePerformers = ugDefined.filter(s => s.ugPercentage as number >= 70 && s.ugPercentage as number < 85);
    const strugglingStudents = ugDefined.filter(s => s.ugPercentage as number < 70);

    // Grade distribution
    const gradeDistribution = [{
      grade: '90-100%',
      count: ugDefined.filter(s => s.ugPercentage as number >= 90).length,
      color: 'hsl(var(--success))'
    }, {
      grade: '80-89%',
      count: ugDefined.filter(s => s.ugPercentage as number >= 80 && s.ugPercentage as number < 90).length,
      color: 'hsl(var(--primary))'
    }, {
      grade: '70-79%',
      count: ugDefined.filter(s => s.ugPercentage as number >= 70 && s.ugPercentage as number < 80).length,
      color: 'hsl(var(--warning))'
    }, {
      grade: '60-69%',
      count: ugDefined.filter(s => s.ugPercentage as number >= 60 && s.ugPercentage as number < 70).length,
      color: 'hsl(var(--destructive))'
    }, {
      grade: '<60%',
      count: ugDefined.filter(s => s.ugPercentage as number < 60).length,
      color: 'hsl(var(--muted))'
    }];

    // At-risk indicators (only consider defined metrics)
    const atRiskStudents = students.filter(s => typeof s.ugPercentage === 'number' && s.ugPercentage < 70 || typeof s.class12Percentage === 'number' && s.class12Percentage < 75 || typeof s.class10Percentage === 'number' && s.class10Percentage < 75);
    return {
      highPerformers,
      averagePerformers,
      strugglingStudents,
      atRiskStudents,
      gradeDistribution,
      averageUGPercentage: ugDefined.length ? ugDefined.reduce((sum, s) => sum + (s.ugPercentage as number), 0) / ugDefined.length : 0,
      totalDefinedUG: ugDefined.length
    };
  }, [students]);
  if (!analytics) return null;
  const getPerformanceStatus = (percentage: number) => {
    if (percentage >= 85) return {
      status: 'excellent',
      color: 'success',
      icon: Award
    };
    if (percentage >= 70) return {
      status: 'good',
      color: 'primary',
      icon: CheckCircle
    };
    return {
      status: 'needs-attention',
      color: 'destructive',
      icon: AlertTriangle
    };
  };
  return <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-success" />
              High Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success mb-2">
              {analytics.highPerformers.length}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Students with 85%+ scores
            </div>
            <Progress value={analytics.highPerformers.length / (analytics.totalDefinedUG || 1) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round(analytics.highPerformers.length / (analytics.totalDefinedUG || 1) * 100)}% of cohort (with UG%)
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Average Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {analytics.averagePerformers.length}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Students with 70-84% scores
            </div>
            <Progress value={analytics.averagePerformers.length / (analytics.totalDefinedUG || 1) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round(analytics.averagePerformers.length / (analytics.totalDefinedUG || 1) * 100)}% of cohort (with UG%)
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Grade Distribution - Always Visible */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Toggle Button for More Insights */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowMoreInsights(!showMoreInsights)} className="flex items-center gap-2">
          {showMoreInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showMoreInsights ? 'Hide detailed insights' : 'Show detailed insights'}
        </Button>
      </div>

      {/* Additional Insights - Toggleable */}
      {showMoreInsights && <div className="space-y-6">
        </div>}
    </div>;
}