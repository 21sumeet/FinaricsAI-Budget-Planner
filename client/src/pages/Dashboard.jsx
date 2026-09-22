import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import BudgetCard from '../components/BudgetCard'
import BudgetForm from '../components/BudgetForm'
import ConfirmModal from '../components/ConfirmModal'

export default function Dashboard({ onSelectBudget }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  // Custom Delete Confirmation Modal state
  const [deletingBudget, setDeletingBudget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBudgets()
      setBudgets(data)
    } catch (err) {
      setError(err.message || 'Failed to load budgets from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingBudget(null)
    setIsFormOpen(true)
  }

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget)
    setIsFormOpen(true)
  }

  const handleBudgetSaved = (savedBudget, isEditMode) => {
    if (isEditMode) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === savedBudget.id ? { ...b, ...savedBudget } : b))
      )
    } else {
      setBudgets((prev) => [savedBudget, ...prev])
    }
  }

  // Trigger custom delete confirmation modal
  const handlePromptDeleteBudget = (budget) => {
    setDeletingBudget(budget)
  }

  const handleConfirmDeleteBudget = async () => {
    if (!deletingBudget) return
    try {
      setIsDeleting(true)
      await api.deleteBudget(deletingBudget.id)
      setBudgets((prev) => prev.filter((b) => b.id !== deletingBudget.id))
      setDeletingBudget(null)
    } catch (err) {
      alert(err.message || 'Failed to delete budget.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Summary statistics across all active budgets
  const totalLimit = budgets.reduce((acc, b) => acc + (Number(b.monthly_limit) || 0), 0)
  const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0)
  const totalRemaining = totalLimit - totalSpent

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Budget Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track category spending, monitor remaining limits, and log expenses.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          + Add New Budget
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Allocated</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalLimit)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Spent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Remaining</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              totalRemaining < 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-gray-500">Loading budgets from server...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center my-8">
          <p className="font-semibold mb-2">Error Loading Data</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchBudgets}
            className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center my-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            📊
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Budgets Created Yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Get started by creating a category budget (e.g. Groceries or Rent) to track your monthly spending.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            + Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onSelect={onSelectBudget}
              onEdit={handleOpenEditModal}
              onDelete={handlePromptDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal (Create or Edit) */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingBudget}
        onSuccess={handleBudgetSaved}
      />

      {/* Custom Budget Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleConfirmDeleteBudget}
        loading={isDeleting}
        title={`Delete Budget "${deletingBudget?.category}"?`}
        message="Are you sure you want to delete this budget category?"
        warning="⚠️ Warning: Deleting this budget will automatically delete all associated expense records!"
        confirmText="Yes, Delete Budget"
      />
    </div>
  )
}
