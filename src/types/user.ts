export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null;
  isAdmin: boolean;
}

export interface UserCreateObject {
  email: string;
  name: string;
}
