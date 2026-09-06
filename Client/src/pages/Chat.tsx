import { Book, Send, Loader2, Bot, Edit2, Check, X } from "lucide-react"

import { BackButton } from "../components/ui/back"
import Bubble from "../components/chat/bubble"
import ShowDocumentModal from "../components/modal/showDocument"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import type { Message } from "../types"
import {
  AskAI,
  getSessionDetail,
  renameChatSession,
  renameDocument,
} from "../services/ai"

const ChatPage = () => {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [userMessage, setUserMessage] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(searchParams.get("session_id") || null)
  const [currentDocId, setCurrentDocId] = useState<string | null>(searchParams.get("doc_id") || null)
  const [showDocModal, setShowDocModal] = useState(false)
  const [chatTitle, setChatTitle] = useState<string>("Chat Belajar AI")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [isRenamingTitle, setIsRenamingTitle] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Muat riwayat pesan jika session_id ada di URL
  useEffect(() => {
    const sid = searchParams.get("session_id")
    if (sid) {
      setSessionId(sid)
      setIsLoading(true)
      getSessionDetail(sid)
        .then((detail) => {
          if (detail.title) setChatTitle(detail.title)
          if (detail.documentId) setCurrentDocId(detail.documentId)
          if (detail.document?.title) setChatTitle(detail.document.title)
          if (detail.messages && detail.messages.length > 0) {
            setMessages(
              detail.messages.map((m) => ({
                id: m.id,
                sender: m.role as "user" | "assistant",
                message: m.content,
              }))
            )
          }
        })
        .catch((err) => {
          console.error("Gagal memuat riwayat obrolan:", err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [searchParams])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const addMessage = (sender: "user" | "assistant", text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: Date.now().toString(),
        sender: sender,
        message: text.trim(),
      },
    ])
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = userMessage.trim()
    if (!text || isLoading) return

    addMessage("user", text)
    setUserMessage("")
    setIsLoading(true)

    try {
      const response = await AskAI(text, sessionId || undefined, currentDocId || undefined)
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id)
      }
      addMessage("assistant", response.answer)
    } catch (err: any) {
      addMessage(
        "assistant",
        `Maaf, terjadi kesalahan: ${err.message || "Gagal mendapatkan respon dari AI"}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEditTitle = () => {
    setTempTitle(chatTitle)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = async () => {
    const clean = tempTitle.trim()
    if (!clean || isRenamingTitle) return
    if (clean === chatTitle) {
      setIsEditingTitle(false)
      return
    }

    setIsRenamingTitle(true)
    try {
      if (sessionId) {
        await renameChatSession(sessionId, clean)
      }
      if (currentDocId) {
        await renameDocument(currentDocId, clean)
      }
      setChatTitle(clean)
      setIsEditingTitle(false)
    } catch (err: any) {
      alert(`Gagal mengubah judul: ${err.message || "Terjadi kesalahan"}`)
    } finally {
      setIsRenamingTitle(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-6rem)] -mt-8">
      <header className="p-4 border-b border-gray-200">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-row items-center gap-2 max-w-xl">
            <BackButton navigateTo="/dashboard" />
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  disabled={isRenamingTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle()
                    if (e.key === "Escape") setIsEditingTitle(false)
                  }}
                  autoFocus
                  className="px-2.5 py-1 text-base font-semibold border border-border-main bg-bg-card text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[240px]"
                />
                <button
                  type="button"
                  disabled={isRenamingTitle || !tempTitle.trim()}
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                  title="Simpan"
                >
                  {isRenamingTitle ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={isRenamingTitle}
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-hover rounded-md transition-colors cursor-pointer"
                  title="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <p
                  onClick={handleStartEditTitle}
                  className="text-xl font-semibold text-left truncate max-w-md cursor-pointer hover:text-primary transition-colors"
                  title="Klik untuk ubah judul"
                >
                  {chatTitle}
                </p>
                <button
                  type="button"
                  onClick={handleStartEditTitle}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-primary transition-all cursor-pointer rounded"
                  title="Ubah judul obrolan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocModal(true)}
              className="flex flex-row gap-2 items-center p-2 bg-primary text-white rounded-lg hover:scale-102 transition-all cursor-pointer shadow-xs"
            >
              <Book className="w-5 h-5" />
              <p>Show Documents</p>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 min-h-0 p-4 gap-2">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
                <Bot className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg text-text-main">Mulai Belajar dengan AI</p>
              <p className="text-sm">Tanyakan materi, konsep rumus, atau rangkuman apa pun!</p>
            </div>
          )}

          {messages.map((item) => (
            <Bubble key={item.id} message={item.message} sender={item.sender} />
          ))}

          {isLoading && (
            <div className="flex flex-row gap-2 items-center px-6 py-2">
              <div className="p-2 rounded-full bg-gray-500 text-white">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-lg bg-gray-500 text-white text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI sedang berpikir...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-2 flex flex-row gap-2 items-center border border-border-main rounded-lg bg-bg-card"
        >
          <input
            type="text"
            value={userMessage}
            disabled={isLoading}
            onChange={(e) => setUserMessage(e.target.value)}
            className="w-full p-2 rounded-lg focus:outline-0 bg-transparent text-text-main disabled:opacity-50"
            placeholder={isLoading ? "Menunggu respon AI..." : "Tanyakan apa saja ke AI..."}
          />
          <button
            type="submit"
            disabled={isLoading || !userMessage.trim()}
            className="flex flex-row gap-2 items-center p-2 bg-primary text-white rounded-lg hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </main>

      <ShowDocumentModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        documentId={currentDocId}
        onDocumentUpdated={(updatedDoc) => {
          setChatTitle(updatedDoc.title)
        }}
      />
    </div>
  )
}

export default ChatPage