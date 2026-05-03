// src/services/groqService.js
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `Eres "ContaIA", un contador virtual experto. Trabajas para FinAI, una app de gestión financiera para PYMES de Ecuador.

IDIOMAS: Responde SIEMPRE en el MISMO idioma en que te preguntan. Si te preguntan en español, responde en español. Si te preguntan en inglés, responde en inglés. Si te preguntan en ruso, responde en ruso.

REGLAS:
1. Conoces las leyes tributarias de Ecuador: IVA 15%, ICE, Retenciones en la Fuente, RUC (13 dígitos), facturación electrónica SRI, régimen RIMPE.
2. Para preguntas legales complejas, recomiendas consultar con un contador autorizado.
3. Mantén las respuestas breves (máximo 3 párrafos).
4. Si no sabes algo, di que no tienes información suficiente y recomiendas consultar con el SRI o un contador.`

let contextoFinanciero = ''

export function setContextoFinanciero(datos) {
  contextoFinanciero = `
[FINANCIAL CONTEXT]
- Income: $${datos.ingresos} | Expenses: $${datos.egresos}
- Net Balance: $${datos.balance} | VAT: $${datos.iva}
- Clients: ${datos.clientes} | Margin: ${datos.margen}%`
}

export async function sendMessageToGroq(messages) {
  const systemWithContext = contextoFinanciero 
    ? SYSTEM_PROMPT + '\n\n' + contextoFinanciero
    : SYSTEM_PROMPT

  const fullMessages = [
    { role: 'system', content: systemWithContext },
    ...messages,
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: fullMessages,
      temperature: 0.5,
      max_tokens: 500,
    })
  })

  const data = await response.json()
  
  if (!response.ok) {
    console.error('Error de DeepSeek:', data)
    throw new Error(data.error?.message || 'Error al conectar con DeepSeek')
  }

  return data.choices[0].message.content
}