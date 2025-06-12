"use client"

import React from "react"
import { useState, useCallback } from "react"
import { useDatabase } from "@/lib/database"
import { useAuth } from "@/lib/auth"
import { uploadFile, deleteFile, formatFileSize, getFolderByEntityType } from "@/lib/file-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "./file-upload"
import { Search, Trash2, Edit, Download, Eye, FolderPlus, File, FilePlus, FileText, FileImage, FileIcon as FilePdf, FileArchive, FileSpreadsheet, X, Tag, Folder, MoreHorizontal, ArrowUpDown, Grid, List } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function FileManagement() {
  const { user } = useAuth()
  const {
    files,
    fileCategories,
    vendors,
    resources,
    jobRequirements,
    addFile,
    updateFile,
    deleteFile: removeFile,
    addFileCategory,
    updateFileCategory,
    deleteFileCategory,
    getFilesByCategory,
  } = useDatabase()

  // State for file management
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [sortField, setSortField] = useState<"name" | "uploadedAt" | "size">("uploadedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // State for dialogs
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // State for file upload
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    entityType: "" as any,
    entityId: "",
    tags: [] as string[],
  })

  // State for category management
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  })
  const [tagInput, setTagInput] = useState("")

  // Filter and sort files
  const filteredFiles = files.filter((file) => {
    // Filter by category
    const categoryMatch = selectedCategory === "all" || file.categoryId === selectedCategory

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.tags && file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    return categoryMatch && searchMatch
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any, bValue: any

    if (sortField === "name") {
      aValue = a.name
      bValue = b.name
    } else if (sortField === "uploadedAt") {
      aValue = a.uploadedAt.getTime()
      bValue = b.uploadedAt.getTime()
    } else {
      aValue = a.size
      bValue = b.size
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  const handleSort = (field: "name" | "uploadedAt" | "size") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleFileChange = useCallback((file: File | null) => {
    setFileToUpload(file)
    if (file) {
      setUploadFormData((prev) => ({
        ...prev,
        name: file.name.split(".")[0].replace(/_/g, " "),
      }))
    }
  }, [])

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

      // Determine folder based on entity type
      const folder = getFolderByEntityType(uploadFormData.entityType)

      // Upload file to storage
      const metadata = await uploadFile(
        fileToUpload,
        user.id,
        folder,
        uploadFormData.entityType || undefined,
        uploadFormData.entityId || undefined,
        uploadFormData.categoryId || undefined,
        uploadFormData.description || undefined,
        uploadFormData.tags.length > 0 ? uploadFormData.tags : undefined,
      )

      // Add file to database
      addFile({
        name: uploadFormData.name || fileToUpload.name,
        originalFilename: fileToUpload.name,
        description: uploadFormData.description,
        categoryId: uploadFormData.categoryId,
        size: fileToUpload.size,
        contentType: fileToUpload.type,
        pathname: metadata.pathname,
        url: metadata.url,
        entityType: uploadFormData.entityType || undefined,
        entityId: uploadFormData.entityId || undefined,
        tags: uploadFormData.tags.length > 0 ? uploadFormData.tags : undefined,
        uploadedBy: user.id,
        uploadedAt: new Date(),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setIsUploadDialogOpen(false)
        resetUploadForm()
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
      await deleteFile(fileToDelete.pathname, fileId)

      // Remove from database
      removeFile(fileId)

      // Remove from selected files if it was selected
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId))
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleDeleteSelected = async () => {
    for (const fileId of selectedFiles) {
      await handleDeleteFile(fileId)
    }
    setSelectedFiles([])
  }

  const handlePreviewFile = (file: any) => {
    setSelectedFile(file)
    setIsPreviewDialogOpen(true)
  }

  const handleSelectFile = (fileId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles((prev) => [...prev, fileId])
    } else {
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(sortedFiles.map((file) => file.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleAddTag = () => {
    if (tagInput && !uploadFormData.tags.includes(tagInput)) {
      setUploadFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setUploadFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleAddCategory = async () => {
    if (editingCategory) {
      updateFileCategory(editingCategory.id, {
        name: categoryFormData.name,
        description: categoryFormData.description,
        parentId: categoryFormData.parentId || undefined,
      })
    } else {
      addFileCategory({
        name: categoryFormData.name,
        description: categoryFormData.description,
        parentId: categoryFormData.parentId || undefined,
      })
    }
    setIsCategoryDialogOpen(false)
    resetCategoryForm()
  }

  const handleEditCategory = (category: any) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
    })
    setEditingCategory(category)
    setIsCategoryDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category has files
    const categoryFiles = getFilesByCategory(categoryId)
    if (categoryFiles.length > 0) {
      alert("Cannot delete category with files. Please move or delete the files first.")
      return
    }

    deleteFileCategory(categoryId)
  }

  const resetUploadForm = () => {
    setFileToUpload(null)
    setUploadFormData({
      name: "",
      description: "",
      categoryId: "",
      entityType: "" as any,
      entityId: "",
      tags: [],
    })
    setTagInput("")
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      parentId: "",
    })
    setEditingCategory(null)
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return <FilePdf className="h-10 w-10 text-red-500" />
    if (contentType.includes("image")) return <FileImage className="h-10 w-10 text-blue-500" />
    if (contentType.includes("word") || contentType.includes("document"))
      return <FileText className="h-10 w-10 text-blue-700" />
    if (contentType.includes("excel") || contentType.includes("spreadsheet"))
      return <FileSpreadsheet className="h-10 w-10 text-green-600" />
    if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("tar"))
      return <FileArchive className="h-10 w-10 text-yellow-600" />
    return <File className="h-10 w-10 text-gray-500" />
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized"
    const category = fileCategories.find((c) => c.id === categoryId)
    return category ? category.name : "Uncategorized"
  }

  const getEntityName = (entityType?: string, entityId?: string) => {
    if (!entityType || !entityId) return null

    switch (entityType) {
      case "vendor":
        const vendor = vendors.find((v) => v.id === entityId)
        return vendor ? `Vendor: ${vendor.name}` : "Unknown Vendor"
      case "resource":
        const resource = resources.find((r) => r.id === entityId)
        return resource ? `Resource: ${resource.name}` : "Unknown Resource"
      case "job":
        const job = jobRequirements.find((j) => j.id === entityId)
        return job ? `Job: ${job.title}` : "Unknown Job"
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {fileCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Category
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <FilePlus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedFiles.length} files selected</span>
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Categories Section */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className="flex items-center"
        >
          <Folder className="h-4 w-4 mr-2" />
          All Files
        </Button>
        {fileCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center group relative"
          >
            <Folder className="h-4 w-4 mr-2" />
            {category.name}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Button>
        ))}
      </div>

      {/* Files Section */}
      {sortedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <File className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No files found</h3>
          <p className="text-muted-foreground mb-4">Upload files to get started</p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <FilePlus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="relative">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={(checked) => handleSelectFile(file.id, checked === true)}
                  className="absolute top-2 left-2 z-10"
                />
                <div
                  className="h-40 flex items-center justify-center bg-muted cursor-pointer"
                  onClick={() => handlePreviewFile(file)}
                >
                  {file.contentType.includes("image") ? (
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=160&width=320"
                        e.currentTarget.className = "h-20 w-20 object-contain"
                      }}
                    />
                  ) : (
                    getFileIcon(file.contentType)
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3
                      className="font-medium truncate cursor-pointer"
                      title={file.name}
                      onClick={() => handlePreviewFile(file)}
                    >
                      {file.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={file.url} download={file.originalFilename} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(file.categoryId)}
                  </Badge>
                  {file.entityType && file.entityId && (
                    <Badge variant="secondary" className="text-xs ml-1">
                      {getEntityName(file.entityType, file.entityId)}
                    </Badge>
                  )}
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedFiles.length > 0 && selectedFiles.length === sortedFiles.length
                          ? true
                          : selectedFiles.length === 0
                            ? false
                            : "indeterminate"
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="h-auto p-0 font-semibold flex items-center"
                    >
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("size")}
                      className="h-auto p-0 font-semibold flex items-center"
                    >
                      Size <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("uploadedAt")}
                      className="h-auto p-0 font-semibold flex items-center"
                    >
                      Uploaded <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={(checked) => handleSelectFile(file.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {file.contentType.includes("image") ? (
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                            }}
                          />
                        ) : (
                          React.cloneElement(getFileIcon(file.contentType), { className: "h-6 w-6" })
                        )}
                      </div>
                      <div>
                        <p
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => handlePreviewFile(file)}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.originalFilename}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(file.categoryId)}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <div>
                        <p>{file.uploadedAt.toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.uploadedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {file.tags && file.tags.length > 0 ? (
                          file.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreviewFile(file)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={file.url}
                            download={file.originalFilename}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteFile(file.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Upload a new file to the system</DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 overflow-y-auto">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <FileUpload
                  accept="*/*"
                  maxSize={50}
                  onFileChange={handleFileChange}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </div>

              {fileToUpload && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">File Name</Label>
                    <Input
                      id="name"
                      value={uploadFormData.name}
                      onChange={(e) => setUploadFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter a name for this file"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter a description for this file"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={uploadFormData.categoryId}
                      onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {fileCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entityType">Related To (Optional)</Label>
                      <Select
                        value={uploadFormData.entityType || ""}
                        onValueChange={(value) =>
                          setUploadFormData((prev) => ({
                            ...prev,
                            entityType: value as any,
                            entityId: "",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                          <SelectItem value="job">Job</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entityId">Entity</Label>
                      <Select
                        value={uploadFormData.entityId}
                        onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, entityId: value }))}
                        disabled={!uploadFormData.entityType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadFormData.entityType === "vendor" &&
                            vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          {uploadFormData.entityType === "resource" &&
                            resources.map((resource) => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.name}
                              </SelectItem>
                            ))}
                          {uploadFormData.entityType === "job" &&
                            jobRequirements.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tags..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag}>
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>

                    {uploadFormData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadFormData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload} disabled={!fileToUpload || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Create a new category for organizing files"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description (Optional)</Label>
              <Textarea
                id="categoryDescription"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
              <Select
                value={categoryFormData.parentId}
                onValueChange={(value) => setCategoryFormData((prev) => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {fileCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!categoryFormData.name}>
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedFile.name}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedFile.url}
                      download={selectedFile.originalFilename}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  {formatFileSize(selectedFile.size)} • Uploaded on{" "}
                  {selectedFile.uploadedAt.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 h-[70vh] overflow-hidden rounded border">
                {selectedFile.contentType.includes("image") ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <img
                      src={selectedFile.url || "/placeholder.svg"}
                      alt={selectedFile.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : selectedFile.contentType.includes("pdf") ? (
                  <iframe
                    src={`${selectedFile.url}#toolbar=0&navpanes=0`}
                    className="w-full h-full"
                    title={selectedFile.name}
                  />
                ) : selectedFile.contentType.includes("word") ||
                  selectedFile.contentType.includes("document") ||
                  selectedFile.contentType.includes("excel") ||
                  selectedFile.contentType.includes("spreadsheet") ? (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                    {getFileIcon(selectedFile.contentType)}
                    <p className="text-lg font-medium mt-4">Preview Not Available</p>
                    <p className="text-sm text-muted-foreground mb-4">Please download the file to view its contents</p>
                    <Button asChild>
                      <a
                        href={selectedFile.url}
                        download={selectedFile.originalFilename}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                    {getFileIcon(selectedFile.contentType)}
                    <p className="text-lg font-medium mt-4">Preview Not Available</p>
                    <p className="text-sm text-muted-foreground">This file type cannot be previewed</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-2">
                    {selectedFile.description && (
                      <div>
                        <h4 className="text-sm font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedFile.description}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium">Category</h4>
                      <Badge variant="outline">{getCategoryName(selectedFile.categoryId)}</Badge>
                    </div>
                    {selectedFile.entityType && selectedFile.entityId && (
                      <div>
                        <h4 className="text-sm font-medium">Related To</h4>
                        <Badge variant="secondary">
                          {getEntityName(selectedFile.entityType, selectedFile.entityId)}
                        </Badge>
                      </div>
                    )}
                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium">Tags</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedFile.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="metadata" className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h4 className="text-sm font-medium">Original Filename</h4>
                        <p className="text-sm text-muted-foreground">{selectedFile.originalFilename}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Content Type</h4>
                        <p className="text-sm text-muted-foreground">{selectedFile.contentType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Size</h4>
                        <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Uploaded By</h4>
                        <p className="text-sm text-muted-foreground">{selectedFile.uploadedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Uploaded At</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.uploadedAt.toLocaleString()}
                        </p>
                      </div>
                      {selectedFile.updatedAt && (
                        <div>
                          <h4 className="text-sm font-medium">Last Updated</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedFile.updatedAt.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
