// src/pages/Register.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Register({ onNavigate }) {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    const { error: err } = await signUp(email, password)
    if (err) {
      setError('Error: ' + err.message)
    } else {
      setSuccess(t('auth.success'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src="logo-fondo-blanco.png" alt="FinAI logo" className="w-20 h-20 mx-auto mb-3 rounded-xl shadow-md" />
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('auth.register_title')}</h1>
          <p className="text-sm text-gray-500">{t('auth.register_subtitle')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-[#1e3a5f] font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
            {loading ? t('auth.register_loading') : t('auth.register_btn')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {t('auth.has_account')}{' '}
          <button onClick={() => onNavigate('login')} className="text-[#1e3a5f] font-semibold hover:underline">
            {t('auth.go_login')}
          </button>
        </p>
      </div>
    </div>
  )
}