import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

const DEV_MODE = import.meta.env.DEV

const DEV_USER = {
  id: 'dev-user-123',
  email: 'dev@finAI.local',
  role: 'authenticated',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEV_MODE ? DEV_USER : null)
  const [loading, setLoading] = useState(DEV_MODE ? false : true)

  useEffect(function () {
    if (DEV_MODE) return

    supabase.auth.getSession().then(function (result) {
      setUser(result.data.session?.user ?? null)
      setLoading(false)
    })

    var listener = supabase.auth.onAuthStateChange(function (event, session) {
      setUser(session?.user ?? null)
    })

    return function cleanup() {
      listener.data.subscription.unsubscribe()
    }
  }, [])

  var signUp = async function (email, password) {
    if (DEV_MODE) return { error: null }
    var result = await supabase.auth.signUp({ email: email, password: password })
    return { error: result.error }
  }

  var signIn = async function (email, password) {
    if (DEV_MODE) return { error: null }
    var result = await supabase.auth.signInWithPassword({ email: email, password: password })
    return { error: result.error }
  }

  var signOut = async function () {
    if (DEV_MODE) return
    await supabase.auth.signOut()
  }

  var value = useMemo(function () {
    return { user: user, loading: loading, signUp: signUp, signIn: signIn, signOut: signOut }
  }, [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  var context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}