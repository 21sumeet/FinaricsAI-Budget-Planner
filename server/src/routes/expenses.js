import express from 'express'
import { updateExpense, deleteExpense } from '../controllers/expenseController.js'

const router = express.Router()

router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
