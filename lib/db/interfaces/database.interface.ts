export interface IDatabase {
  query<T>(sql: string, params?: any[]): Promise<T[]>
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>
  execute(sql: string, params?: any[]): Promise<{ lastInsertId?: number | string; affectedRows?: number }>
  transaction<T>(callback: () => Promise<T>): Promise<T>
  close(): Promise<void>
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  create(data: CreateUserDto): Promise<User>
  update(id: number, data: UpdateUserDto): Promise<User | null>
  validatePassword(user: User, password: string): Promise<boolean>
}

export interface IProjectRepository {
  findAll(userId?: number): Promise<Project[]>
  findById(id: number, userId?: number): Promise<Project | null>
  create(data: CreateProjectDto): Promise<Project>
  update(id: number, data: UpdateProjectDto, userId?: number): Promise<Project | null>
  delete(id: number, userId?: number): Promise<boolean>
}

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: number
  user_id: number
  name: string
  description?: string
  total_budget: number
  start_date?: Date
  target_end_date?: Date
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  created_at: Date
  updated_at: Date
}

export interface CreateUserDto {
  email: string
  password: string
  name: string
}

export interface UpdateUserDto {
  email?: string
  name?: string
  password?: string
}

export interface CreateProjectDto {
  user_id: number
  name: string
  description?: string
  total_budget?: number
  start_date?: string
  target_end_date?: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  total_budget?: number
  start_date?: string
  target_end_date?: string
  status?: string
}