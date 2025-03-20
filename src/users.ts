import type FlareApi from './index';
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

    this.createdAt = new Date(data.created_at);
  }

  async getPosts(limit: number = 50, page: number = 0) {
    return await this.api.posts.getByAuthor(this.id, limit, page);
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
}
