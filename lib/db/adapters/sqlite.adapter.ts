import Database from 'better-sqlite3'
import { IDatabase } from '../interfaces/database.interface'
import path from 'path'
import fs from 'fs'

export class SQLiteAdapter implements IDatabase {
  private db: Database.Database
  private static instance: SQLiteAdapter | null = null

  constructor(dbPath?: string) {
    const DB_PATH = dbPath || path.join(process.cwd(), 'renovation-budget.db')
    this.db = new Database(DB_PATH)
    this.db.pragma('foreign_keys = ON')
    this.initializeDatabase()
  }

  static getInstance(): SQLiteAdapter {
    if (!SQLiteAdapter.instance) {
      SQLiteAdapter.instance = new SQLiteAdapter()
    }
    return SQLiteAdapter.instance
  }

  private initializeDatabase() {
    try {
      const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
      this.db.exec(schema)
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    }
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql)
      return stmt.all(...(params || [])) as T[]
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  async queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql)
      return (stmt.get(...(params || [])) as T) || null
    } catch (error) {
      console.error('QueryOne error:', error)
      throw error
    }
  }

  async execute(sql: string, params?: any[]): Promise<{ lastInsertId?: number; affectedRows?: number }> {
    try {
      const stmt = this.db.prepare(sql)
      const result = stmt.run(...(params || []))
      return {
        lastInsertId: result.lastInsertRowid as number,
        affectedRows: result.changes
      }
    } catch (error) {
      console.error('Execute error:', error)
      throw error
    }
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const transaction = this.db.transaction(async () => {
      return await callback()
    })
    return transaction() as T
  }

  async close(): Promise<void> {
    this.db.close()
  }

  getDatabase(): Database.Database {
    return this.db
  }
}