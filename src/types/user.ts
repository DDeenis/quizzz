export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
  isAdmin: boolean;
  deletedAt: Date | null;
}

export interface UserCreateObject {
  email: string;
  name: string;
}
