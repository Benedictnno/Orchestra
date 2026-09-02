'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Trash2, Sparkles } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingHistory, setFetchingHistory] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function fetchHistory() {
    try {
      const res = await fetchWithAuth('/api/chat')
      if (res.ok) {
        const data = await res.json()
        setMessages(Array.isArray(data.history) ? data.history : [])
      }
    } catch {
      // toast.error('Failed to load chat history')
    } finally {
      setFetchingHistory(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetchWithAuth('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      if (res.ok) {
        // Handle various response formats (data.response, data.data.response, data.message)
        const aiResponse = data.response || data.data?.response || data.message || data.text
        
        if (aiResponse) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          }])
        } else {
          // If no response field, try to fetch history to sync
          await fetchHistory()
        }
      } else {
        toast.error(data.message || 'Failed to get response')
      }
    } catch (err) {
      console.error('Chat error:', err)
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function clearChat() {
    if (!confirm('Clear all chat history?')) return
    try {
      const res = await fetchWithAuth('/api/chat', { method: 'DELETE' })
      if (res.ok) {
        setMessages([])
        toast.success('Chat cleared')
      }
    } catch {
      toast.error('Failed to clear chat')
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col bg-white rounded-3xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-[#4A90e2] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E94560] flex items-center justify-center shadow-lg shadow-[#E94560]/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold">Ask Orchestra</h1>
            <p className="text-white/50 text-xs font-medium">Groq-powered AI Financial Advisor</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/50">
        {fetchingHistory ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-4 border-[#E94560] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Loading history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border">
              <Bot size={32} className="text-gray-300" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">No messages yet</p>
              <p className="text-gray-500 text-sm mt-1">Ask me about your spending, how to save more, or to analyze your transactions.</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border
                ${m.role === 'user' ? 'bg-white text-gray-600' : 'bg-[#4A90e2] text-white'}`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                ${m.role === 'user' 
                  ? 'bg-[#E94560] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#4A90e2] text-white flex items-center justify-center shrink-0 shadow-sm border">
              <Bot size={18} />
            </div>
            <div className="bg-white border rounded-2xl rounded-tl-none p-4 flex gap-1 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 border-t bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Analyze my spending this month..."
            className="w-full border-2 border-gray-100 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-[#E94560]/30 focus:ring-4 focus:ring-[#E94560]/5 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#E94560] text-white rounded-xl flex items-center justify-center hover:bg-[#d63850] transition-all disabled:opacity-50 shadow-lg shadow-[#E94560]/20"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
          Orchestra AI uses your recent transaction history to provide tailored advice.
        </p>
      </form>
    </div>
  )
}
