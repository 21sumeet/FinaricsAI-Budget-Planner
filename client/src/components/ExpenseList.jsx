import React, { useState } from 'react'

export default function ExpenseList({ expenses, onDeleteExpense, onUpdateExpense }) {
  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const startEdit = (exp) => {
    setEditingId(exp.id)
    setEditAmount(exp.amount)
    setEditDescription(exp.description || '')
    const formattedDate = exp.date ? new Date(exp.date).toISOString().slice(0, 10) : ''
    setEditDate(formattedDate)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAmount('')
    setEditDescription('')
    setEditDate('')
  }

  const handleSaveEdit = (id) => {
    const numericAmount = Number(editAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Amount must be a positive number.')
      return
    }

    onUpdateExpense &&
      onUpdateExpense(id, {
        amount: numericAmount,
        description: editDescription.trim(),
        date: editDate,
      })

    cancelEdit()
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 my-4">
        <p className="text-sm font-medium">No expenses logged for this budget yet.</p>
        <p className="text-xs text-gray-400 mt-1">Use the form above to log your first expense.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base">Logged Expenses ({expenses.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-6 text-right">Amount</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {expenses.map((exp) => {
              const isEditing = editingId === exp.id

              if (isEditing) {
                return (
                  <tr key={exp.id} className="bg-blue-50/50">
                    <td className="py-3 px-6">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-3 px-6">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-3 px-6 text-right">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                      />
                    </td>
                    <td className="py-3 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleSaveEdit(exp.id)}
                        className="text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs font-semibold px-2.5 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap text-gray-600 font-medium">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-3.5 px-6 text-gray-900">
                    {exp.description || <span className="text-gray-400 italic">No description</span>}
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-gray-900">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3.5 px-6 text-center space-x-2">
                    <button
                      onClick={() => startEdit(exp)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteExpense && onDeleteExpense(exp.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
