export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  deletedAt?: string;
  isAdmin?: boolean;
}

export interface UserCreateObject {
  email: string;
  fullName: string;
}

export interface Admin {
  id: string;
  userId: string;
  createdAt: string;
}
