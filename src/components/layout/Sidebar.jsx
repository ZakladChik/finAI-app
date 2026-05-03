// src/components/layout/Sidebar.jsx
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../common/LanguageSwitcher'

export default function Sidebar({ activePage, onNavigate, userEmail, onLogout }) {
  const { t } = useTranslation()

  const menuItems = [
    { nombre: t('sidebar.dashboard'), icono: '📊', ruta: '/' },
    { nombre: t('sidebar.transacciones'), icono: '💵', ruta: '/transacciones' },
    { nombre: t('sidebar.clientes'), icono: '👥', ruta: '/clientes' },
    { nombre: t('sidebar.reportes'), icono: '📑', ruta: '/reportes' },
    { nombre: t('sidebar.chat_ia'), icono: '🤖', ruta: '/chat' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-[#1e3a5f] text-white flex flex-col p-4">
      {/* Logo */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-[#d4af37]">{t('app.name')}</h1>
        <p className="text-xs text-gray-300">{t('app.subtitle')}</p>
      </div>

      {/* Selector de idioma */}
      <div className="mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Menú */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.ruta}>
              <button
                onClick={() => onNavigate(item.ruta)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activePage === item.ruta
                    ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold'
                    : 'hover:bg-[#2a4a6d] text-white'
                }`}
              >
                <span className="text-lg">{item.icono}</span>
                <span>{item.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer con usuario y logout */}
      <div className="text-xs text-gray-400 pt-4 border-t border-[#2a4a6d] space-y-2">
        <p className="truncate" title={userEmail}>
          👤 {userEmail}
        </p>
        <button
          onClick={onLogout}
          className="w-full text-left text-red-400 hover:text-red-300 transition-colors"
        >
          🚪 {t('sidebar.logout')}
        </button>
        <p className="text-center">{t('app.version')}</p>
      </div>
    </aside>
  )
}