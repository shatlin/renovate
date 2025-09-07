import { IProjectRepository, Project, CreateProjectDto, UpdateProjectDto } from '../interfaces/database.interface'
import { SQLiteAdapter } from '../adapters/sqlite.adapter'

export class ProjectRepository implements IProjectRepository {
  private db: SQLiteAdapter

  constructor(db?: SQLiteAdapter) {
    this.db = db || SQLiteAdapter.getInstance()
  }

  async findAll(userId?: number): Promise<Project[]> {
    if (userId) {
      return await this.db.query<Project>(
        'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      )
    }
    return await this.db.query<Project>(
      'SELECT * FROM projects ORDER BY created_at DESC'
    )
  }

  async findById(id: number, userId?: number): Promise<Project | null> {
    if (userId) {
      return await this.db.queryOne<Project>(
        'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        [id, userId]
      )
    }
    return await this.db.queryOne<Project>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    )
  }

  async create(data: CreateProjectDto): Promise<Project> {
    const result = await this.db.execute(
      `INSERT INTO projects (user_id, name, description, total_budget, start_date, target_end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.name,
        data.description || null,
        data.total_budget || 0,
        data.start_date || null,
        data.target_end_date || null
      ]
    )

    const project = await this.findById(result.lastInsertId as number)
    if (!project) throw new Error('Failed to create project')
    
    return project
  }

  async update(id: number, data: UpdateProjectDto, userId?: number): Promise<Project | null> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }

    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }

    if (data.total_budget !== undefined) {
      updates.push('total_budget = ?')
      values.push(data.total_budget)
    }

    if (data.start_date !== undefined) {
      updates.push('start_date = ?')
      values.push(data.start_date)
    }

    if (data.target_end_date !== undefined) {
      updates.push('target_end_date = ?')
      values.push(data.target_end_date)
    }

    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }

    if (updates.length === 0) return this.findById(id, userId)

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    let query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`
    if (userId) {
      query += ' AND user_id = ?'
      values.push(userId)
    }

    await this.db.execute(query, values)
    return this.findById(id, userId)
  }

  async delete(id: number, userId?: number): Promise<boolean> {
    let query = 'DELETE FROM projects WHERE id = ?'
    const values = [id]

    if (userId) {
      query += ' AND user_id = ?'
      values.push(userId)
    }

    const result = await this.db.execute(query, values)
    return (result.affectedRows || 0) > 0
  }
}