export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password?: string; // Optional if using OAuth or other means
}

export interface RegisterInput {
  email: string;
  password?: string;
  name?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}
