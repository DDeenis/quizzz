export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  deletedAt?: Date | null;
}

export interface UserCreateObject {
  email: string;
  name: string;
}

export enum UserRole {
  Student = "student",
  Teacher = "teacher",
  Admin = "admin",
}
