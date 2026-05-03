// src/pages/ChatIA.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { sendMessageToGroq } from '../services/groqService'

export default function ChatIA() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy ContaIA, tu contador virtual ecuatoriano. Pregúntame sobre IVA, facturación, balances o cualquier duda financiera.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input.trim() }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendMessageToGroq([...messages, userMessage])
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error al conectar con la IA.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
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
  )
}