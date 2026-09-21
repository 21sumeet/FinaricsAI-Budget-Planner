import express from 'express'
import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js'
import {
  createExpense,
  getExpensesForBudget,
} from '../controllers/expenseController.js'

const router = express.Router()

// Budget routes
router.post('/', createBudget)
router.get('/', getAllBudgets)
router.get('/:id', getBudgetById)
router.put('/:id', updateBudget)
router.delete('/:id', deleteBudget)

// Nested Expense routes under /api/budgets/:id/expenses
router.post('/:id/expenses', createExpense)
router.get('/:id/expenses', getExpensesForBudget)

export default router
