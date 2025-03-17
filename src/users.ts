import FlareApi from "./index";
import { Endpoint, type GetAllEndpoint, type GetEndpoint, type IdHolder } from "./endpoint";

type User = {
  username: string;
  display_name: string;

  bio?: string;
  location?: string;
  link?: string;
  pronouns?: string;

  avatar: string;
  banner?: string;

  created_at: string;
} & IdHolder

export class UsersEndpoint
  extends Endpoint<User>
  implements GetAllEndpoint<User>, GetEndpoint<User> {
    constructor(flareApi: FlareApi) {
        super(flareApi, '/users');
    }

    async getAll(): Promise<User[]> {
      return await this.api.request('GET', this.path);
    }

    async getById(id: string): Promise<User> {
      return await this.api.request('GET', `${this.path}/${id}`);
    }

    async getMe(): Promise<User> {
      return await this.api.request('GET', `${this.path}/me`);
    }

    async updateMe(
      data: Partial<
        Pick<User, 'display_name' | 'bio' | 'location' | 'link' | 'pronouns'> & {
          avatar?: File;
          banner?: File;
        }
      >
    ): Promise<void> {
      const formData = new FormData();

      // todo: refactor this to be more dynamic
      if (data.display_name) formData.set('display_name', data.display_name);
      if (data.bio) formData.set('bio', data.bio);
      if (data.location) formData.set('location', data.location);
      if (data.link) formData.set('link', data.link);
      if (data.pronouns) formData.set('pronouns', data.pronouns);
      if (data.avatar) formData.set('avatar', data.avatar);
      if (data.banner) formData.set('banner', data.banner);

      await this.api.request(
        'PUT',
        `${this.path}/me`,
        { // headers
          'Content-Type': 'multipart/form-data'
        },
        { body: formData }
      );
    }
}