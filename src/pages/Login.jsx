// src/pages/Login.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Login({ onNavigate }) {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) setError('Error: ' + err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('app.name')}</h1>
          <p className="text-sm text-gray-500">{t('auth.login_subtitle')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white py-2 rounded-lg hover:bg-[#2a4a6d] transition-colors disabled:opacity-50">
            {loading ? t('auth.login_loading') : t('auth.login_btn')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {t('auth.no_account')}{' '}
          <button onClick={() => onNavigate('register')} className="text-[#d4af37] font-semibold hover:underline">
            {t('auth.go_register')}
          </button>
        </p>
      </div>
    </div>
  )
}