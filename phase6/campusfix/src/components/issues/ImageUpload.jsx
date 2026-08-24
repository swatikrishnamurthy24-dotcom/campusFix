import { useRef, useState } from "react"
import { ImagePlus, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE_MB = 5

/**
 * Frontend-only image attachment picker for Report Issue.
 *
 * IMPORTANT: this never uploads anywhere. It creates a local object URL
 * purely so the student can preview what they selected before submitting.
 * That URL is revoked on removal/unmount to avoid leaking memory, and the
 * mock issue service never persists the underlying file — see
 * src/services/issueService.js and Phase 4 §3.
 */
export default function ImageUpload({ value, onChange, disabled }) {
  const inputRef = useRef(null)
  const [error, setError] = useState("")

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file later
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.")
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setError("")
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl)
    const previewUrl = URL.createObjectURL(file)
    onChange({ file, previewUrl, name: file.name, sizeKB: Math.round(file.size / 1024) })
  }

  function handleRemove() {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl)
    onChange(null)
    setError("")
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
        <img
          src={value.previewUrl}
          alt="Selected attachment preview"
          className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
          <p className="text-xs text-muted-foreground">{value.sizeKB} KB</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove attached image"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface px-4 py-6 text-center transition-colors",
          "hover:border-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <ImagePlus className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Click to attach an image</span>
        <span className="text-xs text-muted-foreground">JPG, PNG, or WEBP — up to {MAX_FILE_SIZE_MB}MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileSelect}
        disabled={disabled}
        className="sr-only"
        aria-label="Attach an image of the issue"
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
