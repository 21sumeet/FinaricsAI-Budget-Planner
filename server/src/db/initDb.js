import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './pool.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')

    console.log('Initializing database schema...')
    await pool.query(sql)
    console.log('✅ Database schema initialized successfully (tables budgets & expenses created/verified)!')
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message)
  }
}

// Run directly if invoked from command line (node src/db/initDb.js)
if (process.argv[1] && process.argv[1].endsWith('initDb.js')) {
  initDb().then(() => pool.end())
}
