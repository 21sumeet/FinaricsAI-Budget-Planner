import React, { useState } from 'react'
import { api } from '../api/client'

export default function ExpenseForm({ budgetId, onSuccess }) {
  const today = new Date().toISOString().slice(0, 10)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [overBudgetWarning, setOverBudgetWarning] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setOverBudgetWarning(false)

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }

    try {
      setSubmitting(true)
      const newExpense = await api.createExpense(budgetId, {
        amount: numericAmount,
        description: description.trim(),
        date: date || today,
      })

      if (newExpense.over_budget) {
        setOverBudgetWarning(true)
      }

      // Reset form fields
      setAmount('')
      setDescription('')
      setDate(today)

      onSuccess(newExpense)
    } catch (err) {
      setError(err.message || 'Failed to log expense.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 mb-6">
      <h3 className="font-bold text-gray-900 text-base mb-4">Log New Expense</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {overBudgetWarning && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-center space-x-2">
          <span>⚠️</span>
          <span className="font-medium">
            Notice: Expense added successfully, but this category is now <strong>over budget</strong>!
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Amount (₹) *
          </label>
          <input
            type="number"
            required
            min="1"
            step="any"
            placeholder="e.g. 450"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {submitting ? 'Adding...' : '+ Add Expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
