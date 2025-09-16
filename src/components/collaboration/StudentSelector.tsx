import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Hash, X } from "lucide-react";
import { Student } from "@/types/student";

interface StudentTag {
  id: string;
  studentId: number;
  tag: string;
  color: string;
  addedBy: string;
  addedAt: Date;
}

interface StudentSelectorProps {
  students?: Student[];
  selectedStudent: number | null;
  onStudentChange: (studentId: number | null) => void;
  studentTags: StudentTag[];
  onRemoveTag: (tagId: string) => void;
  notesCount: number;
}

export function StudentSelector({ 
  students, 
  selectedStudent, 
  onStudentChange, 
  studentTags, 
  onRemoveTag,
  notesCount 
}: StudentSelectorProps) {
  const selectedStudentData = students?.find(s => s.id === selectedStudent);
  const studentTagsFiltered = studentTags.filter(t => t.studentId === selectedStudent);

  const getTagColor = (color: string) => {
    switch (color) {
      case 'success': return 'bg-success/20 text-success border-success/30 hover:bg-success/30';
      case 'warning': return 'bg-warning/20 text-warning border-warning/30 hover:bg-warning/30';
      case 'primary': return 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30';
      default: return 'bg-secondary/20 text-secondary border-secondary/30 hover:bg-secondary/30';
    }
  };

  return (
    <Card className="dashboard-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Users className="h-5 w-5 text-primary" />
          Select Student
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedStudent?.toString() || ""}
          onValueChange={(value) => onStudentChange(parseInt(value))}
        >
          <SelectTrigger className="hover:border-primary/50 transition-colors">
            <SelectValue placeholder="Choose a student..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border z-50">
            {students?.slice(0, 20).map((student) => (
              <SelectItem 
                key={student.id} 
                value={student.id.toString()}
                className="hover:bg-accent focus:bg-accent"
              >
                {student.name} ({student.rollNo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStudentData && (
          <div className="mt-4 p-4 bg-gradient-to-br from-card to-muted/20 rounded-lg border border-border/50 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedStudentData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">{selectedStudentData.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedStudentData.rollNo} • {selectedStudentData.course}
                </div>
              </div>
            </div>
            
            {/* Student Tags */}
            {studentTagsFiltered.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {studentTagsFiltered.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`text-xs transition-all duration-200 cursor-pointer ${getTagColor(tag.color)}`}
                    onClick={() => onRemoveTag(tag.id)}
                    title="Click to remove tag"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag.tag}
                    <X className="h-3 w-3 ml-1 opacity-70 hover:opacity-100" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-accent/30 rounded-md">
                <div className="text-xs text-muted-foreground">UG Percentage</div>
                <div className="font-semibold">
                  {selectedStudentData.ugPercentage != null ? `${selectedStudentData.ugPercentage}%` : '—'}
                </div>
              </div>
              <div className="p-2 bg-accent/30 rounded-md">
                <div className="text-xs text-muted-foreground">Experience</div>
                <div className="font-semibold">{selectedStudentData.totalExperience || 0} months</div>
              </div>
              <div className="p-2 bg-accent/30 rounded-md">
                <div className="text-xs text-muted-foreground">Notes</div>
                <div className="font-semibold">{notesCount}</div>
              </div>
              <div className="p-2 bg-accent/30 rounded-md">
                <div className="text-xs text-muted-foreground">Tags</div>
                <div className="font-semibold">{studentTagsFiltered.length}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}