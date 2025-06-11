"use client"

import type React from "react"

import { useState } from "react"
import { useDatabase, type ProcessFlow } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, ArrowUpDown, Calendar } from "lucide-react"

const statusOptions = [
  { value: "resume-submitted", label: "Resume Submitted", color: "bg-blue-500" },
  { value: "screening-scheduled", label: "Screening Scheduled", color: "bg-yellow-500" },
  { value: "screening-cleared", label: "Screening Cleared", color: "bg-green-500" },
  { value: "client-screening-scheduled", label: "Client Screening Scheduled", color: "bg-orange-500" },
  { value: "client-screening-cleared", label: "Client Screening Cleared", color: "bg-purple-500" },
  { value: "final-interview-scheduled", label: "Final Interview Scheduled", color: "bg-indigo-500" },
  { value: "cleared", label: "Cleared", color: "bg-green-600" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
]

interface ProcessFlowManagementProps {
  showAddDialog?: boolean
  onCloseAddDialog?: () => void
}

export function ProcessFlowManagement({ showAddDialog = false, onCloseAddDialog }: ProcessFlowManagementProps) {
  const { processFlows, jobRequirements, resources, addProcessFlow, updateProcessFlow, deleteProcessFlow } =
    useDatabase()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState<ProcessFlow | null>(null)
  const [sortField, setSortField] = useState<keyof ProcessFlow>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [formData, setFormData] = useState({
    jobId: "",
    resourceId: "",
    status: "resume-submitted" as ProcessFlow["status"],
    scheduledDate: "",
    notes: "",
  })

  const handleSort = (field: keyof ProcessFlow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedFlows = [...processFlows]
    .filter((flow) => filterStatus === "all" || flow.status === filterStatus)
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const resetForm = () => {
    setFormData({
      jobId: "",
      resourceId: "",
      status: "resume-submitted",
      scheduledDate: "",
      notes: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const flowData = {
      ...formData,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
    }

    if (editingFlow) {
      updateProcessFlow(editingFlow.id, flowData)
      setEditingFlow(null)
    } else {
      addProcessFlow(flowData)
      onCloseAddDialog?.()
    }

    resetForm()
  }

  const handleEdit = (flow: ProcessFlow) => {
    setFormData({
      jobId: flow.jobId,
      resourceId: flow.resourceId,
      status: flow.status,
      scheduledDate: flow.scheduledDate ? flow.scheduledDate.toISOString().split("T")[0] : "",
      notes: flow.notes,
    })
    setEditingFlow(flow)
  }

  const getJobTitle = (jobId: string) => {
    const job = jobRequirements.find((j) => j.id === jobId)
    return job ? job.title : "Unknown Job"
  }

  const getResourceName = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    return resource ? resource.name : "Unknown Resource"
  }

  const getStatusInfo = (status: ProcessFlow["status"]) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
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
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("updatedAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Last Updated <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFlows.map((flow) => {
                  const statusInfo = getStatusInfo(flow.status)
                  return (
                    <TableRow key={flow.id}>
                      <TableCell className="font-medium">{getJobTitle(flow.jobId)}</TableCell>
                      <TableCell>{getResourceName(flow.resourceId)}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${statusInfo.color}`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {flow.scheduledDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {flow.scheduledDate.toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{flow.notes || "-"}</TableCell>
                      <TableCell>{flow.updatedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(flow)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteProcessFlow(flow.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showAddDialog || !!editingFlow}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAddDialog?.()
            setEditingFlow(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFlow ? "Edit Process Flow" : "Add New Process Flow"}</DialogTitle>
            <DialogDescription>
              {editingFlow ? "Update process flow information" : "Add a new process flow to track job progress"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job">Job Requirement</Label>
                <Select
                  value={formData.jobId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, jobId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRequirements.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, resourceId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProcessFlow["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this process step..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingFlow(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingFlow ? "Update Flow" : "Add Flow"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
