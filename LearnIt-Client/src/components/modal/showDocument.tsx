import React, { useState, useEffect } from "react"
import Modal from "./modal"
import {
  FileText,
  ExternalLink,
  Edit2,
  Check,
  X,
  Loader2,
  FileQuestion,
  Calendar,
  Layers,
  HardDrive,
} from "lucide-react"
import {
  getDocument,
  renameDocument,
  getDocumentFileUrl,
  type DocumentItem,
} from "../../services/ai"

interface Props {
  isOpen: boolean
  onClose: () => void
  documentId?: string | null
  onDocumentUpdated?: (updatedDoc: DocumentItem) => void
}

const ShowDocumentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentId,
  onDocumentUpdated,
}) => {
  const [doc, setDoc] = useState<DocumentItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
      setError(null)
      return
    }

    if (documentId) {
      setIsLoading(true)
      setError(null)
      getDocument(documentId)
        .then((data) => {
          setDoc(data)
          setNewTitle(data.title)
        })
        .catch((err: any) => {
          console.error("Gagal mengambil detail dokumen:", err)
          setError(err.message || "Gagal memuat detail dokumen.")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setDoc(null)
    }
  }, [isOpen, documentId])

  const handleSaveRename = async () => {
    if (!doc || !newTitle.trim() || isRenaming) return

    setIsRenaming(true)
    setError(null)
    try {
      const updated = await renameDocument(doc.id, newTitle.trim())
      setDoc(updated)
      setIsEditing(false)
      onDocumentUpdated?.(updated)
    } catch (err: any) {
      setError(err.message || "Gagal mengubah nama dokumen.")
    } finally {
      setIsRenaming(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B"
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informasi Dokumen"
      description="Materi PDF yang digunakan AI sebagai basis tanya jawab."
      size="md"
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Memuat detail dokumen...</p>
          </div>
        ) : !documentId || !doc ? (
          /* State jika tidak ada dokumen di sesi ini */
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-bg-hover text-text-muted flex items-center justify-center">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-text-main text-base">
                Tidak Ada Dokumen Terlampir
              </h4>
              <p className="text-sm text-text-muted max-w-xs">
                Sesi obrolan ini berjalan dalam mode tanya jawab umum (AI Tutor) tanpa referensi file PDF.
              </p>
            </div>
          </div>
        ) : (
          /* State Dokumen Ditemukan */
          <div className="space-y-4">
            {/* Header Dokumen dengan Rename */}
            <div className="p-4 bg-bg-hover/50 rounded-xl border border-border-main space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 shrink-0 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newTitle}
                        disabled={isRenaming}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-2.5 py-1 text-sm rounded border border-border-main bg-bg-card text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={isRenaming || !newTitle.trim()}
                        onClick={handleSaveRename}
                        className="p-1.5 bg-primary text-white rounded hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                        title="Simpan nama"
                      >
                        {isRenaming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={isRenaming}
                        onClick={() => {
                          setIsEditing(false)
                          setNewTitle(doc.title)
                        }}
                        className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-hover rounded transition-colors cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className="font-semibold text-text-main text-base truncate"
                        title={doc.title}
                      >
                        {doc.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer"
                        title="Ubah nama dokumen"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-text-muted truncate mt-0.5" title={doc.filename}>
                    File: {doc.filename}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border-main bg-bg-card/60 flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Halaman</p>
                  <p className="text-sm font-semibold text-text-main">
                    {doc.pageCount} Halaman
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border-main bg-bg-card/60 flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Ukuran Berkas</p>
                  <p className="text-sm font-semibold text-text-main">
                    {formatFileSize(doc.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tanggal Upload */}
            <div className="flex items-center gap-2 text-xs text-text-muted px-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Diunggah pada: {formatDate(doc.createdAt)}</span>
            </div>

            {/* Tombol Aksi Buka PDF */}
            <div className="pt-2">
              <a
                href={getDocumentFileUrl(doc.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border-main bg-bg-hover hover:bg-bg-hover/80 text-text-main font-medium text-sm transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Berkas PDF</span>
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border-main">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ShowDocumentModal
