// src/pages/Transacciones.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = import.meta.env.DEV

const datosLocales = [
  { id: 1, tipo: 'ingreso', monto: 850.00, descripcion: 'Venta del día (demo)', fecha: '2026-05-01' },
  { id: 2, tipo: 'egreso', monto: 120.00, descripcion: 'Servicios básicos (demo)', fecha: '2026-05-01' },
  { id: 3, tipo: 'ingreso', monto: 450.00, descripcion: 'Factura #001 (demo)', fecha: '2026-05-02' },
]

export default function Transacciones() {
  const { t } = useTranslation()
  const [transacciones, setTransacciones] = useState(DEV_MODE ? datosLocales : [])
  const [form, setForm] = useState({
    tipo: 'ingreso',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    archivo: null,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const fileInputRef = useRef(null)

  // Obtener el id de la empresa al montar el componente
  useEffect(() => {
    const getEmpresaId = async () => {
      if (DEV_MODE) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('empresas_id', user.id)
        .single()
      if (empresa) {
        setEmpresaId(empresa.id)
      }
    }
    getEmpresaId()
  }, [])

  const loadTransacciones = async () => {
    if (DEV_MODE) return
    if (!empresaId) return
    const { data } = await supabase
      .from('transacciones')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false })
      .limit(10)
    if (data) setTransacciones(data)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (empresaId) loadTransacciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, archivo: file })
    }
  }

  const uploadFile = async (file, userId) => {
    const fileName = `${userId}_${Date.now()}_${file.name}`
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.storage
      .from('comprobantes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })
    if (error) throw error
    const { data: urlData } = supabase.storage
      .from('comprobantes')
      .getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || !form.descripcion) return
    if (!empresaId) {
      alert('No se encontró la empresa asociada a tu cuenta.')
      return
    }
    setLoading(true)

    if (DEV_MODE) {
      setTransacciones([{ id: Date.now(), tipo: form.tipo, monto: parseFloat(form.monto), descripcion: form.descripcion, fecha: form.fecha }, ...transacciones])
      setForm({ tipo: 'ingreso', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], archivo: null })
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    let archivoUrl = null
    if (form.archivo) {
      setUploading(true)
      try {
        archivoUrl = await uploadFile(form.archivo, user.id)
      } catch (error) {
        console.error('Error al subir archivo:', error)
        alert('No se pudo subir el archivo. Intenta de nuevo.')
        setUploading(false)
        setLoading(false)
        return
      }
      setUploading(false)
    }

    const { error } = await supabase.from('transacciones').insert({
      tipo: form.tipo,
      monto: parseFloat(form.monto),
      descripcion: form.descripcion,
      fecha: form.fecha,
      empresa_id: empresaId,
      archivo_url: archivoUrl,
    })

    if (!error) {
      setForm({ tipo: 'ingreso', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], archivo: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadTransacciones()
    } else {
      console.error('Error al insertar transacción:', error)
      alert('Error al guardar la transacción. Revisa la consola para más detalles.')
    }
    setLoading(false)
  }

  const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const totalEgresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)
  const balance = totalIngresos - totalEgresos

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">💵 {t('transacciones.title')}</h2>
        {DEV_MODE && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{t('dashboard.modo_demo')}</span>}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-sm text-green-600">{t('transacciones.ingresos')}</p>
          <p className="text-xl font-bold text-green-700">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{t('transacciones.egresos')}</p>
          <p className="text-xl font-bold text-red-700">${totalEgresos.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600">{t('transacciones.balance')}</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>${balance.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">{t('transacciones.nueva')}</h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">📎 Adjuntar comprobante (opcional)</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {form.archivo && (
              <span className="text-sm text-green-600">✅ {form.archivo.name}</span>
            )}
            {uploading && <span className="text-sm text-gray-500">Subiendo...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('transacciones.tipo')}</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              <option value="ingreso">{t('transacciones.ingreso')}</option>
              <option value="egreso">{t('transacciones.egreso')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('transacciones.monto')}</label>
            <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('transacciones.descripcion')}</label>
            <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Ej: Venta del día" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('transacciones.fecha')}</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
          </div>
        </div>
        <button type="submit" disabled={loading || uploading} className="mt-4 bg-[#1e3a5f] text-white px-6 py-2 rounded-lg hover:bg-[#2a4a6d] transition-colors disabled:opacity-50">
          {loading ? t('transacciones.guardando') : t('transacciones.guardar')}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">{t('transacciones.ultimas')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500">{t('transacciones.fecha')}</th>
                <th className="text-left py-2 px-3 text-gray-500">{t('transacciones.tipo')}</th>
                <th className="text-left py-2 px-3 text-gray-500">{t('transacciones.descripcion')}</th>
                <th className="text-right py-2 px-3 text-gray-500">{t('transacciones.monto')}</th>
                <th className="text-center py-2 px-3 text-gray-500">📎</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((item) => {
                const tipoLabel = item.tipo === 'ingreso' ? t('transacciones.ingreso') : t('transacciones.egreso')
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{item.fecha}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tipoLabel}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{item.descripcion}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${item.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.tipo === 'ingreso' ? '+' : '-'}${item.monto.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.archivo_url ? (
                        <a href={item.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">📄 Ver</a>
                      ) : '-'}
                    </td>
                  </tr>
                )
              })}
              {transacciones.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400">{t('transacciones.no_hay')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}