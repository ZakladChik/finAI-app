// src/pages/Register.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Register({ onNavigate }) {
  const { t } = useTranslation()
  const { signUp, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)

    // 1. Crear cuenta
    const { error: err } = await signUp(email, password)
    if (err) {
      setError('Error: ' + err.message)
      setLoading(false)
      return
    }

    // 2. Iniciar sesión automáticamente
    const { error: loginErr } = await signIn(email, password)
    if (loginErr) {
      setError('Cuenta creada, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente.')
      setLoading(false)
      return
    }

    // 3. La redirección al formulario de empresa la gestiona App.jsx automáticamente
    setSuccess(t('auth.success'))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f1e33] p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('auth.register_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.register_subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v4H9V9zm0-4h2v2H9V5z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-xl mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L10 10.586l2.293-2.293a1 1 0 011.414 1.414z" clipRule="evenodd"/>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#1e3a5f] font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.register_loading') : t('auth.register_btn')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.has_account')}{' '}
          <button onClick={() => onNavigate('login')} className="text-[#1e3a5f] font-semibold hover:underline transition-all">
            {t('auth.go_login')}
          </button>
        </p>
      </div>
    </div>
  )
}