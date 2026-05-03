// src/pages/Clientes.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = false

const datosLocales = [
  { id: 1, identificacion: '1712345678001', nombre: 'Ferretería Central (demo)', email: 'contacto@ferreteria.com', telefono: '0991234567' },
  { id: 2, identificacion: '0987654321001', nombre: 'Consultora Z (demo)', email: 'info@consultoraz.com', telefono: '0987654321' },
  { id: 3, identificacion: '0456123789001', nombre: 'Tienda El Sol (demo)', email: 'ventas@tiendaelsol.com', telefono: '0974561230' },
]

export default function Clientes() {
  const { t } = useTranslation()
  const [clientes, setClientes] = useState(DEV_MODE ? datosLocales : [])
  const [form, setForm] = useState({ identificacion: '', nombre: '', email: '', telefono: '' })
  const [loading, setLoading] = useState(false)

  const loadClientes = async () => {
    if (DEV_MODE) return
    const { data } = await supabase.from('clientes').select('*').order('nombre')
    if (data) setClientes(data)
  }

  useEffect(() => { loadClientes() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.identificacion) return
    setLoading(true)

    if (DEV_MODE) {
      setClientes([{ id: Date.now(), ...form }, ...clientes])
      setForm({ identificacion: '', nombre: '', email: '', telefono: '' })
      setLoading(false)
      return
    }

    await supabase.from('clientes').insert({ ...form, empresa_id: '00000000-0000-0000-0000-000000000000' })
    setForm({ identificacion: '', nombre: '', email: '', telefono: '' })
    loadClientes()
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">👥 {t('clientes.title')}</h2>
        {DEV_MODE && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{t('dashboard.modo_demo')}</span>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">{t('clientes.nuevo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('clientes.ruc')}</label>
            <input type="text" name="identificacion" value={form.identificacion} onChange={handleChange} placeholder="13 dígitos" maxLength={13} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('clientes.nombre')}</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del cliente" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('clientes.email')}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('clientes.telefono')}</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="099..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-4 bg-[#1e3a5f] text-white px-6 py-2 rounded-lg hover:bg-[#2a4a6d] transition-colors disabled:opacity-50">
          {loading ? t('clientes.guardando') : t('clientes.guardar')}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">{t('clientes.lista')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500">{t('clientes.ruc').replace(' *', '')}</th>
                <th className="text-left py-2 px-3 text-gray-500">{t('clientes.nombre').replace(' *', '')}</th>
                <th className="text-left py-2 px-3 text-gray-500">{t('clientes.email')}</th>
                <th className="text-left py-2 px-3 text-gray-500">{t('clientes.telefono')}</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-600">{c.identificacion}</td>
                  <td className="py-2 px-3 font-medium text-[#1e3a5f]">{c.nombre}</td>
                  <td className="py-2 px-3 text-gray-600">{c.email || '-'}</td>
                  <td className="py-2 px-3 text-gray-600">{c.telefono || '-'}</td>
                </tr>
              ))}
              {clientes.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-400">{t('clientes.no_hay')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}