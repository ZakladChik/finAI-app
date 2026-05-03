import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

const DEV_MODE = import.meta.env.DEV
const [user, setUser] = useState(DEV_MODE ? DEV_USER : null)
const [loading, setLoading] = useState(DEV_MODE ? false : true)

  useEffect(() => {
    // Si estamos en modo desarrollo, no hacemos nada
    if (DEV_MODE) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password) => {
    if (DEV_MODE) return { error: null }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email, password) => {
    if (DEV_MODE) return { error: null }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (DEV_MODE) return
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({ user, loading, signUp, signIn, signOut }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}