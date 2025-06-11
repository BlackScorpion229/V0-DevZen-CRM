import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and Word documents are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Create a unique filename
    const timestamp = Date.now()
    const userId = session.user.id
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `resumes/${userId}/${timestamp}-${safeFilename}`

    // Upload to Vercel Blob
    const { url, pathname: storedPathname } = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url,
      pathname: storedPathname,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date(),
      filename: file.name,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
