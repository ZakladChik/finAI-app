// src/pages/Reportes.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = false

export default function Reportes() {
  const { t } = useTranslation()
  const [balance, setBalance] = useState({
    activos: { corriente: 0, noCorriente: 0, total: 0 },
    pasivos: { corriente: 0, noCorriente: 0, total: 0 },
    patrimonio: 0,
  })
  const [resultados, setResultados] = useState({
    ingresos: 0, costos: 0, utilidadBruta: 0,
    gastosOperativos: 0, utilidadOperativa: 0, utilidadNeta: 0,
  })
  const [flujoCaja, setFlujoCaja] = useState({ saldoInicial: 5000, meses: [] })
  const [ratios, setRatios] = useState({
    liquidezCorriente: 0, pruebaAcida: 0, endeudamiento: 0,
    roe: 0, roa: 0, margenNeto: 0,
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    if (DEV_MODE) {
      setBalance({ activos: { corriente: 15000, noCorriente: 25000, total: 40000 }, pasivos: { corriente: 5000, noCorriente: 10000, total: 15000 }, patrimonio: 25000 })
      setResultados({ ingresos: 2800, costos: 1200, utilidadBruta: 1600, gastosOperativos: 800, utilidadOperativa: 800, utilidadNeta: 800 })
      setFlujoCaja({ saldoInicial: 5000, meses: [
        { mes: 'Mayo 2026', ingresos: 3200, egresos: 1800, saldo: 6400 },
        { mes: 'Junio 2026', ingresos: 3500, egresos: 2000, saldo: 7900 },
        { mes: 'Julio 2026', ingresos: 3800, egresos: 2200, saldo: 9500 },
        { mes: 'Agosto 2026', ingresos: 4100, egresos: 2400, saldo: 11200 },
        { mes: 'Septiembre 2026', ingresos: 4500, egresos: 2600, saldo: 13100 },
        { mes: 'Octubre 2026', ingresos: 4800, egresos: 2800, saldo: 15100 },
      ]})
      setRatios({ liquidezCorriente: 3.0, pruebaAcida: 2.2, endeudamiento: 37.5, roe: 32.0, roa: 20.0, margenNeto: 28.6 })
      return
    }
    const { data: transacciones } = await supabase.from('transacciones').select('*')
    if (transacciones) {
      const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
      const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)
      const bn = ingresos - egresos
      setBalance({ activos: { corriente: ingresos, noCorriente: 0, total: ingresos }, pasivos: { corriente: egresos, noCorriente: 0, total: egresos }, patrimonio: bn })
      setResultados({ ingresos, costos: egresos * 0.4, utilidadBruta: ingresos - (egresos * 0.4), gastosOperativos: egresos * 0.6, utilidadOperativa: bn, utilidadNeta: bn })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">📑 {t('reportes.title')}</h2>
        {DEV_MODE && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{t('dashboard.modo_demo')}</span>}
      </div>

      {/* Balance General */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">⚖️ {t('reportes.balance')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">{t('reportes.activos')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('reportes.corriente')}</span><span className="font-medium">${balance.activos.corriente.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('reportes.no_corriente')}</span><span className="font-medium">${balance.activos.noCorriente.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-green-200 pt-2 font-bold"><span>{t('reportes.total')} {t('reportes.activos')}</span><span>${balance.activos.total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-semibold text-red-700 mb-2">{t('reportes.pasivos')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('reportes.corriente')}</span><span className="font-medium">${balance.pasivos.corriente.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('reportes.no_corriente')}</span><span className="font-medium">${balance.pasivos.noCorriente.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-red-200 pt-2 font-bold"><span>{t('reportes.total')} {t('reportes.pasivos')}</span><span>${balance.pasivos.total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">{t('reportes.patrimonio')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('reportes.capital')}</span><span className="font-medium">${balance.patrimonio.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-blue-200 pt-2 font-bold"><span>{t('reportes.total')} {t('reportes.patrimonio')}</span><span>${balance.patrimonio.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          {t('reportes.activos')} (${balance.activos.total.toFixed(2)}) = {t('reportes.pasivos')} (${balance.pasivos.total.toFixed(2)}) + {t('reportes.patrimonio')} (${balance.patrimonio.toFixed(2)})
        </div>
      </div>

      {/* Estado de Resultados */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">📈 {t('reportes.resultados')}</h3>
        <div className="max-w-md mx-auto space-y-2 text-sm">
          <div className="flex justify-between py-1"><span className="text-gray-600">{t('reportes.ingresos')}</span><span className="font-medium text-green-600">${resultados.ingresos.toFixed(2)}</span></div>
          <div className="flex justify-between py-1"><span className="text-gray-600">(-) {t('reportes.costos')}</span><span className="font-medium text-red-600">(${resultados.costos.toFixed(2)})</span></div>
          <div className="flex justify-between py-1 border-t border-gray-200 font-semibold"><span>{t('reportes.utilidad_bruta')}</span><span className="text-[#1e3a5f]">${resultados.utilidadBruta.toFixed(2)}</span></div>
          <div className="flex justify-between py-1"><span className="text-gray-600">(-) {t('reportes.gastos_operativos')}</span><span className="font-medium text-red-600">(${resultados.gastosOperativos.toFixed(2)})</span></div>
          <div className="flex justify-between py-1 border-t border-gray-200 font-semibold"><span>{t('reportes.utilidad_operativa')}</span><span className="text-[#1e3a5f]">${resultados.utilidadOperativa.toFixed(2)}</span></div>
          <div className="flex justify-between py-1 border-t-2 border-[#1e3a5f] font-bold text-lg"><span>{t('reportes.utilidad_neta')}</span><span className="text-[#1e3a5f]">${resultados.utilidadNeta.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Flujo de Caja */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">💸 {t('reportes.flujo')}</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500">{t('reportes.mes')}</th>
                <th className="text-right py-2 px-3 text-gray-500">{t('reportes.ingresos')}</th>
                <th className="text-right py-2 px-3 text-gray-500">{t('reportes.egresos', { defaultValue: 'Egresos' })}</th>
                <th className="text-right py-2 px-3 text-gray-500">{t('reportes.flujo_neto')}</th>
                <th className="text-right py-2 px-3 text-gray-500">{t('reportes.saldo_acumulado')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-500">{t('reportes.saldo_inicial')}</td>
                <td className="py-2 px-3 text-right"></td><td className="py-2 px-3 text-right"></td><td className="py-2 px-3 text-right"></td>
                <td className="py-2 px-3 text-right font-bold text-[#1e3a5f]">${flujoCaja.saldoInicial.toFixed(2)}</td>
              </tr>
              {flujoCaja.meses.map((mes, i) => {
                const fn = mes.ingresos - mes.egresos
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-[#1e3a5f]">{mes.mes}</td>
                    <td className="py-2 px-3 text-right text-green-600">+${mes.ingresos.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-red-600">-${mes.egresos.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${fn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fn >= 0 ? '+' : ''}${fn.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#1e3a5f]">${mes.saldo.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratios */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">📊 {t('reportes.ratios')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: t('reportes.liquidez'), value: ratios.liquidezCorriente.toFixed(2), desc: 'Activo Corriente / Pasivo Corriente', ok: ratios.liquidezCorriente > 1.5 },
            { label: t('reportes.prueba_acida'), value: ratios.pruebaAcida.toFixed(2), desc: '(Act. Cte. - Inv.) / Pasivo Cte.', ok: ratios.pruebaAcida > 1.0 },
            { label: t('reportes.endeudamiento'), value: ratios.endeudamiento.toFixed(1) + '%', desc: 'Pasivo Total / Activo Total', ok: ratios.endeudamiento < 50 },
            { label: t('reportes.roe'), value: ratios.roe.toFixed(1) + '%', desc: 'Utilidad Neta / Patrimonio', ok: ratios.roe > 20 },
            { label: t('reportes.roa'), value: ratios.roa.toFixed(1) + '%', desc: 'Utilidad Neta / Activo Total', ok: ratios.roa > 15 },
            { label: t('reportes.margen_neto'), value: ratios.margenNeto.toFixed(1) + '%', desc: 'Utilidad Neta / Ingresos', ok: ratios.margenNeto > 20 },
          ].map((r, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">{r.label}</p>
              <p className="text-2xl font-bold text-[#1e3a5f]">{r.value}</p>
              <p className="text-xs text-gray-400 mt-1">{r.desc}</p>
              <div className="mt-2 bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${r.ok ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(parseFloat(r.value) || 0, 100)}%` }}></div>
              </div>
              <p className={`text-xs mt-1 ${r.ok ? 'text-green-600' : 'text-yellow-600'}`}>{r.ok ? '✅ ' + t('reportes.saludable') : '⚠️ Revisar'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}