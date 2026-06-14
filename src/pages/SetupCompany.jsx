// src/pages/SetupCompany.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'

export default function SetupCompany({ onComplete }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    tipo_contribuyente: '',
    regimen_iva: '',
    sector: '',
    direccion: '',
    provincia: '',
    canton: '',
    email_contacto: user?.email || '',
    telefono: '',
    nombre_dueno: '',
    cedula_dueno: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.razon_social || !form.ruc || !form.nombre_dueno || !form.cedula_dueno) {
      setError('Por favor completa los campos obligatorios: Razón social, RUC, Nombre del dueño y Cédula.')
      return
    }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('empresas').insert({
      empresas_id: user.id,
      razon_social: form.razon_social,
      nombre_comercial: form.nombre_comercial,
      ruc: form.ruc,
      tipo_contribuyente: form.tipo_contribuyente,
      regimen_iva: form.regimen_iva,
      sector: form.sector,
      direccion: form.direccion,
      provincia: form.provincia,
      canton: form.canton,
      email_contacto: form.email_contacto,
      telefono: form.telefono,
      nombre_dueno: form.nombre_dueno,
      cedula_dueno: form.cedula_dueno,
      setup_complete: true,
    })

    if (insertError) {
      setError('Error al guardar los datos: ' + insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f1e33] p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl">
        {/* Selector de idioma */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] shadow-lg mb-4">
                <span className="text-4xl font-bold text-white">F</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Registro de tu Empresa</h1>
              <p className="text-sm text-gray-500 mt-1">Completa los datos de tu negocio para empezar a usar FinAI</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                <input name="razon_social" value={form.razon_social} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                <input name="nombre_comercial" value={form.nombre_comercial} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
                <input name="ruc" value={form.ruc} onChange={handleChange} required maxLength={13}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contribuyente</label>
                <select name="tipo_contribuyente" value={form.tipo_contribuyente} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                  <option value="">Seleccionar...</option>
                  <option value="Persona Natural">Persona Natural</option>
                  <option value="Sociedad">Sociedad</option>
                  <option value="RIMPE">RIMPE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Régimen IVA</label>
                <select name="regimen_iva" value={form.regimen_iva} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                  <option value="">Seleccionar...</option>
                  <option value="General (15%)">General (15%)</option>
                  <option value="Simplificado">Simplificado</option>
                  <option value="Exento">Exento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <input name="sector" value={form.sector} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <input name="provincia" value={form.provincia} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantón</label>
                <input name="canton" value={form.canton} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de la empresa</label>
                <input type="email" name="email_contacto" value={form.email_contacto} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Dueño *</label>
                <input name="nombre_dueno" value={form.nombre_dueno} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula del Dueño *</label>
                <input name="cedula_dueno" value={form.cedula_dueno} onChange={handleChange} required maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading}
                  className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl hover:bg-[#2a4a6d] transition-all font-semibold disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Completar Registro'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-6">Tu empresa ha sido registrada. Bienvenido a FinAI.</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#d4af37] border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Redirigiendo al panel principal...</p>
          </div>
        )}
      </div>
    </div>
  )
}