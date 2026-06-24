export type StudentSession = {
  id: string;
  name: string;
  classId: string;
};

const KEY = "student_session";

export function setStudentSession(session: StudentSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);
  if (!data) return null;

  return JSON.parse(data);
}

export function clearStudentSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}