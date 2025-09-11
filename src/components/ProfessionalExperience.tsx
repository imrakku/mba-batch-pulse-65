import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap } from 'recharts';
import { Building, Users, TrendingUp, Briefcase, Clock, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];
export function ProfessionalExperience() {
  const {
    data: students
  } = useStudents();
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const experienceAnalytics = useMemo(() => {
    if (!students || students.length === 0) return null;

    // Experience distribution
    const freshers = students.filter(s => (s.totalExperience || 0) === 0);
    const experienced = students.filter(s => (s.totalExperience || 0) > 0);

    // Experience ranges
    const experienceRanges = {
      '0 years': freshers.length,
      '1-2 years': students.filter(s => (s.totalExperience || 0) >= 1 && (s.totalExperience || 0) <= 2).length,
      '3-5 years': students.filter(s => (s.totalExperience || 0) >= 3 && (s.totalExperience || 0) <= 5).length,
      '5+ years': students.filter(s => (s.totalExperience || 0) > 5).length
    };

    // Company analysis
    const companyFrequency: Record<string, number> = {};
    students.forEach(student => {
      // Internship companies
      if (student.internshipCompany) {
        companyFrequency[student.internshipCompany] = (companyFrequency[student.internshipCompany] || 0) + 1;
      }
      // Work experience companies
      if (student.workExperience1Company) {
        companyFrequency[student.workExperience1Company] = (companyFrequency[student.workExperience1Company] || 0) + 1;
      }
      if (student.workExperience2Company) {
        companyFrequency[student.workExperience2Company] = (companyFrequency[student.workExperience2Company] || 0) + 1;
      }
    });
    const avgExperience = experienced.length > 0 ? experienced.reduce((sum, s) => sum + (s.totalExperience || 0), 0) / experienced.length : 0;
    return {
      freshers,
      experienced,
      experienceRanges,
      avgExperience,
      totalStudents: students.length
    };
  }, [students]);
  if (!experienceAnalytics) return null;
  const experienceData = Object.entries(experienceAnalytics.experienceRanges).map(([range, count]) => ({
    range,
    count,
    percentage: Math.round(count / experienceAnalytics.totalStudents * 100)
  }));
  return <div className="space-y-6">
      {/* Experience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary" />
              <Badge variant="secondary">
                {Math.round(experienceAnalytics.experienced.length / experienceAnalytics.totalStudents * 100)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {experienceAnalytics.experienced.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Experienced Students
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-secondary" />
              <Badge variant="outline">
                Average
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {experienceAnalytics.avgExperience.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">
              Years Experience
            </p>
          </CardContent>
        </Card>

        

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-success" />
              <Badge variant="secondary">
                Fresh
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {experienceAnalytics.freshers.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Fresh Graduates
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Toggle Button for More Insights */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowMoreInsights(!showMoreInsights)} className="flex items-center gap-2">
          {showMoreInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showMoreInsights ? 'Hide detailed insights' : 'Show detailed insights'}
        </Button>
      </div>

      {/* Additional Insights - Toggleable */}
      {showMoreInsights && <div className="space-y-6">
          {/* Experience Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Experience Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={experienceData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="count" label={({
                  range,
                  percentage
                }) => `${range}: ${percentage}%`}>
                      {experienceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </div>}
    </div>;
}