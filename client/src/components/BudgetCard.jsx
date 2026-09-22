import React from 'react'

export default function BudgetCard({ budget, onSelect, onEdit, onDelete }) {
  const { id, category, monthly_limit, spent, remaining, month } = budget

  const limitNum = Number(monthly_limit) || 0
  const spentNum = Number(spent) || 0
  const remainingNum = Number(remaining) || 0

  const isOverBudget = spentNum > limitNum
  const percentage = limitNum > 0 ? Math.min(100, Math.round((spentNum / limitNum) * 100)) : 0

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    const confirmMessage = `Are you sure you want to delete the budget "${category}"?\n\n⚠️ Warning: Deleting this budget will automatically remove all associated expenses!`
    if (window.confirm(confirmMessage)) {
      onDelete && onDelete(id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit && onEdit(budget)
  }

  return (
    <div
      onClick={() => onSelect && onSelect(id)}
      className="bg-white rounded-xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer overflow-hidden p-6 flex flex-col justify-between group"
    >
      <div>
        {/* Header: Category, Month Badge, and Action Buttons */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {category}
            </h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {month}
            </span>
          </div>

          <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              title="Edit Budget"
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-xs font-medium"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              title="Delete Budget"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs font-medium"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Amounts Overview */}
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Spent</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(spentNum)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold">Limit</p>
            <p className="text-lg font-bold text-gray-700">{formatCurrency(limitNum)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Remaining & Over budget Alert */}
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-gray-500">{percentage}% spent</span>
          {isOverBudget ? (
            <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Over by {formatCurrency(Math.abs(remainingNum))}
            </span>
          ) : (
            <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {formatCurrency(remainingNum)} left
            </span>
          )}
        </div>
      </div>

      {/* View Details Action */}
      <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-blue-600 font-medium">
        <span>View Expenses Log</span>
        <span>→</span>
      </div>
    </div>
  )
}
