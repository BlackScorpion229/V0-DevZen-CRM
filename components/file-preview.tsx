"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileIcon, FileTextIcon, FileIcon as FilePdfIcon, FileImageIcon, DownloadIcon } from "lucide-react"
import { formatFileSize } from "@/lib/file-storage"

interface FilePreviewProps {
  url: string
  filename: string
  contentType: string
  size?: number
  onDownload?: () => void
}

export function FilePreview({ url, filename, contentType, size, onDownload }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isPdf = contentType === "application/pdf"
  const isImage = contentType.startsWith("image/")
  const isDoc =
    contentType === "application/msword" ||
    contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  const getFileIcon = () => {
    if (isPdf) return <FilePdfIcon className="h-16 w-16 text-red-500 mb-4" />
    if (isImage) return <FileImageIcon className="h-16 w-16 text-blue-500 mb-4" />
    if (isDoc) return <FileTextIcon className="h-16 w-16 text-blue-500 mb-4" />
    return <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <FileTextIcon className="h-4 w-4 mr-2" />
        Preview
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{filename}</span>
              <Button variant="outline" size="sm" asChild onClick={onDownload}>
                <a href={url} download={filename} target="_blank" rel="noopener noreferrer">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </DialogTitle>
            {size && <p className="text-sm text-muted-foreground">{formatFileSize(size)}</p>}
          </DialogHeader>

          <div className="mt-4 h-[70vh] overflow-hidden rounded border">
            {isImage ? (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <img src={url || "/placeholder.svg"} alt={filename} className="max-h-full max-w-full object-contain" />
              </div>
            ) : isPdf ? (
              <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-full" title={filename} />
            ) : isDoc ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                <FileTextIcon className="h-16 w-16 text-blue-500 mb-4" />
                <p className="text-lg font-medium">Word Document Preview Not Available</p>
                <p className="text-sm text-muted-foreground mb-4">Please download the file to view its contents</p>
                <Button asChild>
                  <a href={url} download={filename} target="_blank" rel="noopener noreferrer">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Document
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                {getFileIcon()}
                <p className="text-lg font-medium">Preview Not Available</p>
                <p className="text-sm text-muted-foreground">This file type cannot be previewed</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
