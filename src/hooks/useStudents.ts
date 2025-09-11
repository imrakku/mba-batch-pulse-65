import { useQuery } from "@tanstack/react-query";
import { fetchStudentsFromSheet } from "@/services/googleSheets";

import type { Student } from "@/types/student";

export function useStudents() {
  const query = useQuery<Student[]>({
    queryKey: ["students-csv"],
    queryFn: fetchStudentsFromSheet,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  const data = query.data ?? [];

  return { ...query, data };
}
