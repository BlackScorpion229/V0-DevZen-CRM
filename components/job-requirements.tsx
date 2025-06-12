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
import { Trash2, Edit, ArrowUpDown, Plus, X, DollarSign, MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JobRequirementsProps {
  showAddDialog?: boolean
  onCloseAddDialog?: () => void
}

export function JobRequirements({ showAddDialog = false, onCloseAddDialog }: JobRequirementsProps) {
  const {
    jobRequirements,
    addJobRequirement,
    updateJobRequirement,
    deleteJobRequirement,
    techStackSkills,
    addTechStackSkill,
  } = useDatabase()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobRequirement | null>(null)
  const [sortField, setSortField] = useState<keyof JobRequirement>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: [] as string[],
    experience: 0,
    location: "",
    remoteAvailable: false,
    budget: 0,
    duration: "",
    priority: "medium" as JobRequirement["priority"],
    status: "open" as JobRequirement["status"],
    clientName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    startDate: "",
    endDate: "",
    requirements: [] as string[],
    benefits: [] as string[],
  })

  const [techStackInput, setTechStackInput] = useState("")
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])
  const [requirementInput, setRequirementInput] = useState("")
  const [benefitInput, setBenefitInput] = useState("")

  const handleSort = (field: keyof JobRequirement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedJobs = [...jobRequirements]
    .filter((job) => {
      const statusMatch = filterStatus === "all" || job.status === filterStatus
      const priorityMatch = filterPriority === "all" || job.priority === filterPriority
      return statusMatch && priorityMatch
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

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
      title: "",
      description: "",
      techStack: [],
      experience: 0,
      location: "",
      remoteAvailable: false,
      budget: 0,
      duration: "",
      priority: "medium",
      status: "open",
      clientName: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      startDate: "",
      endDate: "",
      requirements: [],
      benefits: [],
    })
    setTechStackInput("")
    setFilteredSkills([])
    setRequirementInput("")
    setBenefitInput("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const jobData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    }

    if (editingJob) {
      updateJobRequirement(editingJob.id, jobData)
      setEditingJob(null)
    } else {
      addJobRequirement(jobData)
      onCloseAddDialog?.()
    }

    resetForm()
  }

  const handleEdit = (job: JobRequirement) => {
    setFormData({
      title: job.title,
      description: job.description,
      techStack: job.techStack,
      experience: job.experience,
      location: job.location || "",
      remoteAvailable: job.remoteAvailable || false,
      budget: job.budget || 0,
      duration: job.duration || "",
      priority: job.priority,
      status: job.status,
      clientName: job.clientName || "",
      contactPerson: job.contactPerson || "",
      contactEmail: job.contactEmail || "",
      contactPhone: job.contactPhone || "",
      startDate: job.startDate ? job.startDate.toISOString().split("T")[0] : "",
      endDate: job.endDate ? job.endDate.toISOString().split("T")[0] : "",
      requirements: job.requirements || [],
      benefits: job.benefits || [],
    })
    setEditingJob(job)
  }

  const handleViewJob = (job: JobRequirement) => {
    setSelectedJob(job)
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

  const addRequirement = () => {
    if (requirementInput && !formData.requirements.includes(requirementInput)) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput],
      }))
      setRequirementInput("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== requirement),
    }))
  }

  const addBenefit = () => {
    if (benefitInput && !formData.benefits.includes(benefitInput)) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput],
      }))
      setBenefitInput("")
    }
  }

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }))
  }

  const getPriorityColor = (priority: JobRequirement["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: JobRequirement["status"]) => {
    switch (status) {
      case "open":
        return "default"
      case "in-progress":
        return "secondary"
      case "filled":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
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
                  <TableHead>Client</TableHead>
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
                    <Button variant="ghost" onClick={() => handleSort("budget")} className="h-auto p-0 font-semibold">
                      Budget <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("priority")} className="h-auto p-0 font-semibold">
                      Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Created <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewJob(job)}
                  >
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.clientName || "-"}</TableCell>
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
                    <TableCell>{job.experience} years</TableCell>
                    <TableCell>
                      {job.budget ? (
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.budget.toLocaleString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {job.location ? (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                          {job.remoteAvailable && <Badge className="ml-1 text-xs">Remote</Badge>}
                        </span>
                      ) : job.remoteAvailable ? (
                        <Badge variant="outline">Remote</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-white ${getPriorityColor(job.priority)}`}>{job.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell>{job.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(job)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteJobRequirement(job.id)
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

      {/* Add/Edit Job Dialog */}
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
        <DialogContent className="max-w-2xl h-[600px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingJob ? "Edit Job Requirement" : "Add New Job Requirement"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update job requirement information" : "Add a new job requirement to your system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 px-6 overflow-y-auto">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Required (years)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, budget: Number.parseInt(e.target.value) || 0 }))
                      }
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
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: JobRequirement["priority"]) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remoteAvailable"
                    checked={formData.remoteAvailable}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, remoteAvailable: checked === true }))
                    }
                  />
                  <Label htmlFor="remoteAvailable">Remote Work Available</Label>
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <div className="flex gap-2">
                    <Input
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      placeholder="Add requirement..."
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.requirements.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{req}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeRequirement(req)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Add benefit..."
                    />
                    <Button type="button" onClick={addBenefit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.benefits.map((benefit) => (
                        <Badge key={benefit} variant="outline" className="flex items-center gap-1">
                          {benefit}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeBenefit(benefit)} />
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
                    setEditingJob(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingJob ? "Update Job" : "Add Job"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{selectedJob?.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusColor(selectedJob?.status || "open")}>{selectedJob?.status}</Badge>
                  <Badge className={`text-white ${getPriorityColor(selectedJob?.priority || "medium")}`}>
                    {selectedJob?.priority} priority
                  </Badge>
                </div>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedJob && (
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Job Title</h3>
                      <p className="text-base">{selectedJob.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                      <p className="text-base">{selectedJob.clientName || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-base whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Experience Required</h3>
                      <p className="text-base">{selectedJob.experience} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                      <p className="text-base">
                        {selectedJob.budget ? `$${selectedJob.budget.toLocaleString()}` : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p className="text-base flex items-center">
                        {selectedJob.location || "-"}
                        {selectedJob.remoteAvailable && (
                          <Badge className="ml-2" variant="outline">
                            Remote Available
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                      <p className="text-base">{selectedJob.duration || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                      <p className="text-base">
                        {selectedJob.startDate ? selectedJob.startDate.toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                      <p className="text-base">
                        {selectedJob.endDate ? selectedJob.endDate.toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedJob.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                        {selectedJob.techStack.length === 0 && (
                          <p className="text-muted-foreground">No tech stack specified</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                      <p className="text-base">{selectedJob.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                      <p className="text-base">{selectedJob.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="requirements">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Requirements</h3>
                      {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedJob.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No specific requirements listed</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Benefits</h3>
                      {selectedJob.benefits && selectedJob.benefits.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.benefits.map((benefit) => (
                            <Badge key={benefit} variant="outline">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No benefits specified</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                        <p className="text-base">{selectedJob.contactPerson || "-"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-base">{selectedJob.contactEmail || "-"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                        <p className="text-base">{selectedJob.contactPhone || "-"}</p>
                      </div>
                    </div>
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
                  if (selectedJob) {
                    handleEdit(selectedJob)
                    setSelectedJob(null)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
              <Button variant="default" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
