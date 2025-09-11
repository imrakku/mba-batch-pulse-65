import { useMemo } from "react";
import { Student, FilterOptions } from "@/types/student";

export function useAdvancedFiltering(students: Student[], filters: FilterOptions) {
  return useMemo(() => {
    if (!students || students.length === 0) return [];

    return students.filter(student => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          student.name,
          student.rollNo,
          student.collegeEmail,
          student.personalEmail,
          student.ugBranch,
          student.ugProgram,
          student.internshipCompany,
          student.workExperience1Company,
          student.workExperience2Company,
          student.internshipJobTitle,
          student.workExperience1Title,
          student.workExperience2Title,
          ...(student.languages || []),
          ...(student.achievements || [])
        ].filter(Boolean);

        const matchesSearch = searchFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        );

        if (!matchesSearch) return false;
      }

      // Specialization filter
      if (filters.specialization) {
        const studentSpec = student.ugBranch || student.ugProgram || 'General';
        if (!studentSpec.toLowerCase().includes(filters.specialization.toLowerCase())) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender && student.gender !== filters.gender) {
        return false;
      }

      // Experience filter
      if (filters.experience) {
        const hasExperience = (student.totalExperience || 0) > 0;
        if (filters.experience === 'fresher' && hasExperience) return false;
        if (filters.experience === 'experienced' && !hasExperience) return false;
      }

      // State filter
      if (filters.state && student.state !== filters.state) {
        return false;
      }

      // UG Degree filter
      if (filters.ugDegree) {
        const studentDegree = student.ugProgram || '';
        if (!studentDegree.toLowerCase().includes(filters.ugDegree.toLowerCase())) {
          return false;
        }
      }

      // Graduation year filter
      if (filters.graduationYear) {
        const gradYear = student.ugEndYear?.toString();
        if (gradYear !== filters.graduationYear) {
          return false;
        }
      }

      return true;
    });
  }, [students, filters]);
}

export function useAdvancedSorting(students: Student[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
  return useMemo(() => {
    if (!students || students.length === 0) return [];

    const sorted = [...students].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'ugPercentage':
          aValue = a.ugPercentage || 0;
          bValue = b.ugPercentage || 0;
          break;
        case 'totalExperience':
          aValue = a.totalExperience || 0;
          bValue = b.totalExperience || 0;
          break;
        case 'ugEndYear':
          aValue = a.ugEndYear || 0;
          bValue = b.ugEndYear || 0;
          break;
        case 'class12Percentage':
          aValue = a.class12Percentage || 0;
          bValue = b.class12Percentage || 0;
          break;
        case 'class10Percentage':
          aValue = a.class10Percentage || 0;
          bValue = b.class10Percentage || 0;
          break;
        default:
          return 0;
      }

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      // Handle numeric comparisons
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return sorted;
  }, [students, sortBy, sortOrder]);
}