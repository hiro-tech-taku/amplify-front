export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  display_name: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  username: string;
  display_name: string | null;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
