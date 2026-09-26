import { ApiResponse, ApiError, AuthResponse, Post, User, UserProfile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.error?.message || 'エラーが発生しました');
    }

    return (data as ApiResponse<T>).data;
  }

  // Auth
  async register(username: string, email: string, password: string, displayName?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, display_name: displayName }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Posts
  async createPost(content: string): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async updatePost(id: number, content: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deletePost(id: number): Promise<void> {
    return this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Timeline
  async getTimeline(filter: 'all' | 'following' = 'all', limit = 20, offset = 0): Promise<Post[]> {
    return this.request<Post[]>(`/timeline?filter=${filter}&limit=${limit}&offset=${offset}`);
  }

  // Users
  async getUserProfile(username: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${username}`);
  }

  async getUserPosts(username: string, limit = 20, offset = 0): Promise<Post[]> {
    return this.request<Post[]>(`/users/${username}/posts?limit=${limit}&offset=${offset}`);
  }

  // Follow
  async follow(username: string): Promise<void> {
    return this.request<void>(`/users/${username}/follow`, {
      method: 'POST',
    });
  }

  async unfollow(username: string): Promise<void> {
    return this.request<void>(`/users/${username}/follow`, {
      method: 'DELETE',
    });
  }

  async getFollowers(username: string, limit = 20, offset = 0): Promise<User[]> {
    return this.request<User[]>(`/users/${username}/followers?limit=${limit}&offset=${offset}`);
  }

  async getFollowing(username: string, limit = 20, offset = 0): Promise<User[]> {
    return this.request<User[]>(`/users/${username}/following?limit=${limit}&offset=${offset}`);
  }

  // Likes
  async like(postId: number): Promise<{ message: string; like_count: number }> {
    return this.request<{ message: string; like_count: number }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlike(postId: number): Promise<{ message: string; like_count: number }> {
    return this.request<{ message: string; like_count: number }>(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
