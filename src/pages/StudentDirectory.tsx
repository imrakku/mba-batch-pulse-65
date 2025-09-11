import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentCard } from "@/components/StudentCard";
import { useStudents } from "@/hooks/useStudents";
import { Search, Filter, Download, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function StudentDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const { data: students, isLoading } = useStudents();

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.personalEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;
      
      const matchesExperience = experienceFilter === "all" ||
                               (experienceFilter === "fresher" && student.totalExperience === 0) ||
                               (experienceFilter === "experienced" && student.totalExperience > 0);

      return matchesSearch && matchesGender && matchesExperience;
    });

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rollNo":
          return a.rollNo.localeCompare(b.rollNo);
        case "ugPercentage":
          return b.ugPercentage - a.ugPercentage;
        case "experience":
          return b.totalExperience - a.totalExperience;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, genderFilter, experienceFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("all");
    setExperienceFilter("all");
    setSortBy("name");
  };

  const exportData = () => {
    // Simple CSV export functionality
    const headers = ["Roll No", "Name", "Email", "Phone", "Gender", "UG Program", "UG %", "Experience (months)"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedStudents.map(student => [
        student.rollNo,
        `"${student.name}"`,
        student.personalEmail,
        student.phone,
        student.gender,
        `"${student.ugProgram}"`,
        student.ugPercentage,
        student.totalExperience
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mba2027_students.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Student Directory</h1>
          <p className="text-muted-foreground">Browse and search through our MBA 2027 batch</p>
        </div>
        <Button onClick={exportData} className="btn-secondary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-secondary" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 search-input"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="fresher">Freshers</SelectItem>
                <SelectItem value="experienced">Experienced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rollNo">Roll Number</SelectItem>
                <SelectItem value="ugPercentage">UG Percentage</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="ml-1 text-xs">×</button>
              </Badge>
            )}
            {genderFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Gender: {genderFilter}
                <button onClick={() => setGenderFilter("all")} className="ml-1 text-xs">×</button>
              </Badge>
            )}
            {experienceFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Experience: {experienceFilter}
                <button onClick={() => setExperienceFilter("all")} className="ml-1 text-xs">×</button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {filteredAndSortedStudents.length} of {students.length} students
          </span>
        </div>
      </div>

      {/* Student Grid */}
      {filteredAndSortedStudents.length === 0 ? (
        <Card className="dashboard-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search criteria or clearing the filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}