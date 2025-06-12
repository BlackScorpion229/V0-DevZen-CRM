"use client"

import { useState, useEffect } from "react"
import { useDatabase, type FileItem } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileUpload } from "./file-upload"
import { formatFileSize } from "@/lib/file-storage"
import { useAuth } from "@/lib/auth"
import { uploadFile, deleteFile } from "@/lib/file-storage"
import { FileIcon, FileTextIcon, FileImageIcon, DownloadIcon, TrashIcon, PlusIcon, PaperclipIcon } from "lucide-react"

interface FileAttachmentsProps {
  entityType: "vendor" | "resource" | "job" | "process" | "other"
  entityId: string
  title?: string
  maxDisplay?: number
}

export function FileAttachments({ entityType, entityId, title = "Attachments", maxDisplay = 3 }: FileAttachmentsProps) {
  const { user } = useAuth()
  const { files, addFile, deleteFile: removeFile, getFilesByEntity } = useDatabase()

  const [attachments, setAttachments] = useState<FileItem[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const entityFiles = getFilesByEntity(entityType, entityId)
    setAttachments(entityFiles)
  }, [entityType, entityId, files, getFilesByEntity])

  const handleFileChange = (file: File | null) => {
    setFileToUpload(file)
  }

  const handleFileUpload = async () => {
    if (!fileToUpload || !user) return

    try {
      setIsUploading(true)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Upload file to storage
      const folder = `${entityType}s`
      const metadata = await uploadFile(fileToUpload, user.id, folder)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add file to database
      addFile({
        name: fileToUpload.name.split(".")[0].replace(/_/g, " "),
        originalFilename: fileToUpload.name,
        size: metadata.size,
        contentType: metadata.contentType,
        pathname: metadata.pathname,
        url: metadata.url,
        entityType,
        entityId,
        uploadedBy: user.id,
        uploadedAt: new Date(),
      })

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setIsUploadDialogOpen(false)
        setFileToUpload(null)
      }, 500)
    } catch (error) {
      console.error("Error uploading file:", error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId)
    if (!fileToDelete) return

    try {
      // Delete from storage
      await deleteFile(fileToDelete.pathname)

      // Delete from database
      removeFile(fileId)
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return <FileIcon className="h-4 w-4 text-red-500" />
    if (contentType.includes("image")) return <FileImageIcon className="h-4 w-4 text-blue-500" />
    if (contentType.includes("word") || contentType.includes("document"))
      return <FileTextIcon className="h-4 w-4 text-blue-700" />
    return <FileIcon className="h-4 w-4 text-gray-500" />
  }

  const displayedAttachments = showAll ? attachments : attachments.slice(0, maxDisplay)
  const hasMoreAttachments = attachments.length > maxDisplay

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
          <PlusIcon className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {attachments.length === 0 ? (
        <div className="flex items-center justify-center border border-dashed rounded-md p-4">
          <div className="text-center">
            <PaperclipIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No attachments yet</p>
            <Button variant="link" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
              Add attachment
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedAttachments.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-muted p-1.5 rounded-md">{getFileIcon(file.contentType)}</div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={file.url} download={file.originalFilename} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMoreAttachments && (
            <Button variant="link" size="sm" onClick={() => setShowAll(!showAll)} className="mt-1">
              {showAll ? "Show less" : `Show ${attachments.length - maxDisplay} more`}
            </Button>
          )}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FileUpload
              accept="*/*"
              maxSize={50}
              onFileChange={handleFileChange}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={!fileToUpload || isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
