import bcrypt from 'bcryptjs'
import { IUserRepository, User, CreateUserDto, UpdateUserDto } from '../interfaces/database.interface'
import { SQLiteAdapter } from '../adapters/sqlite.adapter'

export class UserRepository implements IUserRepository {
  private db: SQLiteAdapter

  constructor(db?: SQLiteAdapter) {
    this.db = db || SQLiteAdapter.getInstance()
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
  }

  async findById(id: number): Promise<User | null> {
    return await this.db.queryOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )
  }

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const result = await this.db.execute(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [data.email, hashedPassword, data.name]
    )

    const user = await this.findById(result.lastInsertId as number)
    if (!user) throw new Error('Failed to create user')
    
    return user
  }

  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.email) {
      updates.push('email = ?')
      values.push(data.email)
    }

    if (data.name) {
      updates.push('name = ?')
      values.push(data.name)
    }

    if (data.password) {
      updates.push('password_hash = ?')
      values.push(await bcrypt.hash(data.password, 10))
    }

    if (updates.length === 0) return this.findById(id)

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await this.db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return this.findById(id)
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash)
  }
}