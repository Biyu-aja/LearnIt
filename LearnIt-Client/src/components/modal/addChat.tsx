import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Modal from "./modal"
import { FileText, UploadCloud, X, Sparkles, CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react"
import { uploadDocument } from "../../services/ai"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AddChat: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate()
  const [pdf, setPdf] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdf(file)
      setErrorMessage(null)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPdf(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleSubmit = async () => {
    if (!pdf || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await uploadDocument(pdf)
      onSuccess?.()
      onClose()
      setPdf(null)
      setTitle("")
      navigate(`/chat?doc_id=${res.document.id}`)
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah dokumen. Pastikan server aktif.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartWithoutPdf = () => {
    onClose()
    navigate("/chat")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mulai Sesi Belajar Baru"
      description="Unggah materi PDF kamu untuk dianalisis dan ditanyakan ke AI."
      size="md"
    >
      <div className="space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Input Judul Chat */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Judul Sesi (Opsional)
          </label>
          <input
            type="text"
            value={title}
            disabled={isSubmitting}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Rangkuman Bab 3 Sistem Operasi..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-bg-hover/50 text-text-main placeholder:text-text-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
          />
        </div>

        {/* Dropzone PDF */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            File Dokumen
          </label>

          <div
            className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden ${
              pdf
                ? "border-primary/50 bg-primary/5"
                : "border-border-main hover:border-primary/60 bg-bg-hover/30 hover:bg-bg-hover/60"
            }`}
          >
            {pdf ? (
              <div className="w-full flex items-center justify-between gap-3 p-3 bg-bg-card rounded-lg border border-border-main shadow-xs">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-text-main truncate" title={pdf.name}>
                      {pdf.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted">{formatFileSize(pdf.size)}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Siap
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRemoveFile}
                  className="z-10 p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Hapus file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-2 space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-main">
                    Klik untuk pilih atau seret PDF ke sini
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Mendukung file dokumen PDF hingga 25MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              disabled={isSubmitting}
              accept="application/pdf, .pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="flex items-center justify-between pt-3 border-t border-border-main">
          <button
            type="button"
            onClick={handleStartWithoutPdf}
            className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Chat Langsung Tanpa PDF</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main rounded-lg hover:bg-bg-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!pdf || isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Belajar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddChat