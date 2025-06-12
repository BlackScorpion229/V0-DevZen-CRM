"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useDatabase, type Resource } from "@/lib/database"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, ArrowUpDown, FileText, X, Plus, MapPin, DollarSign } from "lucide-react"
import { FileUpload } from "./file-upload"
import { useAuth } from "@/lib/auth"
import { uploadFile, deleteFile } from "@/lib/file-storage"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ResourceManagementProps {
  showAddDialog?: boolean
  onCloseAddDialog?: () => void
}

export function ResourceManagement({ showAddDialog = false, onCloseAddDialog }: ResourceManagementProps) {
  const { resources, addResource, updateResource, deleteResource, techStackSkills, addTechStackSkill } = useDatabase()
  const { user } = useAuth()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [sortField, setSortField] = useState<keyof Resource>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    techStack: [] as string[],
    experience: 0,
    type: "InHouse" as Resource["type"],
    status: "available" as Resource["status"],
    hourlyRate: 0,
    location: "",
    remoteAvailability: false,
    startDate: "",
    skills: [] as { name: string; level: "beginner" | "intermediate" | "expert" }[],
    certifications: [] as string[],
    resumeFile: "",
    resumeMetadata: undefined as Resource["resumeMetadata"],
  })

  const [techStackInput, setTechStackInput] = useState("")
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])
  const [certificationInput, setCertificationInput] = useState("")
  const [skillForm, setSkillForm] = useState({
    name: "",
    level: "intermediate" as "beginner" | "intermediate" | "expert",
  })

  const handleSort = (field: keyof Resource) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedResources = [...resources]
    .filter((resource) => {
      const typeMatch = filterType === "all" || resource.type === filterType
      const statusMatch = filterStatus === "all" || resource.status === filterStatus
      return typeMatch && statusMatch
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      techStack: [],
      experience: 0,
      type: "InHouse",
      status: "available",
      hourlyRate: 0,
      location: "",
      remoteAvailability: false,
      startDate: "",
      skills: [],
      certifications: [],
      resumeFile: "",
      resumeMetadata: undefined,
    })
    setTechStackInput("")
    setFilteredSkills([])
    setCertificationInput("")
    setSkillForm({
      name: "",
      level: "intermediate",
    })
    setSelectedFile(null)
  }

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file)
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        resumeFile: "",
        resumeMetadata: undefined,
      }))
    }
  }, [])

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return

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
      const metadata = await uploadFile(selectedFile, user.id)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data with file metadata
      setFormData((prev) => ({
        ...prev,
        resumeFile: selectedFile.name,
        resumeMetadata: metadata,
      }))

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error("Error uploading file:", error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = async () => {
    if (formData.resumeMetadata?.pathname) {
      try {
        await deleteFile(formData.resumeMetadata.pathname)
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    }

    setFormData((prev) => ({
      ...prev,
      resumeFile: "",
      resumeMetadata: undefined,
    }))
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Upload file if selected but not yet uploaded
    if (selectedFile && !formData.resumeMetadata) {
      await handleFileUpload()
    }

    // Convert startDate string to Date object if provided
    const formattedData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
    }

    if (editingResource) {
      updateResource(editingResource.id, formattedData)
      setEditingResource(null)
    } else {
      addResource(formattedData)
      onCloseAddDialog?.()
    }

    resetForm()
  }

  const handleEdit = (resource: Resource) => {
    setFormData({
      name: resource.name,
      email: resource.email,
      phone: resource.phone,
      techStack: resource.techStack,
      experience: resource.experience,
      type: resource.type,
      status: resource.status,
      hourlyRate: resource.hourlyRate || 0,
      location: resource.location || "",
      remoteAvailability: resource.remoteAvailability || false,
      startDate: resource.startDate ? resource.startDate.toISOString().split("T")[0] : "",
      skills: resource.skills || [],
      certifications: resource.certifications || [],
      resumeFile: resource.resumeFile || "",
      resumeMetadata: resource.resumeMetadata,
    })
    setEditingResource(resource)
  }

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource)
  }

  const handleDelete = async (resource: Resource) => {
    // Delete the file if it exists
    if (resource.resumeMetadata?.pathname) {
      try {
        await deleteFile(resource.resumeMetadata.pathname)
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    }

    // Delete the resource
    deleteResource(resource.id)
  }

  const handleTechStackInput = (value: string) => {
    setTechStackInput(value)
    if (value) {
      const filtered = techStackSkills.filter(
        (skill) => skill.toLowerCase().includes(value.toLowerCase()) && !formData.techStack.includes(skill),
      )
      setFilteredSkills(filtered)
    } else {
      setFilteredSkills([])
    }
  }

  const addTechStackSkillToForm = (skill: string) => {
    if (!formData.techStack.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, skill],
      }))
    }
    setTechStackInput("")
    setFilteredSkills([])
  }

  const addNewTechStackSkill = () => {
    if (techStackInput && !techStackSkills.includes(techStackInput)) {
      addTechStackSkill(techStackInput)
      addTechStackSkillToForm(techStackInput)
    }
  }

  const removeTechStackSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((s) => s !== skill),
    }))
  }

  const addSkill = () => {
    if (skillForm.name) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, { ...skillForm }],
      }))
      setSkillForm({
        name: "",
        level: "intermediate",
      })
    }
  }

  const removeSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== skillName),
    }))
  }

  const addCertification = () => {
    if (certificationInput && !formData.certifications.includes(certificationInput)) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput],
      }))
      setCertificationInput("")
    }
  }

  const removeCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="InHouse">InHouse</SelectItem>
            <SelectItem value="InHouse-Friends">InHouse-Friends</SelectItem>
            <SelectItem value="External-LinkedIn">External-LinkedIn</SelectItem>
            <SelectItem value="External-Email">External-Email</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tech Stack</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("experience")}
                      className="h-auto p-0 font-semibold"
                    >
                      Experience <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("hourlyRate")}
                      className="h-auto p-0 font-semibold"
                    >
                      Rate <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("type")} className="h-auto p-0 font-semibold">
                      Type <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResources.map((resource) => (
                  <TableRow
                    key={resource.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewResource(resource)}
                  >
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resource.techStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {resource.techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.techStack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{resource.experience} years</TableCell>
                    <TableCell>
                      {resource.hourlyRate ? (
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {resource.hourlyRate}/hr
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {resource.location ? (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {resource.location}
                          {resource.remoteAvailability && <Badge className="ml-1 text-xs">Remote</Badge>}
                        </span>
                      ) : resource.remoteAvailability ? (
                        <Badge variant="outline">Remote</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          resource.status === "available"
                            ? "default"
                            : resource.status === "busy"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {resource.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resource.resumeMetadata ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(resource.resumeMetadata?.url, "_blank")
                          }}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      ) : resource.resumeFile ? (
                        <Badge variant="outline">{resource.resumeFile}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(resource)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(resource)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Resource Dialog */}
      <Dialog
        open={showAddDialog || !!editingResource}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAddDialog?.()
            setEditingResource(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl h-[600px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            <DialogDescription>
              {editingResource ? "Update resource information" : "Add a new resource to your system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 px-6 overflow-y-auto">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, experience: Number.parseInt(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Resource["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InHouse">InHouse</SelectItem>
                        <SelectItem value="InHouse-Friends">InHouse-Friends</SelectItem>
                        <SelectItem value="External-LinkedIn">External-LinkedIn</SelectItem>
                        <SelectItem value="External-Email">External-Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Resource["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, hourlyRate: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="remoteAvailability"
                      checked={formData.remoteAvailability}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, remoteAvailability: checked === true }))
                      }
                    />
                    <Label htmlFor="remoteAvailability">Available for Remote Work</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="mt-1">
                    <FileUpload
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      onFileChange={handleFileChange}
                      value={formData.resumeFile}
                      filename={formData.resumeMetadata?.filename || formData.resumeFile}
                      fileUrl={formData.resumeMetadata?.url}
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                      onRemove={handleRemoveFile}
                    />
                  </div>
                  {selectedFile && !formData.resumeMetadata && !isUploading && (
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="mr-2">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Badge>
                      <Button type="button" size="sm" onClick={handleFileUpload}>
                        Upload Now
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                  <div className="relative">
                    <Input
                      value={techStackInput}
                      onChange={(e) => handleTechStackInput(e.target.value)}
                      placeholder="Type to search or add tech stack..."
                    />
                    {filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {filteredSkills.map((skill) => (
                          <div
                            key={skill}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addTechStackSkillToForm(skill)}
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    )}
                    {techStackInput && !techStackSkills.includes(techStackInput) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={addNewTechStackSkill}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {formData.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.techStack.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechStackSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Detailed Skills</Label>
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="skillName">Skill Name</Label>
                      <Input
                        id="skillName"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Skill name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <RadioGroup
                        value={skillForm.level}
                        onValueChange={(value: "beginner" | "intermediate" | "expert") =>
                          setSkillForm((prev) => ({ ...prev, level: value }))
                        }
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="beginner" id="beginner" />
                          <Label htmlFor="beginner">Beginner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="intermediate" id="intermediate" />
                          <Label htmlFor="intermediate">Intermediate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expert" id="expert" />
                          <Label htmlFor="expert">Expert</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="col-span-2">
                      <Button type="button" onClick={addSkill} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="mt-2">
                      <div className="grid grid-cols-3 gap-2">
                        {formData.skills.map((skill) => (
                          <div key={skill.name} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{skill.name}</p>
                              <Badge
                                variant={
                                  skill.level === "beginner"
                                    ? "outline"
                                    : skill.level === "intermediate"
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {skill.level}
                              </Badge>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => removeSkill(skill.name)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      placeholder="Add certification..."
                    />
                    <Button type="button" onClick={addCertification}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="flex items-center gap-1">
                          {cert}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeCertification(cert)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onCloseAddDialog?.()
                    setEditingResource(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingResource ? "Update Resource" : "Add Resource"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resource Detail Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{selectedResource?.name}</DialogTitle>
              <DialogDescription>
                <Badge
                  variant={
                    selectedResource?.status === "available"
                      ? "default"
                      : selectedResource?.status === "busy"
                        ? "destructive"
                        : "secondary"
                  }
                  className="mt-1"
                >
                  {selectedResource?.status}
                </Badge>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedResource(null)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedResource && (
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Tech Stack</TabsTrigger>
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                      <p className="text-base">{selectedResource.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-base">{selectedResource.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p className="text-base">{selectedResource.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
                      <p className="text-base">{selectedResource.experience} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                      <Badge variant="secondary">{selectedResource.type}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <Badge
                        variant={
                          selectedResource.status === "available"
                            ? "default"
                            : selectedResource.status === "busy"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {selectedResource.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Hourly Rate</h3>
                      <p className="text-base">
                        {selectedResource.hourlyRate ? `$${selectedResource.hourlyRate}/hr` : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p className="text-base flex items-center">
                        {selectedResource.location || "-"}
                        {selectedResource.remoteAvailability && (
                          <Badge className="ml-2" variant="outline">
                            Remote Available
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                      <p className="text-base">
                        {selectedResource.startDate ? selectedResource.startDate.toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                        {selectedResource.techStack.length === 0 && (
                          <p className="text-muted-foreground">No tech stack specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Detailed Skills</h3>
                      {selectedResource.skills && selectedResource.skills.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {selectedResource.skills.map((skill) => (
                            <div key={skill.name} className="border rounded-lg p-3">
                              <p className="font-medium">{skill.name}</p>
                              <Badge
                                variant={
                                  skill.level === "beginner"
                                    ? "outline"
                                    : skill.level === "intermediate"
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {skill.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No detailed skills specified</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.certifications && selectedResource.certifications.length > 0 ? (
                          selectedResource.certifications.map((cert) => (
                            <Badge key={cert} variant="outline">
                              {cert}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No certifications specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resume">
                  <div className="space-y-4">
                    {selectedResource.resumeMetadata ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{selectedResource.resumeMetadata.filename}</h3>
                            <p className="text-sm text-muted-foreground">
                              {(selectedResource.resumeMetadata.size / 1024 / 1024).toFixed(2)} MB • Uploaded on{" "}
                              {selectedResource.resumeMetadata.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Button asChild>
                            <a href={selectedResource.resumeMetadata.url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </a>
                          </Button>
                        </div>

                        {selectedResource.resumeMetadata.contentType === "application/pdf" && (
                          <div className="border rounded-lg h-[400px] overflow-hidden">
                            <iframe
                              src={`${selectedResource.resumeMetadata.url}#toolbar=0&navpanes=0`}
                              className="w-full h-full"
                              title={selectedResource.resumeMetadata.filename}
                            />
                          </div>
                        )}
                      </div>
                    ) : selectedResource.resumeFile ? (
                      <div className="text-center p-8 border rounded-lg">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">{selectedResource.resumeFile}</h3>
                        <p className="text-muted-foreground">Resume file available</p>
                      </div>
                    ) : (
                      <div className="text-center p-8 border rounded-lg">
                        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Resume Available</h3>
                        <p className="text-muted-foreground">No resume has been uploaded for this resource</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedResource) {
                    handleEdit(selectedResource)
                    setSelectedResource(null)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Resource
              </Button>
              <Button variant="default" onClick={() => setSelectedResource(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
