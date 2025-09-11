import { Student } from "@/types/student";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCzfHB3V8eloFG4RF1kb5kJll4s-WQ1qRg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiChatService {
  private students: Student[] = [];

  setStudentData(students: Student[]) {
    this.students = students;
  }

  private formatStudentDataForContext(): string {
    if (this.students.length === 0) return "No student data available.";

    const summary = {
      totalStudents: this.students.length,
      averageUGPercentage: this.students.reduce((sum, s) => sum + (s.ugPercentage || 0), 0) / this.students.length,
      genderDistribution: {
        male: this.students.filter(s => s.gender === 'MALE').length,
        female: this.students.filter(s => s.gender === 'FEMALE').length,
      },
      experienceDistribution: {
        experienced: this.students.filter(s => (s.totalExperience || 0) > 0).length,
        freshers: this.students.filter(s => (s.totalExperience || 0) === 0).length,
      },
      topSpecializations: Object.entries(
        this.students.reduce((acc, s) => {
          const spec = s.ugBranch || s.ugProgram || 'General';
          acc[spec] = (acc[spec] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 10),
    };

    // Include comprehensive student data for analysis
    const allStudentsData = this.students.map(s => ({
      rollNo: s.rollNo,
      name: s.name,
      course: s.course,
      gender: s.gender,
      ugPercentage: s.ugPercentage || 0,
      ugBranch: s.ugBranch || s.ugProgram || 'General',
      ugEndYear: s.ugEndYear,
      class12Percentage: s.class12Percentage || 0,
      class10Percentage: s.class10Percentage || 0,
      totalExperience: s.totalExperience || 0,
      internshipCompany: s.internshipCompany || 'None',
      state: s.state || 'Unknown',
      category: s.category || 'General',
      summerInternshipEnrolled: s.summerInternshipEnrolled || false,
      campusPlacementEnrolled: s.campusPlacementEnrolled || false
    }));

    return `MBA 2027 Batch Complete Dataset (${summary.totalStudents} Students):

SUMMARY STATISTICS:
- Total Students: ${summary.totalStudents}
- Average UG Percentage: ${summary.averageUGPercentage.toFixed(2)}%
- Gender Distribution: ${summary.genderDistribution.male} Male, ${summary.genderDistribution.female} Female
- Experience: ${summary.experienceDistribution.experienced} Experienced, ${summary.experienceDistribution.freshers} Freshers
- Top Specializations: ${summary.topSpecializations.map(([spec, count]) => `${spec} (${count})`).join(', ')}

COMPLETE STUDENT DATA:
${JSON.stringify(allStudentsData, null, 1)}

You have access to ALL ${summary.totalStudents} students and can analyze any specific student, group, or perform detailed analytics on the complete dataset. Answer questions based on the full data provided above.`;
  }

  // Offline response generator for when API is down
  private generateOfflineResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Handle specific queries about female students
    if (lowerMessage.includes('female') && (lowerMessage.includes('name') || lowerMessage.includes('student'))) {
      const femaleStudents = this.students.filter(s => s.gender === 'FEMALE');
      const names = femaleStudents.map(s => `${s.name} (${s.rollNo})`);
      return `Here are the female students in the MBA 2027 batch (${femaleStudents.length} total):\n\n${names.join('\n')}`;
    }
    
    // Handle specific queries about male students
    if (lowerMessage.includes('male') && (lowerMessage.includes('name') || lowerMessage.includes('student'))) {
      const maleStudents = this.students.filter(s => s.gender === 'MALE');
      return `There are ${maleStudents.length} male students in the batch. Here are the first 10:\n\n${maleStudents.slice(0, 10).map(s => `${s.name} (${s.rollNo})`).join('\n')}\n\n...and ${maleStudents.length - 10} more.`;
    }
    
    // Handle queries about experience
    if (lowerMessage.includes('experience')) {
      const experienced = this.students.filter(s => s.totalExperience > 0);
      const freshers = this.students.filter(s => s.totalExperience === 0);
      return `Experience Distribution:\n- ${experienced.length} students have work experience\n- ${freshers.length} are fresh graduates\n\nTop experienced students:\n${experienced.sort((a, b) => b.totalExperience - a.totalExperience).slice(0, 5).map(s => `${s.name}: ${s.totalExperience} years`).join('\n')}`;
    }
    
    // Handle queries about top performers
    if (lowerMessage.includes('top') && lowerMessage.includes('student')) {
      const topPerformers = this.students
        .filter(s => s.ugPercentage > 0)
        .sort((a, b) => (b.ugPercentage || 0) - (a.ugPercentage || 0))
        .slice(0, 10);
      return `Top 10 performing students by UG percentage:\n\n${topPerformers.map((s, i) => `${i + 1}. ${s.name} - ${s.ugPercentage}%`).join('\n')}`;
    }
    
    // Handle queries about specializations
    if (lowerMessage.includes('specialization') || lowerMessage.includes('branch')) {
      const branches = this.students.reduce((acc, s) => {
        const branch = s.ugBranch || 'Not Specified';
        acc[branch] = (acc[branch] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const sortedBranches = Object.entries(branches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      return `Specialization Distribution (Top 10):\n\n${sortedBranches.map(([branch, count]) => `${branch}: ${count} students`).join('\n')}`;
    }
    
    // Handle queries about average/statistics
    if (lowerMessage.includes('average') || lowerMessage.includes('statistic')) {
      const avgUG = this.students.reduce((sum, s) => sum + (s.ugPercentage || 0), 0) / this.students.length;
      const avg12 = this.students.reduce((sum, s) => sum + (s.class12Percentage || 0), 0) / this.students.length;
      const avg10 = this.students.reduce((sum, s) => sum + (s.class10Percentage || 0), 0) / this.students.length;
      
      return `Academic Statistics for MBA 2027 Batch:\n\n- Average UG Percentage: ${avgUG.toFixed(2)}%\n- Average 12th Percentage: ${avg12.toFixed(2)}%\n- Average 10th Percentage: ${avg10.toFixed(2)}%\n- Total Students: ${this.students.length}\n- Gender Split: ${this.students.filter(s => s.gender === 'MALE').length} Male, ${this.students.filter(s => s.gender === 'FEMALE').length} Female`;
    }
    
    // Default response with basic stats
    return `I'm currently offline but can still help! Here are some quick stats:\n\n- Total Students: ${this.students.length}\n- Average UG %: ${(this.students.reduce((sum, s) => sum + (s.ugPercentage || 0), 0) / this.students.length).toFixed(2)}%\n- ${this.students.filter(s => s.gender === 'FEMALE').length} Female students\n- ${this.students.filter(s => s.totalExperience > 0).length} with work experience\n\nTry asking: "Show me female students" or "Top performers" or "Specializations"`;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const contextualPrompt = `You are an AI assistant for the MBA 2027 Batch Dashboard. You have access to student data from Google Sheets and can help analyze, search, and provide insights about the students.

Current Student Data Context:
${this.formatStudentDataForContext()}

User Question: ${message}

Please provide helpful, accurate answers about the student data. If the user asks for specific student information, analysis, or statistics, use the provided data. Be conversational and professional.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: contextualPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} - ${response.statusText}`);
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Use offline response generator instead of generic fallback
      return this.generateOfflineResponse(message);
    }
  }

  async searchStudents(query: string): Promise<Student[]> {
    const lowerQuery = query.toLowerCase();
    return this.students.filter(student => 
      student.name.toLowerCase().includes(lowerQuery) ||
      student.rollNo.toLowerCase().includes(lowerQuery) ||
      student.course.toLowerCase().includes(lowerQuery) ||
      (student.ugBranch && student.ugBranch.toLowerCase().includes(lowerQuery)) ||
      (student.internshipCompany && student.internshipCompany.toLowerCase().includes(lowerQuery))
    );
  }
}

export const geminiChatService = new GeminiChatService();