import {
  type CreateEndpoint,
  Endpoint,
  type GetEndpoint,
  type IdHolder,
} from './endpoint';
import type FlareApi from './index';
import { Entity } from './entity';
import { createFormData } from './utils';

export type Post = {
  author_id: string;
  body: string;
  created_at: string;
} & IdHolder;

export class PostEntity extends Entity implements Post {
  id: string;
  created_at: string;

  author_id: string;
  body: string;

  constructor(api: FlareApi, data: Post) {
    super(api);
    this.id = data.id;
    this.created_at = data.created_at;

    this.author_id = data.author_id;
    this.body = data.body;
  }

  async getAuthor() {
    return await this.api.users.getById(this.author_id);
  }
}

type PostCreate = Pick<Post, 'body'>;

export class PostsEndpoint
  extends Endpoint
  implements GetEndpoint<PostEntity>, CreateEndpoint<PostEntity, PostCreate>
{
  constructor(flareApi: FlareApi) {
    super(flareApi, '/posts');
  }

  async getAll(limit: number = 50, page: number = 0): Promise<PostEntity[]> {
    const posts = await this.api.request<Post[]>(
      'GET',
      `${this.path}?limit=${limit}&page=${page}`,
    );
    return posts.map((it) => new PostEntity(this.api, it));
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
  ): Promise<PostEntity[]> {
    return (
      await this.api.request<Post[]>(
        'GET',
        `${this.path}/by_author/${authorId}?limit=${limit}&page=${page}`,
      )
    ).map((it) => new PostEntity(this.api, it));
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
}
