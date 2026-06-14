// src/components/layout/Sidebar.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { supabase } from '../../lib/supabaseClient'

export default function Sidebar({ activePage, onNavigate, userEmail, onLogout }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  const menuItems = [
    { nombre: t('sidebar.dashboard'), icono: '📊', ruta: '/' },
    { nombre: t('sidebar.transacciones'), icono: '💵', ruta: '/transacciones' },
    { nombre: t('sidebar.clientes'), icono: '👥', ruta: '/clientes' },
    { nombre: t('sidebar.reportes'), icono: '📑', ruta: '/reportes' },
    { nombre: t('sidebar.chat_ia'), icono: '🤖', ruta: '/chat' },
    { nombre: t('sidebar.notificaciones'), icono: '🔔', ruta: '/notificaciones', badge: notifCount },
  ]

  // Cargar cantidad de notificaciones no leídas
  useEffect(() => {
    const loadNotifCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('leida', false)
      setNotifCount(count || 0)
    }
    loadNotifCount()
  }, [activePage]) // se actualiza al navegar

  return (
    <aside
      className={`min-h-screen bg-[#1e3a5f] text-white flex flex-col p-4 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo + botón colapso */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-2 ${collapsed ? 'hidden' : ''}`}>
          <img src="logo-fondo-azul.png" alt="FinAI logo" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-[#d4af37] leading-tight">{t('app.name')}</h1>
            <p className="text-xs text-gray-300">{t('app.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-300 hover:text-white transition-colors text-xl ml-auto"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Selector de idioma */}
      <div className={`mb-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <LanguageSwitcher />
      </div>

      {/* Menú */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.ruta}>
              <button
                onClick={() => onNavigate(item.ruta)}
                title={collapsed ? item.nombre : ''}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activePage === item.ruta
                    ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold shadow-lg'
                    : 'hover:bg-[#2a4a6d] text-white'
                }`}
              >
                <span className="text-lg relative">
                  {item.icono}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                {!collapsed && <span>{item.nombre}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer con usuario y logout */}
      <div className={`text-xs text-gray-400 pt-4 border-t border-[#2a4a6d] space-y-2 ${collapsed ? 'text-center' : ''}`}>
        <p className={`truncate ${collapsed ? 'hidden' : ''}`} title={userEmail}>
          👤 {userEmail}
        </p>
        <button
          onClick={onLogout}
          className={`w-full text-left text-red-400 hover:text-red-300 transition-colors ${collapsed ? 'text-center' : ''}`}
        >
          🚪 {!collapsed && t('sidebar.logout')}
        </button>
        {!collapsed && <p className="text-center">{t('app.version')}</p>}
      </div>
    </aside>
  )
}