import React from "react"
import { Calendar, FileText, MessageCircle, Loader2 } from "lucide-react"
import type { ChatSessionItem } from "../../services/ai"

interface ChatCardProps {
  session: ChatSessionItem
  onContinue: (session: ChatSessionItem) => void
  onDelete: (sessionId: string) => void
  isDeleting?: boolean
}

const ChatCard: React.FC<ChatCardProps> = ({
  session,
  onContinue,
  onDelete,
  isDeleting = false,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const fileName = session.document?.title || session.document?.filename || "Obrolan Mandiri"
  const messageCount = session.messages?.length || 0
  const lastMessage =
    session.messages && session.messages.length > 0
      ? session.messages[session.messages.length - 1].content
      : "Belum ada riwayat pesan dalam sesi ini."

  return (
    <div className="flex flex-col border border-border-main rounded-lg overflow-hidden bg-bg-card shadow-xs hover:shadow-md transition-shadow">
      <div className="bg-red-600 text-white w-full h-24 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
        <FileText className="w-6 h-6" />
        <p className="font-medium text-sm truncate max-w-full px-2" title={fileName}>
          {fileName}
        </p>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h2 className="font-semibold text-2xl text-text-main line-clamp-1" title={session.title}>
            {session.title || "Judul Chat"}
          </h2>
          <p className="text-text-muted text-sm text-justify mt-1.5 line-clamp-3">
            {lastMessage}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center text-text-muted text-sm pt-2 border-t border-border-subtle">
          <span className="flex flex-row gap-1.5 items-center">
            <MessageCircle className="w-4 h-4" />
            <p>{messageCount} Chat</p>
          </span>
          <span className="flex flex-row gap-1.5 items-center">
            <Calendar className="w-4 h-4" />
            <p>{formatDate(session.createdAt)}</p>
          </span>
        </div>
      </div>

      <div className="flex flex-row">
        <button
          type="button"
          onClick={() => onContinue(session)}
          className="flex-1 p-2 rounded-bl-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors duration-200 text-center font-medium"
        >
          Lanjutkan Chat
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(session.id)}
          className="flex-1 p-2 rounded-br-lg bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors duration-200 text-center font-medium flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus Chat"}
        </button>
      </div>
    </div>
  )
}

export default ChatCard