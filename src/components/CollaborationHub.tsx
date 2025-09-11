import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Tag, 
  Users, 
  Mail, 
  Plus,
  Edit3,
  Archive,
  Hash,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";

interface Note {
  id: string;
  studentId: number;
  content: string;
  author: string;
  timestamp: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface StudentTag {
  id: string;
  studentId: number;
  tag: string;
  color: string;
  addedBy: string;
  addedAt: Date;
}

export function CollaborationHub() {
  const { data: students } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // State management with localStorage persistence
  const [notes, setNotes] = useState<Note[]>([]);
  const [studentTags, setStudentTags] = useState<StudentTag[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('collaboration-notes');
    const savedTags = localStorage.getItem('collaboration-tags');
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        timestamp: new Date(note.timestamp)
      }));
      setNotes(parsedNotes);
    } else {
      // Initialize with some sample data
      const initialNotes = [
        {
          id: '1',
          studentId: 1,
          content: 'Excellent performance in group projects. Shows strong leadership potential.',
          author: 'Dr. Sarah Johnson',
          timestamp: new Date('2024-02-15'),
          tags: ['leadership', 'performance'],
          priority: 'high' as const
        },
        {
          id: '2',
          studentId: 1,
          content: 'Needs additional support in quantitative subjects.',
          author: 'Prof. Michael Chen',
          timestamp: new Date('2024-02-10'),
          tags: ['academics', 'support-needed'],
          priority: 'medium' as const
        }
      ];
      setNotes(initialNotes);
      localStorage.setItem('collaboration-notes', JSON.stringify(initialNotes));
    }

    if (savedTags) {
      const parsedTags = JSON.parse(savedTags).map((tag: any) => ({
        ...tag,
        addedAt: new Date(tag.addedAt)
      }));
      setStudentTags(parsedTags);
    } else {
      // Initialize with some sample data
      const initialTags = [
        {
          id: '1',
          studentId: 1,
          tag: 'high-potential',
          color: 'success',
          addedBy: 'Dr. Sarah Johnson',
          addedAt: new Date('2024-02-01')
        },
        {
          id: '2',
          studentId: 1,
          tag: 'needs-mentoring',
          color: 'warning',
          addedBy: 'Prof. Michael Chen',
          addedAt: new Date('2024-02-05')
        }
      ];
      setStudentTags(initialTags);
      localStorage.setItem('collaboration-tags', JSON.stringify(initialTags));
    }
  }, []);

  // Save to localStorage whenever notes or tags change
  useEffect(() => {
    localStorage.setItem('collaboration-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('collaboration-tags', JSON.stringify(studentTags));
  }, [studentTags]);

  const selectedStudentData = students?.find(s => s.id === selectedStudent);
  
  // Filter and search functionality
  const filteredNotes = notes
    .filter(n => n.studentId === selectedStudent)
    .filter(n => filterPriority === 'all' || n.priority === filterPriority)
    .filter(n => 
      searchQuery === '' || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const studentTagsFiltered = studentTags.filter(t => t.studentId === selectedStudent);

  // CRUD Operations
  const addNote = () => {
    if (!newNote.trim() || !selectedStudent) return;

    const note: Note = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      content: newNote.trim(),
      author: 'Current User', // In real app, this would be from auth context
      timestamp: new Date(),
      tags: [],
      priority: notePriority
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setNotePriority('medium');
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content: content.trim() } : note
    ));
    setEditingNoteId(null);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const addTag = (tagName: string = newTag) => {
    if (!tagName.trim() || !selectedStudent) return;

    const tag: StudentTag = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      tag: tagName.trim().toLowerCase().replace(/\s+/g, '-'),
      color: 'primary',
      addedBy: 'Current User',
      addedAt: new Date()
    };

    setStudentTags(prev => [tag, ...prev]);
    setNewTag('');
  };

  const removeTag = (tagId: string) => {
    setStudentTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTagColor = (color: string) => {
    switch (color) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'primary': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  };

  const bulkActions = [
    { id: 'email', label: 'Send Bulk Email', icon: Mail },
    { id: 'tag', label: 'Add Bulk Tags', icon: Tag },
    { id: 'export', label: 'Export Selected', icon: Archive },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Collaboration Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bulkActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Select Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedStudent?.toString() || ""}
              onValueChange={(value) => setSelectedStudent(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {students?.slice(0, 20).map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} ({student.rollNo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStudentData && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedStudentData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedStudentData.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedStudentData.rollNo} • {selectedStudentData.course}
                    </div>
                  </div>
                </div>
                
                {/* Student Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {studentTagsFiltered.map((tag) => (
                    <Badge
                      key={tag.id}
                      className={`text-xs ${getTagColor(tag.color)} cursor-pointer hover:opacity-80`}
                      onClick={() => removeTag(tag.id)}
                      title="Click to remove tag"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>UG: {selectedStudentData.ugPercentage != null ? `${selectedStudentData.ugPercentage}%` : '—'}</div>
                  <div>Exp: {selectedStudentData.totalExperience || 0}yr</div>
                  <div>Notes: {notes.filter(n => n.studentId === selectedStudent).length}</div>
                  <div>Tags: {studentTagsFiltered.length}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes & Communications */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <>
              {/* Add New Note */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    Add Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add a note about this student..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center gap-4">
                    <Select
                      value={notePriority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => setNotePriority(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={addNote} disabled={!newNote.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add Tag */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Manage Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter tag name..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={() => addTag()} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Quick tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {['high-potential', 'needs-support', 'leadership', 'technical-skills', 'communication'].map((tag) => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes List with Search and Filters */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Notes & Comments ({filteredNotes.length})
                  </CardTitle>
                  
                  {/* Search and Filter Controls */}
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {note.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{note.author}</span>
                            <Badge variant={getPriorityColor(note.priority)} className="text-xs">
                              {note.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {note.timestamp.toLocaleDateString()}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNoteId(editingNoteId === note.id ? null : note.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <Textarea
                              defaultValue={note.content}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  updateNote(note.id, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  setEditingNoteId(null);
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                  updateNote(note.id, textarea.value);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mb-2">{note.content}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {filteredNotes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>
                          {searchQuery || filterPriority !== 'all' 
                            ? 'No notes match your search criteria.' 
                            : 'No notes yet. Add the first note above.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="dashboard-card">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a student to view and manage notes and tags</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}