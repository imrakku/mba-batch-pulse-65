export interface Student {
  id: number;
  rollNo: string;
  name: string;
  collegeEmail: string;
  personalEmail: string;
  phone: string;
  course: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  currentCourseScore?: number;
  currentCoursePercentage?: string;
  ugBoard: string;
  ugProgram: string;
  ugBranch?: string;
  ugPercentage?: number;
  ugEndYear: number;
  class12Percentage?: number;
  class12YOP: number;
  class10Percentage?: number;
  class10YOP: number;
  internshipCompany?: string;
  internshipJobTitle?: string;
  internshipDuration?: string;
  totalExperience: number;
  workExperience1Company?: string;
  workExperience1Title?: string;
  workExperience1Duration?: string;
  workExperience2Company?: string;
  workExperience2Title?: string;
  workExperience2Duration?: string;
  category: string;
  summerInternshipEnrolled?: boolean;
  summerInternshipStatus?: string;
  campusPlacementEnrolled?: boolean;
  campusPlacementStatus?: string;
  profileImage?: string;
  state?: string;
  bloodGroup?: string;
  languages?: string[];
  achievements?: string[];
  comments?: string;
}

export interface BatchStatistics {
  totalStudents: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  specializationDistribution: Record<string, number>;
  stateDistribution: Record<string, number>;
  averageUGPercentage: number;
  experienceDistribution: {
    fresher: number;
    experienced: number;
  };
  internshipIndustries: Record<string, number>;
}

export interface FilterOptions {
  specialization?: string;
  gender?: string;
  graduationYear?: string;
  state?: string;
  ugDegree?: string;
  experience?: 'fresher' | 'experienced' | 'all';
  search?: string;
}