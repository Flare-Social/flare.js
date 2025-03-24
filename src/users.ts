import type FlareApi from './index';
import type { PaginatedResponse } from './index';
import {
  Endpoint,
  type GetAllEndpoint,
  type GetEndpoint,
  type IdHolder,
} from './endpoint';
import { Entity } from './entity';
import { createFormData } from './utils';

export type User = {
  username: string;
  display_name: string;

  bio?: string;
  location?: string;
  link?: string;
  pronouns?: string;

  avatar: string;
  banner?: string;

  admin: boolean;

  follower_count: number;
  following_count: number;
  post_count: number;

  created_at: string;
} & IdHolder;

export class UserEntity extends Entity implements User {
  id: string;
  created_at: string;

  username: string;
  display_name: string;

  bio?: string;
  link?: string;
  location?: string;
  pronouns?: string;

  avatar: string;
  banner?: string;

  admin: boolean;

  follower_count: number;
  following_count: number;
  post_count: number;

  createdAt: Date;

  constructor(api: FlareApi, data: User) {
    super(api);

    this.id = data.id;
    this.created_at = data.created_at;

    this.username = data.username;
    this.display_name = data.display_name;

    this.bio = data.bio;
    this.location = data.location;
    this.link = data.link;
    this.pronouns = data.pronouns;

    this.avatar = data.avatar;
    this.banner = data.banner;

    this.admin = data.admin;

    this.follower_count = data.follower_count;
    this.following_count = data.following_count;
    this.post_count = data.post_count;

    this.createdAt = new Date(data.created_at);
  }

  async getPosts(limit: number = 50, page: number = 0) {
    return await this.api.posts.getByAuthor(this.id, limit, page);
  }

  async getFollowers(): Promise<PaginatedResponse<UserEntity>> {
    const followers = await this.api.request<PaginatedResponse<User>>(
      'GET',
      `/users/${this.id}/followers`,
    );

    return {
      data: followers.data.map((it) => new UserEntity(this.api, it)),
      nextPage: followers.nextPage,
    };
  }

  async getFollowing(): Promise<PaginatedResponse<UserEntity>> {
    const following = await this.api.request<PaginatedResponse<User>>(
      'GET',
      `/users/${this.id}/following`,
    );

    return {
      data: following.data.map((it) => new UserEntity(this.api, it)),
      nextPage: following.nextPage,
    };
  }

  async follow(): Promise<boolean> {
    const response = await this.api.request<{ success: boolean }>(
      'PUT',
      `/users/${this.id}/follow`,
    );
    return response.success;
  }

  async unfollow(): Promise<boolean> {
    const response = await this.api.request<{ success: boolean }>(
      'DELETE',
      `/users/${this.id}/follow`,
    );
    return response.success;
  }

  async following(): Promise<boolean> {
    return await this.api.users.isFollowing(this);
  }
}

export type UserUpdate = Partial<
  Pick<User, 'display_name' | 'bio' | 'location' | 'link' | 'pronouns'> & {
    avatar?: File;
    banner?: File;
  }
>;

export class UsersEndpoint
  extends Endpoint
  implements GetAllEndpoint<UserEntity>, GetEndpoint<UserEntity>
{
  constructor(flareApi: FlareApi) {
    super(flareApi, '/users');
  }

  async getAll(): Promise<UserEntity[]> {
    return (await this.api.request<User[]>('GET', this.path)).map(
      (it) => new UserEntity(this.api, it),
    );
  }

  async getById(id: string): Promise<UserEntity> {
    return new UserEntity(
      this.api,
      await this.api.request('GET', `${this.path}/${id}`),
    );
  }

  async getByHandle(handle: string): Promise<UserEntity> {
    return new UserEntity(
      this.api,
      await this.api.request('GET', `${this.path}/by_handle/${handle}`),
    );
  }

  // Self-related methods

  async getMe(): Promise<UserEntity> {
    return new UserEntity(
      this.api,
      await this.api.request('GET', `${this.path}/me`),
    );
  }

  async updateMe(data: UserUpdate): Promise<void> {
    const formData = createFormData(data);

    await this.api.request(
      'PATCH',
      `${this.path}/me`,
      {}, // headers
      { body: formData },
    );
  }

  async removeFollower(id: string): Promise<boolean> {
    const response = await this.api.request<{ success: boolean }>(
      'DELETE',
      `/users/me/followers/${id}`,
    );
    return response.success;
  }

  async isFollowing(user: string | UserEntity): Promise<boolean> {
    const userId = typeof user === 'string' ? user : user.id;

    const response = await this.api.request<{ following: boolean }>(
      'GET',
      `/users/${userId}/follow`,
    );

    return response.following;
  }
}
