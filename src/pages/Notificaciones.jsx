// src/pages/Notificaciones.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { generateNotifications } from '../services/notificationService'

export default function Notificaciones() {
  const { t } = useTranslation()
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotificaciones()
  }, [])

  const loadNotificaciones = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Generar nuevas notificaciones si corresponde
    await generateNotifications(user.id, null)

    // Cargar notificaciones no leídas
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotificaciones(data || [])
    setLoading(false)
  }

  const marcarComoLeida = async (id) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id)
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const marcarTodasComoLeidas = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', user.id)
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Cargando notificaciones...</p>
      </div>
    )
  }

  const iconosTipo = { alerta: '⚠️', consejo: '💡', info: '📋' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">🔔 Notificaciones</h2>
        <button
          onClick={marcarTodasComoLeidas}
          className="text-sm text-[#1e3a5f] hover:underline"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="space-y-3">
        {notificaciones.filter(n => !n.leida).length === 0 && (
          <p className="text-center text-gray-400 py-6">No hay notificaciones nuevas</p>
        )}
        {notificaciones.map(n => (
          <div
            key={n.id}
            className={`bg-white rounded-xl shadow-md p-4 flex items-start gap-3 transition-opacity ${n.leida ? 'opacity-50' : ''}`}
          >
            <span className="text-xl mt-0.5">{iconosTipo[n.tipo] || '•'}</span>
            <p className="flex-1 text-sm text-gray-700">{n.mensaje}</p>
            {!n.leida && (
              <button
                onClick={() => marcarComoLeida(n.id)}
                className="text-xs text-[#d4af37] hover:underline mt-1"
              >
                Leída
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}