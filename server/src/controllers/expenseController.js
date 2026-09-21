import pool from '../db/pool.js'

export const getExpenses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createExpense = async (req, res) => {
  const { budget_id, amount, description, date } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO expenses (budget_id, amount, description, date) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE)) RETURNING *',
      [budget_id, amount, description, date]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
