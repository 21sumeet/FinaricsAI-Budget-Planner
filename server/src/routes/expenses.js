import express from 'express'
import { getExpenses, createExpense } from '../controllers/expenseController.js'

const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'list expenses' }))
router.get('/all', getExpenses)
router.post('/', createExpense)

export default router
