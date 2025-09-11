import { useParams, useNavigate } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award,
  FileText,
  Users,
  Languages,
  Download,
  Printer
} from "lucide-react";

export default function StudentProfile() {
  const { rollNo } = useParams<{ rollNo: string }>();
  const navigate = useNavigate();
  const { data: students, isLoading } = useStudents();
  
  const student = rollNo ? students.find(s => s.rollNo === rollNo) : null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Student Not Found</h1>
          <p className="text-muted-foreground">The student with roll number "{rollNo}" was not found.</p>
        </div>
        <Button onClick={() => navigate('/students')} className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }

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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob.split('/').reverse().join('-'));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const printProfile = () => {
    window.print();
  };

  const exportProfile = () => {
    const profileData = {
      personalInfo: {
        name: student.name,
        rollNo: student.rollNo,
        email: student.personalEmail,
        phone: student.phone,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        age: calculateAge(student.dateOfBirth),
        state: student.state,
        bloodGroup: student.bloodGroup
      },
      academics: {
        ugProgram: student.ugProgram,
        ugBranch: student.ugBranch,
        ugPercentage: student.ugPercentage,
        ugBoard: student.ugBoard,
        ugEndYear: student.ugEndYear,
        class12Percentage: student.class12Percentage,
        class12YOP: student.class12YOP,
        class10Percentage: student.class10Percentage,
        class10YOP: student.class10YOP
      },
      workExperience: {
        totalExperience: student.totalExperience,
        company1: student.workExperience1Company,
        title1: student.workExperience1Title,
        duration1: student.workExperience1Duration,
        company2: student.workExperience2Company,
        title2: student.workExperience2Title,
        duration2: student.workExperience2Duration
      },
      internship: {
        company: student.internshipCompany,
        title: student.internshipJobTitle,
        duration: student.internshipDuration
      },
      achievements: student.achievements,
      languages: student.languages
    };

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.rollNo}_profile.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/students')}
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={printProfile} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Profile
          </Button>
          <Button onClick={exportProfile} className="btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="dashboard-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <Avatar className="w-32 h-32 border-4 border-secondary/20">
              <AvatarImage src={student.profileImage} alt={student.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                  {student.name}
                </h1>
                <p className="text-xl text-muted-foreground font-mono">
                  {student.rollNo}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="badge-professional text-base px-4 py-2">
                  {student.gender}
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {formatExperience(student.totalExperience)}
                </Badge>
                <Badge variant="outline" className="text-base px-4 py-2">
                  Age: {calculateAge(student.dateOfBirth)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Personal Email</p>
                    <p className="font-medium">{student.personalEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  {student.dateOfBirth}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{calculateAge(student.dateOfBirth)} years</p>
              </div>
            </div>
            
            {student.state && (
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  {student.state}
                </p>
              </div>
            )}
            
            {student.bloodGroup && (
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{student.bloodGroup}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">College Email</p>
              <p className="font-medium">{student.collegeEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              Academic Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Undergraduate Program</p>
              <p className="font-medium">{student.ugProgram}</p>
              {student.ugBranch && (
                <p className="text-sm text-muted-foreground">Specialization: {student.ugBranch}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">UG Percentage</p>
                <p className="font-medium text-lg">{typeof student.ugPercentage === 'number' ? `${student.ugPercentage}%` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Graduation Year</p>
                <p className="font-medium">{student.ugEndYear}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">University/Board</p>
              <p className="font-medium">{student.ugBoard}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Class 12</p>
                <p className="font-medium">{typeof student.class12Percentage === 'number' ? `${student.class12Percentage}% (${student.class12YOP})` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class 10</p>
                <p className="font-medium">{typeof student.class10Percentage === 'number' ? `${student.class10Percentage}% (${student.class10YOP})` : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        {(student.totalExperience > 0 || student.workExperience1Company) && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-secondary" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Experience</p>
                <p className="font-medium text-lg">{formatExperience(student.totalExperience)}</p>
              </div>

              {student.workExperience1Company && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Current/Recent Position</h4>
                    <div>
                      <p className="font-medium">{student.workExperience1Title}</p>
                      <p className="text-sm text-muted-foreground">{student.workExperience1Company}</p>
                      <p className="text-sm text-muted-foreground">Duration: {student.workExperience1Duration} months</p>
                    </div>
                  </div>
                </>
              )}

              {student.workExperience2Company && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Previous Position</h4>
                    <div>
                      <p className="font-medium">{student.workExperience2Title}</p>
                      <p className="text-sm text-muted-foreground">{student.workExperience2Company}</p>
                      <p className="text-sm text-muted-foreground">Duration: {student.workExperience2Duration} months</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Internship Details */}
        {student.internshipCompany && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                Internship Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{student.internshipJobTitle}</p>
                <p className="text-sm text-muted-foreground">{student.internshipCompany}</p>
                <p className="text-sm text-muted-foreground">Duration: {student.internshipDuration}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {student.languages && student.languages.length > 0 && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-secondary" />
                Languages Known
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.languages.map((language, index) => (
                  <Badge key={index} variant="outline" className="badge-professional">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {student.achievements && student.achievements.length > 0 && (
          <Card className="dashboard-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Achievements & Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {student.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}