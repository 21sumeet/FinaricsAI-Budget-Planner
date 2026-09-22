import React from 'react'

export default function ExpenseList({ expenses, onDeleteExpense }) {
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
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {expenses.map((exp) => (
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
                <td className="py-3.5 px-6 text-center">
                  <button
                    onClick={() => onDeleteExpense && onDeleteExpense(exp.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
