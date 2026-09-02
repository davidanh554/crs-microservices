export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number; // Bổ sung userId khớp với LoginResponseDTO
  token: string;
  username: string;
  role: 'ADMIN' | 'STUDENT';
}