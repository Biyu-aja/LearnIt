import { apiFetch } from "./api"

export interface SourceReference {
  page: number
  text_snippet: string
}

export interface AskAIResponse {
  session_id: string
  question: string
  answer: string
  sources: SourceReference[]
}

export interface DocumentItem {
  id: string
  title: string
  filename: string
  fileSize: number
  pageCount: number
  createdAt: string
}

export interface ChatMessageItem {
  id: string
  sessionId: string
  role: "user" | "assistant"
  content: string
  sources?: any
  createdAt: string
}

export interface ChatSessionItem {
  id: string
  title: string
  documentId?: string | null
  document?: DocumentItem | null
  messages?: ChatMessageItem[]
  createdAt: string
  updatedAt: string
}

export const AskAI = async (
  message: string,
  sessionId?: string,
  documentId?: string
): Promise<AskAIResponse> => {
  const result = await apiFetch<AskAIResponse>("chat", {
    method: "POST",
    body: JSON.stringify({
      question: message,
      session_id: sessionId || undefined,
      document_id: documentId || undefined,
    }),
  })
  return result
}

export const getChatSessions = async (): Promise<ChatSessionItem[]> => {
  return await apiFetch<ChatSessionItem[]>("chat/sessions")
}

export const getSessionDetail = async (sessionId: string): Promise<ChatSessionItem> => {
  return await apiFetch<ChatSessionItem>(`chat/session/${sessionId}`)
}

export const deleteChatSession = async (sessionId: string): Promise<{ message: string }> => {
  return await apiFetch<{ message: string }>(`chat/session/${sessionId}`, {
    method: "DELETE",
  })
}

export const uploadDocument = async (
  file: File
): Promise<{
  message: string
  document: DocumentItem
  total_chunks: number
}> => {
  const formData = new FormData()
  formData.append("file", file)
  return await apiFetch("documents/upload", {
    method: "POST",
    body: formData,
  })
}

export const getDocument = async (documentId: string): Promise<DocumentItem> => {
  return await apiFetch<DocumentItem>(`documents/${documentId}`)
}

export const renameDocument = async (documentId: string, title: string): Promise<DocumentItem> => {
  return await apiFetch<DocumentItem>(`documents/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  })
}

export const getDocumentFileUrl = (documentId: string): string => {
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "")
  return `${baseUrl}/documents/${documentId}/file`
}

export const renameChatSession = async (
  sessionId: string,
  title: string
): Promise<ChatSessionItem> => {
  return await apiFetch<ChatSessionItem>(`chat/session/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  })
}