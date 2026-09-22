import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import BudgetForm from '../components/BudgetForm'
import ConfirmModal from '../components/ConfirmModal'

export default function BudgetDetail({ budgetId, onBack }) {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)

  // Custom Modal state for budget deletion
  const [isDeleteBudgetOpen, setIsDeleteBudgetOpen] = useState(false)
  const [isDeletingBudget, setIsDeletingBudget] = useState(false)

  // Custom Modal state for expense deletion
  const [deletingExpense, setDeletingExpense] = useState(null)
  const [isDeletingExpense, setIsDeletingExpense] = useState(false)

  const fetchBudgetDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBudgetById(budgetId)
      setBudget(data)
    } catch (err) {
      setError(err.message || 'Failed to load budget details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (budgetId) {
      fetchBudgetDetail()
    }
  }, [budgetId])

  // Budget Update handler
  const handleBudgetUpdated = (updatedBudget) => {
    setBudget((prev) => ({
      ...prev,
      ...updatedBudget,
      remaining: updatedBudget.monthly_limit - (prev ? prev.spent : 0),
    }))
  }

  // Budget Delete confirmation handler
  const handleConfirmDeleteBudget = async () => {
    if (!budget) return
    try {
      setIsDeletingBudget(true)
      await api.deleteBudget(budget.id)
      setIsDeleteBudgetOpen(false)
      onBack()
    } catch (err) {
      alert(err.message || 'Failed to delete budget.')
    } finally {
      setIsDeletingBudget(false)
    }
  }

  // Instant State Update when a new expense is logged
  const handleExpenseAdded = (newExpense) => {
    setBudget((prev) => {
      if (!prev) return prev
      const newSpent = prev.spent + Number(newExpense.amount)
      const newRemaining = prev.monthly_limit - newSpent
      const updatedExpenses = [newExpense, ...(prev.expenses || [])]

      return {
        ...prev,
        spent: newSpent,
        remaining: newRemaining,
        expenses: updatedExpenses,
      }
    })
  }

  // Instant State Update when an expense is updated
  const handleExpenseUpdated = async (expenseId, payload) => {
    try {
      const updatedExp = await api.updateExpense(expenseId, payload)

      setBudget((prev) => {
        if (!prev) return prev
        const updatedExpenses = prev.expenses.map((e) => (e.id === expenseId ? updatedExp : e))
        const newSpent = updatedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
        const newRemaining = prev.monthly_limit - newSpent

        return {
          ...prev,
          spent: newSpent,
          remaining: newRemaining,
          expenses: updatedExpenses,
        }
      })
    } catch (err) {
      alert(err.message || 'Failed to update expense.')
    }
  }

  // Expense Delete confirmation modal triggers
  const handlePromptDeleteExpense = (expenseId) => {
    const targetExp = budget?.expenses?.find((e) => e.id === expenseId)
    if (targetExp) {
      setDeletingExpense(targetExp)
    }
  }

  const handleConfirmDeleteExpense = async () => {
    if (!deletingExpense) return
    try {
      setIsDeletingExpense(true)
      await api.deleteExpense(deletingExpense.id)

      setBudget((prev) => {
        if (!prev) return prev
        const deletedAmount = Number(deletingExpense.amount)
        const newSpent = prev.spent - deletedAmount
        const newRemaining = prev.monthly_limit - newSpent
        const updatedExpenses = prev.expenses.filter((e) => e.id !== deletingExpense.id)

        return {
          ...prev,
          spent: newSpent,
          remaining: newRemaining,
          expenses: updatedExpenses,
        }
      })

      setDeletingExpense(null)
    } catch (err) {
      alert(err.message || 'Failed to delete expense.')
    } finally {
      setIsDeletingExpense(false)
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading budget details...</p>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block font-medium"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center">
          <p className="font-semibold mb-2">Error Loading Budget</p>
          <p className="text-sm mb-4">{error || 'Budget not found.'}</p>
          <button
            onClick={fetchBudgetDetail}
            className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isOverBudget = budget.spent > budget.monthly_limit
  const percentage =
    budget.monthly_limit > 0
      ? Math.min(100, Math.round((budget.spent / budget.monthly_limit) * 100))
      : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditBudgetOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            ✏️ Edit Budget
          </button>
          <button
            onClick={() => setIsDeleteBudgetOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors"
          >
            🗑️ Delete Budget
          </button>
        </div>
      </div>

      {/* Main Budget Card Summary */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-gray-900">{budget.category}</h1>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {budget.month}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Detailed expense log & limit tracking for this category
            </p>
          </div>

          <div>
            {isOverBudget ? (
              <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full border border-red-200">
                Over Budget by {formatCurrency(Math.abs(budget.remaining))}
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                {formatCurrency(budget.remaining)} Available
              </span>
            )}
          </div>
        </div>

        {/* Amount Metrics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Monthly Limit</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {formatCurrency(budget.monthly_limit)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Spent</p>
            <p className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(budget.spent)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Remaining</p>
            <p
              className={`text-xl font-bold mt-1 ${
                budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrency(budget.remaining)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Expense Form */}
      <ExpenseForm budgetId={budget.id} onSuccess={handleExpenseAdded} />

      {/* Expense List */}
      <ExpenseList
        expenses={budget.expenses}
        onDeleteExpense={handlePromptDeleteExpense}
        onUpdateExpense={handleExpenseUpdated}
      />

      {/* Budget Edit Modal */}
      <BudgetForm
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        initialData={budget}
        onSuccess={handleBudgetUpdated}
      />

      {/* Custom Budget Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteBudgetOpen}
        onClose={() => setIsDeleteBudgetOpen(false)}
        onConfirm={handleConfirmDeleteBudget}
        loading={isDeletingBudget}
        title={`Delete Budget "${budget.category}"?`}
        message="Are you sure you want to delete this budget category?"
        warning="⚠️ Warning: Deleting this budget will automatically delete all associated expense records!"
        confirmText="Yes, Delete Budget"
      />

      {/* Custom Expense Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDeleteExpense}
        loading={isDeletingExpense}
        title="Delete Expense?"
        message={`Are you sure you want to delete this expense of ${
          deletingExpense ? formatCurrency(deletingExpense.amount) : ''
        }${deletingExpense?.description ? ` ("${deletingExpense.description}")` : ''}?`}
        confirmText="Yes, Delete Expense"
      />
    </div>
  )
}
