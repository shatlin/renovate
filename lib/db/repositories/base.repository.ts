export interface IRepository<T> {
  findAll(filters?: any): Promise<T[]>
  findById(id: number | string): Promise<T | null>
  findOne(filters: any): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: number | string, data: Partial<T>): Promise<T | null>
  delete(id: number | string): Promise<boolean>
}

export abstract class BaseRepository<T> implements IRepository<T> {
  protected abstract tableName: string

  abstract findAll(filters?: any): Promise<T[]>
  abstract findById(id: number | string): Promise<T | null>
  abstract findOne(filters: any): Promise<T | null>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: number | string, data: Partial<T>): Promise<T | null>
  abstract delete(id: number | string): Promise<boolean>
}