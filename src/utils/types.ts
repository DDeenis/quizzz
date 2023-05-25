export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  deletedAt?: string;
}

export interface UserCreateObject {
  email: string;
  fullName: string;
}
