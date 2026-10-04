import { useState, useRef, useEffect } from 'react'
import Groq from 'groq-sdk'
import './AIAssistant.css'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are MedConnect, a helpful medical information assistant.
You provide general health information and guidance, but you are NOT a doctor.
Rules:
- Be concise and friendly.
- For emergencies, always tell the user to call their local emergency number.
- Never diagnose or prescribe. Always recommend consulting a real doctor.
- If the user says hi or hello, greet them warmly and ask how you can help.
- Keep answers short (2-4 sentences max).`

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: "Hi! I'm your MedConnect assistant. Ask me a basic health question and I'll do my best to help. Remember, I'm not a doctor.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { from: 'user', text }
    const newMessages = [...messages, userMsg]

    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...newMessages.map((m) => ({
            role: m.from === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        ],
        temperature: 0.7,
        max_tokens: 300,
      })

      const reply = response.choices[0]?.message?.content?.trim()
      setMessages((prev) => [
        ...prev,
        { from: 'ai', text: reply || "Sorry, I couldn't generate a response." },
      ])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          from: 'ai',
          text: "⚠️ I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="assistant-page">
      <div className="assistant-header">
        <div className="assistant-avatar">✚</div>
        <div>
          <h1>AI Medical Assistant</h1>
          <p>General health guidance — not a substitute for a doctor.</p>
        </div>
      </div>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble ai typing">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>

      <p className="assistant-disclaimer">
        ⚠️ This assistant does not provide medical diagnosis. In an emergency, call your local emergency number.
      </p>
    </main>
  )
}

export default AIAssistant