/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: Dashboard.tsx (Main dashboard page).
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, MessageSquare, Loader2, Sparkles, RefreshCw } from "lucide-react"
import ChatCard from "../components/cards/chat"
import AddChat from "../components/modal/addChat"
import { getChatSessions, deleteChatSession, type ChatSessionItem } from "../services/ai"

export function DashboardPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<ChatSessionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getChatSessions()
      setSessions(data)
    } catch (err: any) {
      console.error("Failed to load sessions:", err)
      setError(err.message || "Gagal memuat sesi chat dari server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleContinueChat = (session: ChatSessionItem) => {
    const docQuery = session.documentId ? `&doc_id=${session.documentId}` : ""
    navigate(`/chat?session_id=${session.id}${docQuery}`)
  }

  const handleDeleteChat = async (sessionId: string) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus sesi obrolan ini?")) {
      return
    }

    setDeletingId(sessionId)
    try {
      await deleteChatSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err: any) {
      alert(`Gagal menghapus sesi: ${err.message || "Terjadi kesalahan"}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="flex flex-row justify-between items-center pb-2 border-b border-border-subtle">
        <div>
          <h1 className="font-bold text-3xl text-text-main">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Kelola materi belajar dan riwayat tanya jawab AI kamu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSessions}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-border-main hover:bg-bg-hover text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-all duration-200 flex flex-row items-center gap-2 font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Chat Baru
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <button
            onClick={fetchSessions}
            className="underline font-medium hover:opacity-80 cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Memuat daftar sesi belajar...</p>
        </div>
      ) : sessions.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-main rounded-2xl bg-bg-card/50 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-semibold text-xl text-text-main">Belum Ada Sesi Chat</h3>
            <p className="text-sm text-text-muted">
              Mulai belajar sekarang dengan mengunggah materi PDF atau langsung bertanya apa pun ke asisten AI.
            </p>
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mulai Chat Baru</span>
          </button>
        </div>
      ) : (
        /* Grid Chat Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((item) => (
            <ChatCard
              key={item.id}
              session={item}
              onContinue={handleContinueChat}
              onDelete={handleDeleteChat}
              isDeleting={deletingId === item.id}
            />
          ))}
        </div>
      )}

      {/* Modal Add Chat */}
      <AddChat
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSuccess={fetchSessions}
      />
    </div>
  )
}

export default DashboardPage
