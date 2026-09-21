import { useEffect, useState } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then(res => res.json())
      .then(data => {
        console.log('Health check:', data)
        setHealthStatus(data.status)
      })
      .catch(err => console.error('API Health Check Error:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Budget Planner</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Backend status:</span>
          <span className={`px-2 py-0.5 rounded font-semibold ${healthStatus === 'ok' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {healthStatus || 'Checking...'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
