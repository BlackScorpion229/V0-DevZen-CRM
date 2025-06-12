"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UploadIcon, XIcon, FileTextIcon, DownloadIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  onFileChange: (file: File | null) => void
  value?: string
  filename?: string
  fileUrl?: string
  isUploading?: boolean
  uploadProgress?: number
  onRemove?: () => void
  multiple?: boolean
}

export function FileUpload({
  accept = ".pdf,.doc,.docx",
  maxSize = 5, // 5MB default
  onFileChange,
  value,
  filename,
  fileUrl,
  isUploading = false,
  uploadProgress = 0,
  onRemove,
  multiple = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    // Check file type if accept is specified
    if (accept !== "*/*") {
      const fileType = file.type
      const validTypes = accept.split(",").map((type) => {
        if (type.startsWith(".")) {
          // Convert extension to MIME type if possible
          if (type === ".pdf") return "application/pdf"
          if (type === ".doc") return "application/msword"
          if (type === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          return type
        }
        return type
      })

      if (!validTypes.includes(fileType) && !validTypes.some((type) => file.name.endsWith(type))) {
        setError(`Invalid file type. Accepted types: ${accept}`)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileChange(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileChange(file)
      }
    }
  }

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    onFileChange(null)
    onRemove?.()
  }

  // If we have a file already
  if (value && fileUrl) {
    return (
      <div className="border rounded-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-md">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{filename || "File"}</p>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href={fileUrl} download={filename} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive bg-destructive/5",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          multiple={multiple}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2 py-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium">Uploading file...</p>
            <Progress value={uploadProgress} className="w-48 h-2" />
            <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-4">
            <UploadIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground">
              or <span className="text-primary font-medium">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: {maxSize}MB {accept !== "*/*" && `(${accept})`}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
