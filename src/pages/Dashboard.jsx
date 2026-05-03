// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = false

export default function Dashboard() {
  const { t } = useTranslation()
  const [totales, setTotales] = useState({ ingresos: 0, egresos: 0, balance: 0, iva: 0 })
  const [ultimasTransacciones, setUltimasTransacciones] = useState([])
  const [totalClientes, setTotalClientes] = useState(0)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    if (DEV_MODE) {
      setTotales({ ingresos: 2800, egresos: 460, balance: 2340, iva: 420 })
      setUltimasTransacciones([
        { id: 1, desc: t('transacciones.ingreso') + ' - Demo A', monto: '+$850.00', tipo: 'ingreso' },
        { id: 2, desc: t('transacciones.egreso') + ' - Demo B', monto: '-$120.00', tipo: 'egreso' },
        { id: 3, desc: t('transacciones.ingreso') + ' - Demo C', monto: '+$1,500.00', tipo: 'ingreso' },
        { id: 4, desc: t('transacciones.egreso') + ' - Demo D', monto: '-$340.00', tipo: 'egreso' },
        { id: 5, desc: 'Factura #001-002', monto: '+$450.00', tipo: 'ingreso' },
      ])
      setTotalClientes(3)
      return
    }
    const { data: transacciones } = await supabase.from('transacciones').select('*')
    const { count: clientesCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
    if (transacciones) {
      const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
      const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)
      setTotales({ ingresos, egresos, balance: ingresos - egresos, iva: ingresos * 0.15 })
      setUltimasTransacciones(transacciones.slice(0, 5).map(t => ({
        id: t.id, desc: t.descripcion,
        monto: `${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}`, tipo: t.tipo,
      })))
    }
    if (clientesCount !== null) setTotalClientes(clientesCount)
  }

  const tarjetas = [
    { titulo: t('dashboard.ingresos'), valor: `$${totales.ingresos.toFixed(2)}`, icono: '📈', color: 'bg-green-100 text-green-700' },
    { titulo: t('dashboard.egresos'), valor: `$${totales.egresos.toFixed(2)}`, icono: '📉', color: 'bg-red-100 text-red-700' },
    { titulo: t('dashboard.balance'), valor: `$${totales.balance.toFixed(2)}`, icono: '💰', color: 'bg-blue-100 text-blue-700' },
    { titulo: t('dashboard.iva'), valor: `$${totales.iva.toFixed(2)}`, icono: '🧾', color: 'bg-yellow-100 text-yellow-700' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">📊 {t('dashboard.title')}</h2>
        {DEV_MODE && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{t('dashboard.modo_demo')}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map((tarjeta) => (
          <div key={tarjeta.titulo} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{tarjeta.icono}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${tarjeta.color}`}>{t('dashboard.este_mes')}</span>
            </div>
            <p className="text-gray-500 text-sm">{tarjeta.titulo}</p>
            <p className="text-2xl font-bold text-[#1e3a5f] mt-1">{tarjeta.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">🕐 {t('dashboard.actividad')}</h3>
          <div className="space-y-3">
            {ultimasTransacciones.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{item.desc}</span>
                <span className={`text-sm font-semibold ${item.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>{item.monto}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">📋 {t('dashboard.resumen')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('dashboard.total_clientes')}</span>
              <span className="font-bold text-[#1e3a5f]">{totalClientes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('dashboard.transacciones_count')}</span>
              <span className="font-bold text-[#1e3a5f]">{ultimasTransacciones.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('dashboard.margen')}</span>
              <span className="font-bold text-green-600">
                {totales.ingresos > 0 ? ((totales.balance / totales.ingresos) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}