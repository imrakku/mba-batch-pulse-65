import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  MessageCircle, 
  Tag, 
  Users,
  Mail,
  Archive,
  Brain,
  Calendar,
  Plus,
  Edit3,
  Hash,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit,
  X,
  Paperclip,
  AtSign,
  FileText,
  Target,
  CheckSquare,
  Star,
  Download,
  Share2,
  AlertCircle,
  Send,
  Video,
  Phone,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Upload,
  Eye,
  History,
  Bookmark,
  Award,
  Lightbulb,
  Settings,
  RefreshCw,
  Filter as FilterIcon
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { CollaborationTabs } from "./collaboration/CollaborationTabs";
import { StudentSelector } from "./collaboration/StudentSelector";
import { QuickActions } from "./collaboration/QuickActions";
import { NotificationBar } from "./collaboration/NotificationBar";
import { NotesSection } from "./collaboration/NotesSection";

interface Note {
  id: string;
  studentId: number;
  content: string;
  author: string;
  timestamp: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up';
  attachments?: string[];
  mentions?: string[];
  isPrivate?: boolean;
}

interface StudentTag {
  id: string;
  studentId: number;
  tag: string;
  color: string;
  addedBy: string;
  addedAt: Date;
}

interface Assignment {
  id: string;
  studentId: number;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

interface ChatMessage {
  id: string;
  studentId: number;
  message: string;
  author: string;
  timestamp: Date;
  type: 'text' | 'file' | 'meeting';
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface Meeting {
  id: string;
  studentId: number;
  title: string;
  description: string;
  scheduledBy: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  participants: string[];
}

interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface ProgressMetric {
  id: string;
  studentId: number;
  metric: string;
  value: number;
  target: number;
  date: Date;
  category: 'academic' | 'behavioral' | 'engagement' | 'attendance';
}

interface SmartRecommendation {
  id: string;
  studentId: number;
  type: 'action' | 'meeting' | 'follow-up' | 'resource';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  suggestedDate?: Date;
}

export function CollaborationHub() {
  const { data: students } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [noteCategory, setNoteCategory] = useState<'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  
  // New feature states
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'files' | 'meetings' | 'analytics' | 'timeline'>('notes');
  const [chatMessage, setChatMessage] = useState('');
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newMeeting, setNewMeeting] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    startTime: '', 
    endTime: '',
    participants: [] as string[]
  });
  const [advancedSearch, setAdvancedSearch] = useState({
    dateFrom: '',
    dateTo: '',
    authors: [] as string[],
    hasAttachments: false
  });

  // State management with localStorage persistence
  const [notes, setNotes] = useState<Note[]>([]);
  const [studentTags, setStudentTags] = useState<StudentTag[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

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
          priority: 'high' as const,
          category: 'academic' as const
        },
        {
          id: '2',
          studentId: 1,
          content: 'Needs additional support in quantitative subjects.',
          author: 'Prof. Michael Chen',
          timestamp: new Date('2024-02-10'),
          tags: ['academics', 'support-needed'],
          priority: 'medium' as const,
          category: 'academic' as const
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
    .filter(n => filterCategory === 'all' || n.category === filterCategory)
    .filter(n => 
      searchQuery === '' || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const studentTagsFiltered = studentTags.filter(t => t.studentId === selectedStudent);

  // Helper functions
  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    toast[type](message);
  };

  // Initialize templates
  useEffect(() => {
    if (templates.length === 0) {
      const initialTemplates: NoteTemplate[] = [
        {
          id: '1',
          name: 'Weekly Check-in',
          content: 'Weekly progress update:\n• Academic performance:\n• Behavioral observations:\n• Next steps:',
          category: 'meeting',
          priority: 'medium',
          tags: ['weekly', 'progress']
        },
        {
          id: '2',
          name: 'Academic Support',
          content: 'Academic support needed:\n• Subject areas requiring attention:\n• Recommended resources:\n• Timeline for improvement:',
          category: 'academic',
          priority: 'high',
          tags: ['support', 'academic']
        },
        {
          id: '3',
          name: 'Follow-up Action',
          content: 'Follow-up required:\n• Previous discussion summary:\n• Action items:\n• Deadline:',
          category: 'follow-up',
          priority: 'medium',
          tags: ['follow-up', 'action']
        }
      ];
      setTemplates(initialTemplates);
    }
  }, [templates.length]);

  // Initialize smart recommendations
  useEffect(() => {
    if (selectedStudent && recommendations.filter(r => r.studentId === selectedStudent).length === 0) {
      const studentNotes = notes.filter(n => n.studentId === selectedStudent);
      const newRecommendations: SmartRecommendation[] = [];
      
      // Generate recommendations based on note patterns
      if (studentNotes.some(n => n.content.toLowerCase().includes('support'))) {
        newRecommendations.push({
          id: Date.now().toString(),
          studentId: selectedStudent,
          type: 'meeting',
          title: 'Schedule Support Meeting',
          description: 'Multiple notes mention support needs. Consider scheduling a one-on-one meeting.',
          priority: 'high',
          confidence: 0.85,
          suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
      
      if (studentNotes.length > 5) {
        newRecommendations.push({
          id: (Date.now() + 1).toString(),
          studentId: selectedStudent,
          type: 'action',
          title: 'Progress Review',
          description: 'High activity detected. Time for a comprehensive progress review.',
          priority: 'medium',
          confidence: 0.75
        });
      }
      
      setRecommendations(prev => [...prev, ...newRecommendations]);
    }
  }, [selectedStudent, notes, recommendations]);

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !selectedStudent) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      message: chatMessage.trim(),
      author: 'Current User',
      timestamp: new Date(),
      type: 'text'
    };
    
    setChatMessages(prev => [message, ...prev]);
    setChatMessage('');
    addNotification('Message sent', 'success');
  };

  const scheduleMeeting = () => {
    if (!newMeeting.title.trim() || !selectedStudent) return;
    
    const meeting: Meeting = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      title: newMeeting.title.trim(),
      description: newMeeting.description.trim(),
      scheduledBy: 'Current User',
      startTime: new Date(`${newMeeting.date} ${newMeeting.startTime}`),
      endTime: new Date(`${newMeeting.date} ${newMeeting.endTime}`),
      status: 'scheduled',
      participants: [selectedStudentData?.name || '', ...newMeeting.participants]
    };
    
    setMeetings(prev => [meeting, ...prev]);
    setNewMeeting({ title: '', description: '', date: '', startTime: '', endTime: '', participants: [] });
    setShowMeetingDialog(false);
    addNotification(`Meeting "${meeting.title}" scheduled`, 'success');
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewNote(template.content);
      setNoteCategory(template.category as any);
      setNotePriority(template.priority);
      setShowTemplateDialog(false);
      addNotification(`Template "${template.name}" applied`, 'info');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedStudent) return;
    
    Array.from(files).forEach(file => {
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedBy: 'Current User',
        uploadedAt: new Date()
      };
      setFileAttachments(prev => [attachment, ...prev]);
    });
    
    addNotification(`${files.length} file(s) uploaded`, 'success');
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelection = new Set(selectedNotes);
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId);
    } else {
      newSelection.add(noteId);
    }
    setSelectedNotes(newSelection);
  };

  const handleBulkEmail = () => {
    if (selectedNotes.size === 0) return;
    const selectedNotesData = notes.filter(note => selectedNotes.has(note.id));
    addNotification(`Bulk email sent for ${selectedNotes.size} notes`, 'success');
    setSelectedNotes(new Set());
  };

  const handleBulkTag = (tagName: string) => {
    if (selectedNotes.size === 0) return;
    selectedNotes.forEach(noteId => {
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, tags: [...note.tags, tagName] }
          : note
      ));
    });
    addNotification(`Tag "${tagName}" added to ${selectedNotes.size} notes`, 'success');
    setSelectedNotes(new Set());
  };

  const handleBulkExport = () => {
    if (selectedNotes.size === 0) return;
    const selectedNotesData = notes.filter(note => selectedNotes.has(note.id));
    const exportData = JSON.stringify(selectedNotesData, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification(`Exported ${selectedNotes.size} notes`, 'success');
    setSelectedNotes(new Set());
  };

  const createAssignment = () => {
    if (!newAssignment.title.trim() || !selectedStudent) return;
    
    const assignment: Assignment = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      title: newAssignment.title.trim(),
      description: newAssignment.description.trim(),
      assignedBy: 'Current User',
      assignedTo: newAssignment.assignedTo || selectedStudentData?.name || '',
      dueDate: new Date(newAssignment.dueDate),
      status: 'pending',
      priority: 'medium'
    };
    
    setAssignments(prev => [assignment, ...prev]);
    setNewAssignment({ title: '', description: '', assignedTo: '', dueDate: '' });
    setShowAssignmentDialog(false);
    addNotification(`Assignment "${assignment.title}" created`, 'success');
  };

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
      priority: notePriority,
      category: noteCategory
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setNotePriority('medium');
    setNoteCategory('general');
    
    // Add notification
    addNotification(`New ${noteCategory} note added for ${selectedStudentData?.name}`, 'success');
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
    { id: 'email', label: 'Send Bulk Email', icon: Mail, action: handleBulkEmail },
    { id: 'tag', label: 'Add Bulk Tags', icon: Tag, action: () => handleBulkTag('bulk-action') },
    { id: 'export', label: 'Export Selected', icon: Archive, action: handleBulkExport },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notifications Bar */}
      <NotificationBar 
        notifications={notifications}
        onDismiss={() => setNotifications(prev => prev.slice(1))}
      />

      {/* Quick Actions */}
      <QuickActions
        selectedNotesCount={selectedNotes.size}
        selectedStudent={selectedStudent}
        onBulkEmail={handleBulkEmail}
        onBulkTag={() => handleBulkTag('bulk-action')}
        onBulkExport={handleBulkExport}
        onCreateAssignment={() => setShowAssignmentDialog(true)}
      />

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gradient">Create New Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Assignment title..."
              value={newAssignment.title}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
              className="focus:ring-primary/20"
            />
            <Textarea
              placeholder="Assignment description..."
              value={newAssignment.description}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
              className="focus:ring-primary/20"
            />
            <Input
              type="date"
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
              className="focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <Button 
                onClick={createAssignment} 
                disabled={!newAssignment.title.trim()}
                className="flex-1 hover:scale-105 transition-all duration-200"
              >
                Create Assignment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAssignmentDialog(false)}
                className="hover:scale-105 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <StudentSelector
          students={students}
          selectedStudent={selectedStudent}
          onStudentChange={setSelectedStudent}
          studentTags={studentTags}
          onRemoveTag={removeTag}
          notesCount={notes.filter(n => n.studentId === selectedStudent).length}
        />

        {/* Advanced Collaboration Hub */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <>
              {/* Tab Navigation */}
              <Card className="dashboard-card animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <span className="text-gradient">Collaboration Hub</span>
                    </CardTitle>
                    {recommendations.filter(r => r.studentId === selectedStudent).length > 0 && (
                      <Badge variant="secondary" className="animate-pulse">
                        <Brain className="h-3 w-3 mr-1" />
                        {recommendations.filter(r => r.studentId === selectedStudent).length} AI Suggestions
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <CollaborationTabs 
                      activeTab={activeTab}
                      onTabChange={(tab) => setActiveTab(tab as any)}
                    />
                  </div>
                </CardHeader>
              </Card>

              {/* Smart Recommendations */}
              <SmartRecommendations
                recommendations={recommendations}
                studentId={selectedStudent}
                onApplyRecommendation={(id) => {
                  addNotification('Recommendation applied successfully', 'success');
                  setRecommendations(prev => prev.filter(r => r.id !== id));
                }}
              />

              {/* Tab Content */}
              {activeTab === 'notes' && (
                <NotesSection
                  notes={notes}
                  selectedStudent={selectedStudent}
                  newNote={newNote}
                  setNewNote={setNewNote}
                  notePriority={notePriority}
                  setNotePriority={setNotePriority}
                  noteCategory={noteCategory}
                  setNoteCategory={setNoteCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterPriority={filterPriority}
                  setFilterPriority={setFilterPriority}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  editingNoteId={editingNoteId}
                  setEditingNoteId={setEditingNoteId}
                  selectedNotes={selectedNotes}
                  toggleNoteSelection={toggleNoteSelection}
                  templates={templates}
                  onAddNote={addNote}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onApplyTemplate={applyTemplate}
                  onAddTag={(noteId, tag) => {
                    setNotes(prev => prev.map(note => 
                      note.id === noteId 
                        ? { ...note, tags: [...note.tags, tag] }
                        : note
                    ));
                  }}
                  addNotification={addNotification}
                />
              )}
                <>
                  {/* Add New Note with Templates */}
                  <Card className="dashboard-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-primary" />
                          Add Note
                        </div>
                        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Bookmark className="h-4 w-4 mr-2" />
                              Templates
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Choose Template</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              {templates.map((template) => (
                                <div key={template.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => applyTemplate(template.id)}>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-sm text-muted-foreground">{template.content.substring(0, 100)}...</div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Add a note about this student... Use @mentions for collaborative notes"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        <Select
                          value={notePriority}
                          onValueChange={(value: 'low' | 'medium' | 'high') => setNotePriority(value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={noteCategory}
                          onValueChange={(value: 'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up') => setNoteCategory(value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            <SelectItem value="general">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                General
                              </div>
                            </SelectItem>
                            <SelectItem value="academic">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Academic
                              </div>
                            </SelectItem>
                            <SelectItem value="behavioral">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Behavioral
                              </div>
                            </SelectItem>
                            <SelectItem value="meeting">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Meeting
                              </div>
                            </SelectItem>
                            <SelectItem value="follow-up">
                              <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" />
                                Follow-up
                              </div>
                            </SelectItem>
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
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notes, tags, authors..."
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
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Bulk Actions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {showBulkActions && (
                              <Checkbox
                                checked={selectedNotes.has(note.id)}
                                onCheckedChange={() => toggleNoteSelection(note.id)}
                              />
                            )}
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {note.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{note.author}</span>
                            <Badge variant={getPriorityColor(note.priority)} className="text-xs">
                              {note.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {note.category}
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
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Real-time Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-muted/20">
                      {chatMessages.filter(m => m.studentId === selectedStudent).map((message) => (
                        <div key={message.id} className="mb-3 p-2 bg-background rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.author}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <Button onClick={sendChatMessage} disabled={!chatMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-primary" />
                      File Management
                    </div>
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fileAttachments.filter(f => f.uploadedBy === 'Current User').map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB • {file.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Meeting Scheduler
                    </div>
                    <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule New Meeting</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Meeting title..."
                            value={newMeeting.title}
                            onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                          />
                          <Textarea
                            placeholder="Meeting description..."
                            value={newMeeting.description}
                            onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              type="date"
                              value={newMeeting.date}
                              onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                            />
                            <Input
                              type="time"
                              value={newMeeting.startTime}
                              onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                            <Input
                              type="time"
                              value={newMeeting.endTime}
                              onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                          <Button onClick={scheduleMeeting} disabled={!newMeeting.title.trim()}>
                            Schedule Meeting
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meetings.filter(m => m.studentId === selectedStudent).map((meeting) => (
                      <div key={meeting.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{meeting.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {meeting.startTime.toLocaleDateString()} at {meeting.startTime.toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{meeting.description}</div>
                          </div>
                          <Badge variant={meeting.status === 'scheduled' ? 'secondary' : 'default'}>
                            {meeting.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Student Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold">{notes.filter(n => n.studentId === selectedStudent).length}</div>
                      <div className="text-sm text-muted-foreground">Total Notes</div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold">{meetings.filter(m => m.studentId === selectedStudent).length}</div>
                      <div className="text-sm text-muted-foreground">Meetings Scheduled</div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold">{studentTagsFiltered.length}</div>
                      <div className="text-sm text-muted-foreground">Active Tags</div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold">{chatMessages.filter(m => m.studentId === selectedStudent).length}</div>
                      <div className="text-sm text-muted-foreground">Chat Messages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...notes.filter(n => n.studentId === selectedStudent), 
                      ...chatMessages.filter(m => m.studentId === selectedStudent).map(m => ({ ...m, category: 'chat' as const })),
                      ...meetings.filter(m => m.studentId === selectedStudent).map(m => ({ ...m, timestamp: m.startTime, category: 'meeting' as const }))]
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .slice(0, 10)
                      .map((item: any) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="mt-1">
                          {item.category === 'chat' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                          {item.category === 'meeting' && <Calendar className="h-4 w-4 text-green-500" />}
                          {!item.category && <FileText className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {item.category === 'chat' ? 'Chat Message' : 
                               item.category === 'meeting' ? 'Meeting' : 
                               `${item.category} Note`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.content || item.message || item.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            </>
          ) : (
            <Card className="dashboard-card">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a student to view and manage collaboration features</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}