import type { PaginatedResponse } from './endpoint';
import {
  type CreateEndpoint,
  Endpoint,
  type GetEndpoint,
  type IdHolder,
} from './endpoint';
import type { User } from './index';
import type FlareApi from './index';
import { UserEntity } from './index';
import { Entity } from './entity';
import { createFormData } from './utils';

export type Post = {
  author_id: string;

  body: string;

  reply_to?: string;
  repost_of?: string;

  reply_count: number;
  repost_count: number;
  like_count: number;
  bookmark_count: number;

  created_at: string;
} & IdHolder;

export class PostEntity extends Entity implements Post {
  id: string;
  author_id: string;

  body: string;

  reply_to?: string;
  repost_of?: string;

  reply_count: number;
  repost_count: number;
  like_count: number;
  bookmark_count: number;

  created_at: string;
  createdAt: Date;

  constructor(api: FlareApi, data: Post) {
    super(api);
    this.id = data.id;
    this.author_id = data.author_id;

    this.body = data.body;

    this.reply_to = data.reply_to;
    this.repost_of = data.repost_of;

    this.reply_count = data.reply_count;
    this.repost_count = data.repost_count;
    this.like_count = data.like_count;
    this.bookmark_count = data.bookmark_count;

    this.created_at = data.created_at;
    this.createdAt = new Date(data.created_at);
  }

  async getAuthor() {
    return await this.api.users.getById(this.author_id);
  }

  async delete() {
    return await this.api.posts.delete(this.id);
  }

  async like() {
    const res = await this.api.request<{ success: boolean }>(
      'PUT',
      `/posts/${this.id}/like`,
    );

    return res.success;
  }

  async unlike() {
    const res = await this.api.request<{ success: boolean }>(
      'DELETE',
      `/posts/${this.id}/like`,
    );

    return res.success;
  }

  async isLiked(): Promise<boolean> {
    const res = await this.api.request<{ liked: boolean }>(
      'GET',
      `/posts/${this.id}/like`,
    );

    return res.liked;
  }

  async getLikes(): Promise<PaginatedResponse<UserEntity>> {
    const res = await this.api.request<PaginatedResponse<User>>(
      'GET',
      `/posts/${this.id}/likes`,
    );

    return {
      data: res.data.map((it) => new UserEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async bookmark() {
    const res = await this.api.request<{ success: boolean }>(
      'PUT',
      `/posts/${this.id}/bookmark`,
    );

    return res.success;
  }

  async unbookmark() {
    const res = await this.api.request<{ success: boolean }>(
      'DELETE',
      `/posts/${this.id}/bookmark`,
    );

    return res.success;
  }

  async isBookmarked(): Promise<boolean> {
    const res = await this.api.request<{ bookmarked: boolean }>(
      'GET',
      `/posts/${this.id}/bookmark`,
    );

    return res.bookmarked;
  }

  async getReplies(
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<PostEntity>> {
    const res = await this.api.request<PaginatedResponse<Post>>(
      'GET',
      `/posts/${this.id}/replies?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new PostEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async reply(data: PostCreateBase) {
    const newData: PostCreate = {
      ...data,
      reply_to: this.id,
    };

    return await this.api.posts.create(newData);
  }

  async getReposters(
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<UserEntity>> {
    const res = await this.api.request<PaginatedResponse<User>>(
      'GET',
      `/posts/${this.id}/reposters?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new UserEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async repost() {
    const res = await this.api.request<{ success: boolean }>(
      'PUT',
      `/posts/${this.id}/repost`,
    );

    return res.success;
  }

  async unrepost() {
    const res = await this.api.request<{ success: boolean }>(
      'DELETE',
      `/posts/${this.id}/repost`,
    );

    return res.success;
  }

  async isReposted(): Promise<boolean> {
    const res = await this.api.request<{ reposted: boolean }>(
      'GET',
      `/posts/${this.id}/repost`,
    );

    return res.reposted;
  }

  async getQuotes(
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<PostEntity>> {
    const res = await this.api.request<PaginatedResponse<Post>>(
      'GET',
      `/posts/${this.id}/quotes?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new PostEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async quote(data: QuoteCreate) {
    const formData = createFormData(data);

    return new PostEntity(
      this.api,
      await this.api.request<Post>(
        'POST',
        `/posts/${this.id}/quote`,
        {},
        {
          body: formData,
        },
      ),
    );
  }
}

type PostCreateBase = Pick<Post, 'body'>;
export type PostCreate = PostCreateBase & Pick<Post, 'reply_to'>;
export type QuoteCreate = PostCreateBase;

export class PostsEndpoint
  extends Endpoint
  implements GetEndpoint<PostEntity>, CreateEndpoint<PostEntity, PostCreate>
{
  constructor(flareApi: FlareApi) {
    super(flareApi, '/posts');
  }

  async getAll(
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<PostEntity>> {
    const res = await this.api.request<PaginatedResponse<PostEntity>>(
      'GET',
      `${this.path}?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new PostEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async getById(id: string): Promise<PostEntity> {
    return new PostEntity(
      this.api,
      await this.api.request<Post>('GET', `${this.path}/${id}`),
    );
  }

  async getByAuthor(
    authorId: string,
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<PostEntity>> {
    const res = await this.api.request<PaginatedResponse<Post>>(
      'GET',
      `${this.path}/by_author/${authorId}?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new PostEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }

  async create(data: PostCreate): Promise<PostEntity> {
    const formData = createFormData(data);

    return new PostEntity(
      this.api,
      await this.api.request<Post>(
        'POST',
        `${this.path}/create`,
        {},
        {
          body: formData,
        },
      ),
    );
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.api.request<{ success: boolean }>(
      'DELETE',
      `${this.path}/${id}`,
    );

    return res.success;
  }

  async getMyBookmarks(
    limit: number = 50,
    page: number = 0,
  ): Promise<PaginatedResponse<PostEntity>> {
    const res = await this.api.request<PaginatedResponse<Post>>(
      'GET',
      `/users/me/bookmarks?limit=${limit}&page=${page}`,
    );

    return {
      data: res.data.map((it) => new PostEntity(this.api, it)),
      nextPage: res.nextPage,
    };
  }
}
