import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'
import { AgentsPage } from '@/components/AgentsPage'
import { TasksPage } from '@/components/TasksPage'
import { MetricsPage } from '@/components/MetricsPage'
import { LogsPage } from '@/components/LogsPage'
import { SettingsPage } from '@/components/SettingsPage'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/ThemeProvider'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    status: 'loading',
    agents: { total: 0, active: 0 },
    tasks: { total: 0, running: 0 },
    errors: { total: 0 }
  })

  // Fetch system status on mount
  useEffect(() => {
    fetchSystemStatus()
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemStatus, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      // In a real app, this would call the API
      // For demo, we'll simulate the data
      setSystemStatus({
        status: 'healthy',
        agents: { total: 3, active: 3 },
        tasks: { total: 156, running: 4 },
        errors: { total: 2 }
      })
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setSystemStatus(prev => ({ ...prev, status: 'error' }))
    }
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="fmaa-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <Sidebar 
            open={sidebarOpen} 
            onOpenChange={setSidebarOpen}
            systemStatus={systemStatus}
          />
          
          <div className="lg:pl-72">
            <Header 
              onMenuClick={() => setSidebarOpen(true)}
              systemStatus={systemStatus}
            />
            
            <main className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard systemStatus={systemStatus} />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/metrics" element={<MetricsPage />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>
          </div>
          
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
