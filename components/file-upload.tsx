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

    // Check file type
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
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
              <p className="font-medium text-sm">{filename || "Resume"}</p>
              <p className="text-xs text-muted-foreground">{value.split(".").pop()?.toUpperCase()} file</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, "_blank")}>
              <DownloadIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If file is uploading
  if (isUploading) {
    return (
      <div className="border rounded-md p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-md">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Uploading resume...</p>
            <Progress value={uploadProgress} className="h-2 mt-2" />
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
          error && "border-red-500",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <UploadIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drag & drop your resume here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOC, DOCX up to {maxSize}MB</p>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      </div>
    </div>
  )
}
