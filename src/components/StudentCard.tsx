import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@/types/student";
import { Mail, Phone, GraduationCap, Briefcase, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StudentCardProps {
  student: Student;
  className?: string;
}

export function StudentCard({ student, className }: StudentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatExperience = (months: number) => {
    if (months === 0) return "Fresher";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  return (
    <Link to={`/students/${student.rollNo}`}>
      <Card className={cn(
        "dashboard-card hover:shadow-professional-lg transition-all duration-300 cursor-pointer group",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16 border-2 border-secondary/20">
              <AvatarImage src={student.profileImage} alt={student.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {student.rollNo}
                  </p>
                </div>
                <Badge variant="outline" className="badge-professional">
                  {student.gender}
                </Badge>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground truncate">
                    {student.personalEmail}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground">
                    {student.phone}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground">
                    {student.ugProgram}
                    {typeof student.ugPercentage === 'number' ? ` (${student.ugPercentage}%)` : ''}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground">
                    {formatExperience(student.totalExperience)}
                  </span>
                </div>

                {student.state && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-muted-foreground">
                      {student.state}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground">
                    Age: {(() => {
                      const parts = student.dateOfBirth?.split('/') || [];
                      if (parts.length === 3) {
                        const year = parseInt(parts[2], 10);
                        return Number.isFinite(year) ? (new Date().getFullYear() - year) : '—';
                      }
                      return '—';
                    })()}
                  </span>
                </div>
              </div>

              {/* Specializations/Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {student.ugBranch && (
                  <Badge variant="secondary" className="text-xs">
                    {student.ugBranch}
                  </Badge>
                )}
                {student.workExperience1Company && (
                  <Badge variant="outline" className="text-xs">
                    Ex-{student.workExperience1Company}
                  </Badge>
                )}
                {student.achievements && student.achievements.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    {student.achievements.length} Achievement{student.achievements.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}