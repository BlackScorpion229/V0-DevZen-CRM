import { put, del } from '@vercel/blob'

export interface FileMetadata {
  url: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: Date
  filename: string
}

export async function uploadFile(
  file: File,
  userId: string,
  folder?: string,
  entityType?: string,
  entityId?: string,
  categoryId?: string,
  description?: string,
  tags?: string[]
): Promise<FileMetadata> {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    
    // Determine the folder path
    const folderPath = folder || 'general'
    const pathname = `${folderPath}/${filename}`

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date(),
      filename: file.name,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

export async function deleteFile(pathname: string, fileId?: string): Promise<void> {
  try {
    await del(pathname)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFolderByEntityType(entityType?: string): string {
  switch (entityType) {
    case 'vendor':
      return 'vendors'
    case 'resource':
      return 'resources'
    case 'job':
      return 'jobs'
    case 'process':
      return 'processes'
    default:
      return 'general'
  }
}
