// src/pages/ChatIA.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { sendMessageToGroq, setContextoFinanciero } from '../services/groqService'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = import.meta.env.DEV

export default function ChatIA() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy ContaIA, tu contador virtual ecuatoriano. Puedes preguntarme sobre IVA, facturación, balances o pedirme que analice tus finanzas. ¿En qué puedo ayudarte?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const chatEndRef = useRef(null)

  // ─────────────────────────────────────
  // 1. Contexto financiero
  // ─────────────────────────────────────
  const loadFinancialContext = async () => {
    if (DEV_MODE) {
      setContextoFinanciero({
        ingresos: '2,800.00', egresos: '460.00', balance: '2,340.00',
        iva: '420.00', clientes: 3, margen: '28.6', utilidadNeta: '800.00',
      })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: transacciones } = await supabase
      .from('transacciones').select('*').eq('empresa_id', user.id)

    const { count: clientesCount } = await supabase
      .from('clientes').select('*', { count: 'exact', head: true }).eq('empresa_id', user.id)

    if (transacciones && transacciones.length > 0) {
      const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
      const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)
      const balance = ingresos - egresos
      const iva = ingresos * 0.15
      const margen = ingresos > 0 ? ((balance / ingresos) * 100).toFixed(1) : '0.0'
      setContextoFinanciero({
        ingresos: ingresos.toFixed(2),
        egresos: egresos.toFixed(2),
        balance: balance.toFixed(2),
        iva: iva.toFixed(2),
        clientes: clientesCount || 0,
        margen: margen,
        utilidadNeta: balance.toFixed(2),
      })
    } else {
      setContextoFinanciero({
        ingresos: '0.00', egresos: '0.00', balance: '0.00',
        iva: '0.00', clientes: 0, margen: '0.0', utilidadNeta: '0.00',
      })
    }
  }

  // ─────────────────────────────────────
  // 2. Gestión de sesiones
  // ─────────────────────────────────────
  const initSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Busca la última sesión del usuario
    const { data: lastSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastSession && lastSession.length > 0) {
      setSessionId(lastSession[0].id)
      loadMessages(lastSession[0].id)
    } else {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          usuario_id: user.id,
          empresa_id: null,
          titulo: 'Nueva conversación'
        })
        .select()
      if (newSession && newSession.length > 0) {
        setSessionId(newSession[0].id)
      }
    }
  }

  const loadMessages = async (sid) => {
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
    if (msgs && msgs.length > 0) {
      setMessages(msgs.map(m => ({ role: m.role, content: m.content })))
    } else {
      setMessages([
        { role: 'assistant', content: '¡Hola! Soy ContaIA, tu contador virtual ecuatoriano. ¿En qué puedo ayudarte?' }
      ])
    }
  }

  const loadUserSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: sess } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
    if (sess) setSessions(sess)
  }

  // Cargar datos financieros y sesión activa al montar el componente
  useEffect(() => {
    loadFinancialContext()
    initSession()
    loadUserSessions()
  }, [])

  // Auto-scroll al último mensaje
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const switchSession = async (sid) => {
    setSessionId(sid)
    loadMessages(sid)
  }

  // ─────────────────────────────────────
  // 3. Envío de mensajes con guardado automático
  // ─────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages([...messages, userMsg])
    setInput('')
    setLoading(true)

    // Guarda el mensaje del usuario en Supabase
    if (sessionId) {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMsg.content,
        tokens_used: 0,
      })
    }

    try {
      const reply = await sendMessageToGroq([...messages, userMsg])
      const assistantMsg = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, assistantMsg])

      // Guarda la respuesta del asistente
      if (sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: reply,
          tokens_used: 0,
        })
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error al conectar con la IA.' }])
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────
  // 4. Interfaz con panel lateral de sesiones
  // ─────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Panel lateral de sesiones */}
      <div className="w-64 bg-white rounded-xl shadow-md p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-[#1e3a5f] mb-3">Historial</h3>
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => switchSession(s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              sessionId === s.id ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {s.titulo || s.id.slice(0,8)}
          </button>
        ))}
        {sessions.length === 0 && (
          <p className="text-xs text-gray-400">No hay sesiones anteriores</p>
        )}
      </div>

      {/* Panel principal del chat */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">🤖 {t('chat.title')}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {t('chat.subtitle')} <span className="text-[#d4af37] font-medium">{t('chat.analiza_hint')}</span>
        </p>
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 mb-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[80%] px-4 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-left mb-3"><div className="inline-block bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-500">{t('chat.pensando')}</div></div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.placeholder')} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm" />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-[#d4af37] text-[#1e3a5f] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50">
            {t('chat.enviar')}
          </button>
        </div>
      </div>
    </div>
  )
}