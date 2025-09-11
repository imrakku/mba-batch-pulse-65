import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { StudentCard } from "@/components/StudentCard";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { SmartDashboardWidgets } from "@/components/SmartDashboardWidgets";
import { ProfessionalExperience } from "@/components/ProfessionalExperience";
import { CollaborationHub } from "@/components/CollaborationHub";
import { AIChatBox } from "@/components/AIChatBox";
import { useStudents } from "@/hooks/useStudents";
import { useAdvancedFiltering } from "@/hooks/useAdvancedFiltering";
import { Student, BatchStatistics, FilterOptions } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/mba-dashboard-hero.jpg";
import { Users, GraduationCap, Briefcase, UserCheck, BookOpen, TrendingUp, BarChart3, MessageCircle, Settings } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
export default function Dashboard() {
  const {
    data: students,
    isLoading
  } = useStudents();
  const [stats, setStats] = useState<BatchStatistics | null>(null);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const filteredStudents = useAdvancedFiltering(students || [], filters);
  useEffect(() => {
    const list = students || [];
    const totalStudents = list.length;
    if (totalStudents === 0) {
      setStats(null);
      setRecentStudents([]);
      return;
    }
    const maleCount = list.filter(s => s.gender === 'MALE').length;
    const femaleCount = list.filter(s => s.gender === 'FEMALE').length;
    const specializationDist: Record<string, number> = {};
    const stateDist: Record<string, number> = {};
    list.forEach(student => {
      const spec = student.ugBranch || student.ugProgram || 'General';
      specializationDist[spec] = (specializationDist[spec] || 0) + 1;
      if (student.state) stateDist[student.state] = (stateDist[student.state] || 0) + 1;
    });
    const definedUG = list.filter(s => typeof s.ugPercentage === 'number');
    const avgUGPercentage = definedUG.length ? definedUG.reduce((sum, s) => sum + (s.ugPercentage as number), 0) / definedUG.length : 0;
    const experiencedCount = list.filter(s => (s.totalExperience || 0) > 0).length;
    const fresherCount = totalStudents - experiencedCount;
    setStats({
      totalStudents,
      genderDistribution: {
        male: maleCount,
        female: femaleCount
      },
      specializationDistribution: specializationDist,
      stateDistribution: stateDist,
      averageUGPercentage: Math.round(avgUGPercentage * 100) / 100,
      experienceDistribution: {
        fresher: fresherCount,
        experienced: experiencedCount
      },
      internshipIndustries: {}
    });
    setRecentStudents(list.slice(0, 6));
  }, [students]);
  if (isLoading || !stats) return <div>Loading...</div>;
  return <div className="space-y-8 animate-fade-in">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Original Dashboard Content */}
          <section className="hero-section rounded-xl p-8 text-center relative overflow-hidden" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
            <div className="max-w-3xl mx-auto relative z-10">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white">
                MBA 2027 Batch Dashboard
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Comprehensive insights into our exceptional cohort of {stats.totalStudents} future business leaders
              </p>
            </div>
          </section>

          {/* Key Statistics */}  
          <section>
            <h2 className="font-heading text-2xl font-semibold mb-6">Key Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Students" value={stats.totalStudents} description="Active MBA students" icon={Users} />
              <StatCard title="Average UG Score" value={`${stats.averageUGPercentage}%`} description="Undergraduate performance" icon={GraduationCap} />
              <StatCard title="Work Experience" value={`${stats.experienceDistribution.experienced}`} description="Students with experience" icon={Briefcase} />
              <StatCard title="Gender Diversity" value={`${Math.round(stats.genderDistribution.female / stats.totalStudents * 100)}%`} description="Female representation" icon={UserCheck} />
            </div>
          </section>

          {/* Featured Students */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-semibold">Featured Students</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentStudents.map(student => <StudentCard key={student.id} student={student} />)}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="experience">
          <ProfessionalExperience />
        </TabsContent>

        <TabsContent value="collaboration">
          <CollaborationHub />
        </TabsContent>

        <TabsContent value="widgets">
          <SmartDashboardWidgets />
        </TabsContent>

        <TabsContent value="search">
          <AdvancedSearch filters={filters} onFiltersChange={setFilters} />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudents.slice(0, 10).map(student => <StudentCard key={student.id} student={student} />)}
          </div>
        </TabsContent>

        <TabsContent value="ai-chat">
          <AIChatBox />
        </TabsContent>
      </Tabs>
    </div>;
}