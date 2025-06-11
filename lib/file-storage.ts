import { put, del, list, head } from "@vercel/blob"

export type FileMetadata = {
  url: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: Date
  filename: string
}

export async function uploadFile(file: File, userId: string): Promise<FileMetadata> {
  try {
    // Create a unique filename with user ID prefix to avoid collisions
    const timestamp = Date.now()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `resumes/${userId}/${timestamp}-${safeFilename}`

    // Upload to Vercel Blob
    const { url } = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })

    return {
      url,
      pathname,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date(),
      filename: file.name,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

export async function deleteFile(pathname: string): Promise<void> {
  try {
    await del(pathname)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

export async function getFileInfo(pathname: string): Promise<FileMetadata | null> {
  try {
    const blob = await head(pathname)
    if (!blob) return null

    // Extract filename from pathname
    const filename = pathname.split("/").pop() || ""
    const cleanFilename = filename.substring(filename.indexOf("-") + 1)

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || "",
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
      filename: cleanFilename,
    }
  } catch (error) {
    console.error("Error getting file info:", error)
    return null
  }
}

export async function listFiles(prefix: string): Promise<FileMetadata[]> {
  try {
    const { blobs } = await list({ prefix })

    return blobs.map((blob) => {
      // Extract filename from pathname
      const filename = blob.pathname.split("/").pop() || ""
      const cleanFilename = filename.substring(filename.indexOf("-") + 1)

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || "",
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt),
        filename: cleanFilename,
      }
    })
  } catch (error) {
    console.error("Error listing files:", error)
    return []
  }
}
