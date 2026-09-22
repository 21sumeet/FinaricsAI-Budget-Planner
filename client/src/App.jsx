import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedBudgetId, setSelectedBudgetId] = useState(null)

  const handleSelectBudget = (budgetId) => {
    setSelectedBudgetId(budgetId)
    setCurrentView('detail')
  }

  const handleNavigateHome = () => {
    setSelectedBudgetId(null)
    setCurrentView('dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={handleNavigateHome}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              ₹
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Budget Planner
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold text-gray-500">
            <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
              PostgreSQL Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Page View */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <Dashboard onSelectBudget={handleSelectBudget} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <button
              onClick={handleNavigateHome}
              className="text-sm text-blue-600 hover:underline mb-4 inline-block font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Budget Detail View (Selected ID: {selectedBudgetId})
              </h2>
              <p className="text-sm text-gray-500">
                Phase 4: Expense list & expense logger will be integrated here.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Budget Planner — Finarics AI Assignment Build
      </footer>
    </div>
  )
}

export default App
