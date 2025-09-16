import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
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
  Star,
  Bookmark,
  Award,
  Filter as FilterIcon
} from "lucide-react";

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

interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface NotesSectionProps {
  notes: Note[];
  selectedStudent: number;
  newNote: string;
  setNewNote: (note: string) => void;
  notePriority: 'low' | 'medium' | 'high';
  setNotePriority: (priority: 'low' | 'medium' | 'high') => void;
  noteCategory: 'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up';
  setNoteCategory: (category: 'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  selectedNotes: Set<string>;
  toggleNoteSelection: (noteId: string) => void;
  templates: NoteTemplate[];
  onAddNote: () => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onAddTag: (noteId: string, tag: string) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function NotesSection({
  notes,
  selectedStudent,
  newNote,
  setNewNote,
  notePriority,
  setNotePriority,
  noteCategory,
  setNoteCategory,
  searchQuery,
  setSearchQuery,
  filterPriority,
  setFilterPriority,
  filterCategory,
  setFilterCategory,
  editingNoteId,
  setEditingNoteId,
  selectedNotes,
  toggleNoteSelection,
  templates,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onApplyTemplate,
  onAddTag,
  addNotification
}: NotesSectionProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingContent, setEditingContent] = useState('');

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return FileText;
      case 'behavioral': return Star;
      case 'meeting': return Clock;
      case 'follow-up': return Award;
      default: return Hash;
    }
  };

  const handleEditStart = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleEditSave = (noteId: string) => {
    onUpdateNote(noteId, editingContent);
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleAddTag = (noteId: string) => {
    if (newTag.trim()) {
      onAddTag(noteId, newTag.trim());
      setNewTag('');
      addNotification('Tag added successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Note with Templates */}
      <Card className="dashboard-card animate-fade-in border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <span className="text-gradient">Create Note</span>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all duration-200">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-gradient">Choose Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent/30 hover:border-primary/30 transition-all duration-200 group" 
                      onClick={() => {
                        onApplyTemplate(template.id);
                        setShowTemplateDialog(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold group-hover:text-primary transition-colors">{template.name}</div>
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {template.content.substring(0, 120)}...
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a comprehensive note about this student... Use @mentions for collaborative notes"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[120px] resize-none focus:ring-primary/20 border-border/50 hover:border-primary/30 transition-colors"
          />
          
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              value={notePriority}
              onValueChange={(value: 'low' | 'medium' | 'high') => setNotePriority(value)}
            >
              <SelectTrigger className="w-36 hover:border-primary/30 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border z-50">
                <SelectItem value="low">🟢 Low Priority</SelectItem>
                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                <SelectItem value="high">🔴 High Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={noteCategory}
              onValueChange={(value: 'general' | 'academic' | 'behavioral' | 'meeting' | 'follow-up') => setNoteCategory(value)}
            >
              <SelectTrigger className="w-44 hover:border-primary/30 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border z-50">
                <SelectItem value="general">📝 General</SelectItem>
                <SelectItem value="academic">📚 Academic</SelectItem>
                <SelectItem value="behavioral">⭐ Behavioral</SelectItem>
                <SelectItem value="meeting">📅 Meeting</SelectItem>
                <SelectItem value="follow-up">🎯 Follow-up</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={onAddNote} 
              disabled={!newNote.trim()}
              className="ml-auto hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-primary-light"
            >
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="dashboard-card animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 hover:border-primary/30 focus:ring-primary/20 transition-colors"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40 hover:border-primary/30 transition-colors">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-popover border z-50">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 hover:border-primary/30 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border z-50">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="dashboard-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No notes found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchQuery || filterPriority !== 'all' || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first note to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note, index) => {
            const CategoryIcon = getCategoryIcon(note.category);
            return (
              <Card 
                key={note.id} 
                className={`dashboard-card hover:shadow-md transition-all duration-300 animate-slide-up ${
                  selectedNotes.has(note.id) ? 'ring-2 ring-primary/50 border-primary/30' : 'hover:border-primary/20'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedNotes.has(note.id)}
                        onCheckedChange={() => toggleNoteSelection(note.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="h-4 w-4 text-primary" />
                          <Badge variant={getPriorityColor(note.priority)} className="text-xs">
                            {note.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {note.category}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            by {note.author}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {note.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(note)}
                        className="hover:bg-primary/10 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteNote(note.id)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingNoteId === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[100px] focus:ring-primary/20"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEditSave(note.id)}
                          className="hover:scale-105 transition-all duration-200"
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingNoteId(null)}
                          className="hover:scale-105 transition-all duration-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      
                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {note.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Tag Input */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="flex-1 h-8 text-xs"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(note.id);
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAddTag(note.id)}
                          disabled={!newTag.trim()}
                          className="h-8 text-xs hover:scale-105 transition-all duration-200"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}