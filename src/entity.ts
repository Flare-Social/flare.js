import type FlareApi from './index';

export abstract class Entity {
  public abstract id: string;
  public abstract created_at: string;

  constructor(protected api: FlareApi) {}
}
