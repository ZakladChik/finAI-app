// src/services/notificationService.js
import { supabase } from '../lib/supabaseClient'

export async function generateNotifications(userId, empresaId) {
  // Obtener todas las transacciones de la empresa
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('empresa_id', userId)  // empresa_id es el id del usuario autenticado

  if (!transacciones || transacciones.length === 0) return

  const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)
  const balance = ingresos - egresos

  const now = new Date()
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1)
  const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Ingresos del mes actual
  const ingresosMes = transacciones
    .filter(t => t.tipo === 'ingreso' && new Date(t.fecha) >= primerDiaMes && new Date(t.fecha) <= ultimoDiaMes)
    .reduce((s, t) => s + t.monto, 0)

  // Egresos del mes actual
  const egresosMes = transacciones
    .filter(t => t.tipo === 'egreso' && new Date(t.fecha) >= primerDiaMes && new Date(t.fecha) <= ultimoDiaMes)
    .reduce((s, t) => s + t.monto, 0)

  const balanceMes = ingresosMes - egresosMes
  const margen = ingresosMes > 0 ? (balanceMes / ingresosMes) * 100 : 0
  const ratioLiquidez = egresosMes > 0 ? ingresosMes / egresosMes : (ingresosMes > 0 ? 999 : 0)

  const notificaciones = []

  // 1. Balance general negativo
  if (balance < 0) {
    notificaciones.push({
      tipo: 'alerta',
      mensaje: `⚠️ Tu balance general es negativo (-$${Math.abs(balance).toFixed(2)}). Revisa tus gastos y considera reducir costos.`
    })
  }

  // 2. Egresos superan el 80% de los ingresos del mes
  if (ingresosMes > 0 && (egresosMes / ingresosMes) > 0.8) {
    notificaciones.push({
      tipo: 'alerta',
      mensaje: `⚠️ Tus egresos de este mes representan el ${(egresosMes/ingresosMes*100).toFixed(0)}% de tus ingresos. Estás gastando casi todo lo que ganas.`
    })
  }

  // 3. Ratio de liquidez bajo
  if (ratioLiquidez < 1.5 && ingresosMes > 0) {
    notificaciones.push({
      tipo: 'alerta',
      mensaje: `📉 Tu ratio de liquidez es bajo (${ratioLiquidez.toFixed(1)}). Te recomendamos mantener un colchón de efectivo para imprevistos.`
    })
  }

  // 4. Margen neto bajo pero positivo
  if (margen > 0 && margen < 10 && ingresosMes > 0) {
    notificaciones.push({
      tipo: 'consejo',
      mensaje: `💡 Tu margen neto es de solo el ${margen.toFixed(1)}%. Busca formas de aumentar tus ingresos o reducir costos.`
    })
  }

  // 5. Sin transacciones en los últimos 7 días
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  const recientes = transacciones.filter(t => new Date(t.fecha) >= hace7Dias)
  if (recientes.length === 0) {
    notificaciones.push({
      tipo: 'info',
      mensaje: `📋 No has registrado transacciones en los últimos 7 días. Recuerda mantener tu contabilidad al día.`
    })
  }

  // 6. Balance del mes positivo y buen margen
  if (balanceMes > 0 && margen > 20) {
    notificaciones.push({
      tipo: 'info',
      mensaje: `👍 Tu negocio está saludable este mes: ingresos de $${ingresosMes.toFixed(2)}, egresos de $${egresosMes.toFixed(2)} y margen del ${margen.toFixed(1)}%.`
    })
  }

  // Insertar notificaciones que no existan ya hoy
  for (const notif of notificaciones) {
    // Verificar si ya existe una notificación similar hoy
    const { data: existentes } = await supabase
      .from('notificaciones')
      .select('id')
      .eq('usuario_id', userId)
      .eq('mensaje', notif.mensaje)
      .gte('created_at', new Date().toISOString().split('T')[0])

    if (!existentes || existentes.length === 0) {
      await supabase.from('notificaciones').insert({
        usuario_id: userId,
        empresa_id: empresaId,
        tipo: notif.tipo,
        mensaje: notif.mensaje,
      })
    }
  }
}