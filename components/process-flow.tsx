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
import { Trash2, Edit, ArrowUpDown, Calendar, Clock, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Interface for status history
interface StatusHistory {
  status: ProcessFlow["status"]
  timestamp: Date
  notes?: string
  updatedBy?: string
}

// Extended ProcessFlow interface with history
interface ProcessFlowWithHistory extends ProcessFlow {
  statusHistory: StatusHistory[]
}

export function ProcessFlowManagement({ showAddDialog = false, onCloseAddDialog }: ProcessFlowManagementProps) {
  const { processFlows, jobRequirements, resources, addProcessFlow, updateProcessFlow, deleteProcessFlow } =
    useDatabase()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState<ProcessFlow | null>(null)
  const [sortField, setSortField] = useState<keyof ProcessFlow>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedFlow, setSelectedFlow] = useState<ProcessFlowWithHistory | null>(null)

  const [formData, setFormData] = useState({
    jobId: "",
    resourceId: "",
    status: "resume-submitted" as ProcessFlow["status"],
    scheduledDate: "",
    notes: "",
  })

  // Generate mock status history for demonstration
  const generateStatusHistory = (flow: ProcessFlow): StatusHistory[] => {
    // Start with the current status
    const history: StatusHistory[] = [
      {
        status: flow.status,
        timestamp: flow.updatedAt,
        notes: flow.notes,
        updatedBy: flow.updatedBy || "system",
      },
    ]

    // Add previous statuses based on the current status
    const statusIndex = statusOptions.findIndex((s) => s.value === flow.status)

    // Add previous statuses if the current status is not the first one
    for (let i = statusIndex - 1; i >= 0; i--) {
      const previousDate = new Date(flow.updatedAt)
      previousDate.setDate(previousDate.getDate() - (statusIndex - i))

      history.push({
        status: statusOptions[i].value as ProcessFlow["status"],
        timestamp: previousDate,
        notes: `Status updated to ${statusOptions[i].label}`,
        updatedBy: "system",
      })
    }

    // Sort by timestamp descending (newest first)
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

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

  const handleViewFlow = (flow: ProcessFlow) => {
    // Create a copy with status history
    const flowWithHistory: ProcessFlowWithHistory = {
      ...flow,
      statusHistory: generateStatusHistory(flow),
    }
    setSelectedFlow(flowWithHistory)
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
                    <TableRow
                      key={flow.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewFlow(flow)}
                    >
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(flow)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProcessFlow(flow.id)
                            }}
                          >
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

      {/* Add/Edit Process Flow Dialog */}
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
        <DialogContent className="max-w-2xl h-[550px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingFlow ? "Edit Process Flow" : "Add New Process Flow"}</DialogTitle>
            <DialogDescription>
              {editingFlow ? "Update process flow information" : "Add a new process flow to track job progress"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 px-6 overflow-y-auto">
              <div className="space-y-4 py-4">
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
                      onValueChange={(value: ProcessFlow["status"]) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
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
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onCloseAddDialog?.()
                    setEditingFlow(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingFlow ? "Update Flow" : "Add Flow"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Process Flow Detail Dialog */}
      <Dialog open={!!selectedFlow} onOpenChange={(open) => !open && setSelectedFlow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Process Flow Details</DialogTitle>
              <DialogDescription>
                {selectedFlow && (
                  <Badge className={`text-white mt-1 ${getStatusInfo(selectedFlow.status).color}`}>
                    {getStatusInfo(selectedFlow.status).label}
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedFlow(null)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedFlow && (
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">Status History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Job Requirement</h3>
                      <p className="text-base">{getJobTitle(selectedFlow.jobId)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Resource</h3>
                      <p className="text-base">{getResourceName(selectedFlow.resourceId)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <Badge className={`text-white ${getStatusInfo(selectedFlow.status).color}`}>
                        {getStatusInfo(selectedFlow.status).label}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Scheduled Date</h3>
                      <p className="text-base">
                        {selectedFlow.scheduledDate ? selectedFlow.scheduledDate.toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p className="text-base whitespace-pre-wrap">{selectedFlow.notes || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                      <p className="text-base">{selectedFlow.updatedAt.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Updated By</h3>
                      <p className="text-base">{selectedFlow.updatedBy || "System"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Status History Timeline</h3>
                    <div className="space-y-4">
                      {selectedFlow.statusHistory.map((history, index) => (
                        <div key={index} className="relative pl-8 pb-4">
                          {/* Timeline connector */}
                          {index < selectedFlow.statusHistory.length - 1 && (
                            <div className="absolute left-3 top-3 h-full w-0.5 bg-muted-foreground/20"></div>
                          )}

                          {/* Status dot */}
                          <div
                            className={`absolute left-0 top-1 h-6 w-6 rounded-full ${getStatusInfo(history.status).color} flex items-center justify-center text-white`}
                          >
                            {index === 0 && <Clock className="h-3 w-3" />}
                          </div>

                          {/* Status content */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-white ${getStatusInfo(history.status).color}`}>
                                {getStatusInfo(history.status).label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {history.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{history.notes || "Status updated"}</p>
                            <p className="text-xs text-muted-foreground">Updated by: {history.updatedBy}</p>
                          </div>
                        </div>
                      ))}
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
                  if (selectedFlow) {
                    handleEdit(selectedFlow)
                    setSelectedFlow(null)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Process Flow
              </Button>
              <Button variant="default" onClick={() => setSelectedFlow(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
