// src/App.jsx
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Clientes from './pages/Clientes'
import Reportes from './pages/Reportes'
import ChatIA from './pages/ChatIA'
import Notificaciones from './pages/Notificaciones' // ← NUEVO
import Login from './pages/Login'
import Register from './pages/Register'
import SetupCompany from './pages/SetupCompany'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [activePage, setActivePage] = useState('/')
  const [authPage, setAuthPage] = useState('login')
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(false)

  // Verifica si la empresa ya tiene setup completo
  useEffect(() => {
    if (!user) return
    const checkCompanySetup = async () => {
      setCheckingSetup(true)
      const { data, error } = await supabase
        .from('empresas')
        .select('setup_complete')
        .eq('empresas_id', user.id)
        .maybeSingle()
      
      if (!error && data) {
        setNeedsSetup(!data.setup_complete)
      } else {
        // Si no hay registro de empresa, necesita setup
        setNeedsSetup(true)
      }
      setCheckingSetup(false)
    }
    checkCompanySetup()
  }, [user])

  if (loading || checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    )
  }

  // Usuario no autenticado: mostrar Login/Register
  if (!user) {
    return authPage === 'login'
      ? <Login onNavigate={setAuthPage} />
      : authPage === 'register'
      ? <Register onNavigate={setAuthPage} />
      : <Login onNavigate={setAuthPage} />
  }

  // Usuario autenticado pero necesita configurar empresa
  if (needsSetup) {
    return <SetupCompany onComplete={() => setNeedsSetup(false)} />
  }

  // Usuario autenticado y empresa configurada: mostrar app principal
  const renderPage = () => {
    switch (activePage) {
      case '/': return <Dashboard />
      case '/transacciones': return <Transacciones />
      case '/clientes': return <Clientes />
      case '/reportes': return <Reportes />
      case '/chat': return <ChatIA />
      case '/notificaciones': return <Notificaciones />  // ← NUEVO
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