export class LoginDto {
  username: string;
  password?: string; // Password is used for validation but not stored in session
}