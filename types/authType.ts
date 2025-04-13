import { User } from "./userType";

export interface LoginResponse {
  token: string;
  user: User | null;
  error: string | null;
}