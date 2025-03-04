import { UserRole, type User } from "@/types/user";

export const isStudent = (user: User) => user.role === UserRole.Student;
export const isTeacher = (user: User) => user.role === UserRole.Teacher;
export const isAdmin = (user: User) => user.role === UserRole.Admin;
