import { useStudents } from "@/hooks/useStudents";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StudentCard } from "@/components/StudentCard";
import { GraduationCap, TrendingUp, Award, BookOpen, Target, Users } from "lucide-react";
import { useMemo } from "react";

export default function AcademicPerformance() {
  const { data: students, isLoading } = useStudents();

  const academicStats = useMemo(() => {
    if (!students || students.length === 0) return null;

    const definedUG = students.filter(s => typeof s.ugPercentage === 'number');
    const defined12 = students.filter(s => typeof s.class12Percentage === 'number');
    const defined10 = students.filter(s => typeof s.class10Percentage === 'number');

    const avgUGPercentage = definedUG.length
      ? definedUG.reduce((sum, s) => sum + (s.ugPercentage as number), 0) / definedUG.length
      : 0;
    const avgClass12 = defined12.length
      ? defined12.reduce((sum, s) => sum + (s.class12Percentage as number), 0) / defined12.length
      : 0;
    const avgClass10 = defined10.length
      ? defined10.reduce((sum, s) => sum + (s.class10Percentage as number), 0) / defined10.length
      : 0;

    // UG Grade Distribution (only from defined values)
    const ugDistribution = [
      { grade: "90%+", count: definedUG.filter(s => (s.ugPercentage as number) >= 90).length, color: "#1e293b" },
      { grade: "80-89%", count: definedUG.filter(s => (s.ugPercentage as number) >= 80 && (s.ugPercentage as number) < 90).length, color: "#334155" },
      { grade: "70-79%", count: definedUG.filter(s => (s.ugPercentage as number) >= 70 && (s.ugPercentage as number) < 80).length, color: "#475569" },
      { grade: "60-69%", count: definedUG.filter(s => (s.ugPercentage as number) >= 60 && (s.ugPercentage as number) < 70).length, color: "#64748b" },
      { grade: "Below 60%", count: definedUG.filter(s => (s.ugPercentage as number) < 60).length, color: "#94a3b8" }
    ];

    // Top Programs
    const programCount = students.reduce((acc, student) => {
      const program = student.ugProgram || 'Unknown';
      acc[program] = (acc[program] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPrograms = Object.entries(programCount)
      .map(([program, count]) => ({ program, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topPerformers = definedUG
      .sort((a, b) => (b.ugPercentage as number) - (a.ugPercentage as number))
      .slice(0, 6);

    return {
      avgUGPercentage,
      avgClass12,
      avgClass10,
      ugDistribution,
      topPrograms,
      topPerformers
    };
  }, [students]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading academic performance data...</div>
      </div>
    );
  }

  if (!academicStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No academic data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-heading text-foreground">Academic Performance</h1>
        <p className="text-muted-foreground">Comprehensive analysis of student academic achievements and performance metrics</p>
      </div>

      {/* Academic Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average UG Score"
          value={`${academicStats.avgUGPercentage.toFixed(1)}%`}
          description="Overall undergraduate performance"
          icon={GraduationCap}
        />
        <StatCard
          title="Average Class 12"
          value={`${academicStats.avgClass12.toFixed(1)}%`}
          description="Senior secondary performance"
          icon={BookOpen}
        />
        <StatCard
          title="Average Class 10"
          value={`${academicStats.avgClass10.toFixed(1)}%`}
          description="Secondary education performance"
          icon={Target}
        />
        <StatCard
          title="Total Students"
          value={students?.length || 0}
          description="Students in current batch"
          icon={Users}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UG Grade Distribution */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              UG Grade Distribution
            </CardTitle>
            <CardDescription>
              Distribution of undergraduate percentage scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={academicStats.ugDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {academicStats.ugDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top UG Programs */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top UG Programs
            </CardTitle>
            <CardDescription>
              Most common undergraduate programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={academicStats.topPrograms}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="program" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top Academic Performers
          </CardTitle>
          <CardDescription>
            Students with highest undergraduate scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicStats.topPerformers.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}