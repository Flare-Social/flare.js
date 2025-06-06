import type FlareApi from './index';

export type IdHolder = {
  id: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  nextPage?: string;
};

export abstract class Endpoint {
  constructor(
    protected api: FlareApi,
    protected path: string,
  ) {}
}

export interface GetAllEndpoint<T extends IdHolder> {
  getAll(): Promise<T[]>;
}

export interface GetEndpoint<T extends IdHolder> {
  getById(id: string): Promise<T>;
}

export interface CreateEndpoint<T extends IdHolder, Creatable = T> {
  create(data: Creatable): Promise<T>;
}

export interface UpdateEndpoint<T extends IdHolder> {
  update(data: Partial<T> & IdHolder): Promise<T>;
}

export interface DeleteEndpoint {
  delete(id: string): Promise<void>;
}
