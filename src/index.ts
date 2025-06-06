import { UsersEndpoint } from './users';
import { PostsEndpoint } from './posts';

export type { IdHolder, PaginatedResponse } from './endpoint';
export type { User, UserUpdate } from './users';
export { UserEntity } from './users';
export type { Post, PostCreate, QuoteCreate } from './posts';
export { PostEntity } from './posts';

interface FlareApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export default class FlareApi {
  static getToken: () => string;
  private readonly baseUrl: string;

  readonly users = new UsersEndpoint(this);
  readonly posts = new PostsEndpoint(this);

  constructor(
    getToken: () => string,
    baseUrl: string = 'https://api.tryflare.social',
  ) {
    FlareApi.getToken = getToken;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  async request<T>(
    method: RequestMethod,
    path: string,
    headers?: Record<string, string>,
    init?: RequestInit,
  ): Promise<T> {
    console.log(`[${method}] ${this.baseUrl}/${path}`);

    const response = await fetch(`${this.baseUrl}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${FlareApi.getToken()}`,
        ...(headers || {}),
      },
      ...(init || {}),
    });

    const data: FlareApiResponse<T> = await response.json();

    if (!response.ok || data.status !== 200) {
      console.error(`Request failed: ${data.error}`);
      throw new Error(data.error);
    }

    console.log(`Request status: ${data.status}`);

    return data.data!;
  }

  static async register(
    username: string,
    email: string,
    password: string,
    displayName?: string,
    baseUrl: string = 'https://api.tryflare.social',
    invite_code?: string,
  ): Promise<string> {
    const result = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        display_name: displayName,
        invite_code,
      }),
    });

    const data: FlareApiResponse<{ token: string }> = await result.json();

    if (!result.ok || data.status !== 200) {
      console.error(`Login failed: ${data.error}`);
      throw new Error(data.error);
    }

    return data.data!.token;
  }

  static async login(
    login: string,
    password: string,
    baseUrl: string = 'https://api.tryflare.social',
  ): Promise<string> {
    const result = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    const data: FlareApiResponse<{ token: string }> = await result.json();

    if (!result.ok || data.status !== 200) {
      console.error(`Login failed: ${data.error}`);
      throw new Error(data.error);
    }

    return data.data!.token;
  }
}
