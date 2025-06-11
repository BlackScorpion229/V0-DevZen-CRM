"use client"

import type React from "react"

import { useState } from "react"
import { useDatabase, type JobRequirement } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, ArrowUpDown, Plus, X } from "lucide-react"

interface JobRequirementsProps {
  showAddDialog?: boolean
  onCloseAddDialog?: () => void
}

export function JobRequirements({ showAddDialog = false, onCloseAddDialog }: JobRequirementsProps) {
  const {
    jobRequirements,
    vendors,
    resources,
    addJobRequirement,
    updateJobRequirement,
    deleteJobRequirement,
    techStackSkills,
    addTechStackSkill,
  } = useDatabase()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobRequirement | null>(null)
  const [sortField, setSortField] = useState<keyof JobRequirement>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [formData, setFormData] = useState({
    title: "",
    vendorId: "",
    contactId: "",
    techStack: [] as string[],
    experience: "",
    description: "",
    status: "active" as JobRequirement["status"],
    assignedResources: [] as string[],
  })

  const [techStackInput, setTechStackInput] = useState("")
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])

  const selectedVendor = vendors.find((v) => v.id === formData.vendorId)

  const handleSort = (field: keyof JobRequirement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedJobs = [...jobRequirements]
    .filter((job) => filterStatus === "all" || job.status === filterStatus)
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const resetForm = () => {
    setFormData({
      title: "",
      vendorId: "",
      contactId: "",
      techStack: [],
      experience: "",
      description: "",
      status: "active",
      assignedResources: [],
    })
    setTechStackInput("")
    setFilteredSkills([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingJob) {
      updateJobRequirement(editingJob.id, formData)
      setEditingJob(null)
    } else {
      addJobRequirement(formData)
      onCloseAddDialog?.()
    }

    resetForm()
  }

  const handleEdit = (job: JobRequirement) => {
    setFormData({
      title: job.title,
      vendorId: job.vendorId,
      contactId: job.contactId,
      techStack: job.techStack,
      experience: job.experience,
      description: job.description,
      status: job.status,
      assignedResources: job.assignedResources,
    })
    setEditingJob(job)
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

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor ? vendor.name : "Unknown Vendor"
  }

  const getContactName = (vendorId: string, contactId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId)
    const contact = vendor?.contacts.find((c) => c.id === contactId)
    return contact ? contact.name : "Unknown Contact"
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="onhold">On Hold</SelectItem>
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
                    <Button variant="ghost" onClick={() => handleSort("title")} className="h-auto p-0 font-semibold">
                      Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tech Stack</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Assigned Resources</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{getVendorName(job.vendorId)}</TableCell>
                    <TableCell>{getContactName(job.vendorId, job.contactId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {job.techStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {job.techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.techStack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{job.experience}</TableCell>
                    <TableCell>{job.assignedResources.length} resources</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "active"
                            ? "default"
                            : job.status === "closed"
                              ? "secondary"
                              : job.status === "onhold"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteJobRequirement(job.id)}>
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

      <Dialog
        open={showAddDialog || !!editingJob}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAddDialog?.()
            setEditingJob(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Requirement" : "Add New Job Requirement"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update job requirement information" : "Add a new job requirement to your system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, vendorId: value, contactId: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, contactId: value }))}
                  disabled={!selectedVendor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedVendor?.contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Required</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 3-5 years"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: JobRequirement["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="onhold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedResources">Assigned Resources</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!formData.assignedResources.includes(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      assignedResources: [...prev.assignedResources, value],
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resources to assign" />
                </SelectTrigger>
                <SelectContent>
                  {resources
                    .filter((resource) => !formData.assignedResources.includes(resource.id))
                    .map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.techStack.join(", ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {formData.assignedResources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assignedResources.map((resourceId) => {
                    const resource = resources.find((r) => r.id === resourceId)
                    return (
                      <Badge key={resourceId} variant="secondary" className="flex items-center gap-1">
                        {resource?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              assignedResources: prev.assignedResources.filter((id) => id !== resourceId),
                            }))
                          }
                        />
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Job description and requirements..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingJob(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingJob ? "Update Job" : "Add Job"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
