// src/App.jsx
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Clientes from './pages/Clientes'
import Reportes from './pages/Reportes'
import ChatIA from './pages/ChatIA'
import Login from './pages/Login'
import Register from './pages/Register'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [activePage, setActivePage] = useState('/')
  const [authPage, setAuthPage] = useState('login')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return authPage === 'login'
      ? <Login onNavigate={setAuthPage} />
      : <Register onNavigate={setAuthPage} />
  }

  const renderPage = () => {
    switch (activePage) {
      case '/': return <Dashboard />
      case '/transacciones': return <Transacciones />
      case '/clientes': return <Clientes />
      case '/reportes': return <Reportes />
      case '/chat': return <ChatIA />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        userEmail={user.email}
        onLogout={signOut}
      />
      <main className="flex-1 p-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}