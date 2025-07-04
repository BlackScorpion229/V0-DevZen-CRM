"use client"

import type React from "react"

import { useState } from "react"
import { useDatabase, type Vendor, type VendorContact } from "@/lib/database"
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
import { Trash2, Edit, Plus, ArrowUpDown, Globe, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Steps } from "@/components/ui/steps"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VendorManagementProps {
  showAddDialog?: boolean
  onCloseAddDialog?: () => void
}

const steps = [
  { id: "basic", title: "Basic Info", description: "Company details" },
  { id: "contacts", title: "Contacts", description: "Contact persons" },
  { id: "additional", title: "Additional", description: "Notes & settings" },
]

export function VendorManagement({ showAddDialog = false, onCloseAddDialog }: VendorManagementProps) {
  const { vendors, addVendor, updateVendor, deleteVendor } = useDatabase()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [sortField, setSortField] = useState<keyof Vendor>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    status: "active" as "active" | "inactive",
    category: "",
    notes: "",
    contacts: [] as VendorContact[],
  })

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    isMainContact: false,
  })

  // Get unique categories for filtering
  const categories = Array.from(new Set(vendors.map((v) => v.category).filter(Boolean) as string[]))

  const handleSort = (field: keyof Vendor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedVendors = [...vendors]
    .filter((vendor) => {
      const statusMatch = filterStatus === "all" || vendor.status === filterStatus
      const categoryMatch = filterCategory === "all" || vendor.category === filterCategory
      return statusMatch && categoryMatch
    })
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
      name: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      status: "active",
      category: "",
      notes: "",
      contacts: [],
    })
    setContactForm({
      name: "",
      email: "",
      phone: "",
      designation: "",
      department: "",
      isMainContact: false,
    })
    setCurrentStep(1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingVendor) {
      updateVendor(editingVendor.id, formData)
      setEditingVendor(null)
    } else {
      addVendor(formData)
      onCloseAddDialog?.()
    }

    resetForm()
  }

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      company: vendor.company,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website || "",
      address: vendor.address || "",
      status: vendor.status,
      category: vendor.category || "",
      notes: vendor.notes || "",
      contacts: vendor.contacts,
    })
    setEditingVendor(vendor)
    setCurrentStep(1)
  }

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
  }

  const addContact = () => {
    if (contactForm.name && contactForm.email) {
      const newContact: VendorContact = {
        id: Date.now().toString(),
        ...contactForm,
        lastContactedDate: new Date(),
      }

      // If this is marked as main contact, update other contacts
      if (newContact.isMainContact) {
        setFormData((prev) => ({
          ...prev,
          contacts: prev.contacts.map((c) => ({ ...c, isMainContact: false })),
        }))
      }

      setFormData((prev) => ({
        ...prev,
        contacts: [...prev.contacts, newContact],
      }))
      setContactForm({
        name: "",
        email: "",
        phone: "",
        designation: "",
        department: "",
        isMainContact: false,
      })
    }
  }

  const removeContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.company && formData.email && formData.phone
      case 2:
        return true // Contacts are optional
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Company address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Contact phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDesignation">Designation</Label>
                <Input
                  id="contactDesignation"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, designation: e.target.value }))}
                  placeholder="Job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDepartment">Department</Label>
                <Input
                  id="contactDepartment"
                  value={contactForm.department}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Department"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="isMainContact"
                  checked={contactForm.isMainContact}
                  onCheckedChange={(checked) =>
                    setContactForm((prev) => ({ ...prev, isMainContact: checked === true }))
                  }
                />
                <Label htmlFor="isMainContact">Main Contact</Label>
              </div>
              <div className="col-span-2">
                <Button type="button" onClick={addContact} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>

            {formData.contacts.length > 0 && (
              <div className="space-y-2">
                <Label>Added Contacts</Label>
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {formData.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{contact.name}</p>
                          {contact.isMainContact && (
                            <Badge className="ml-2" variant="default">
                              Main Contact
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.email} • {contact.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.designation}
                          {contact.department ? ` • ${contact.department}` : ""}
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeContact(contact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional information about this vendor"
                rows={4}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Company:</strong> {formData.company}
                </p>
                <p>
                  <strong>Contact:</strong> {formData.name}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.phone}
                </p>
                {formData.category && (
                  <p>
                    <strong>Category:</strong> {formData.category}
                  </p>
                )}
                <p>
                  <strong>Contacts Added:</strong> {formData.contacts.length}
                </p>
                <p>
                  <strong>Status:</strong> {formData.status}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">
                    <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <Button variant="ghost" onClick={() => handleSort("company")} className="h-auto p-0 font-semibold">
                      Company <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Phone</TableHead>
                  <TableHead className="min-w-[100px]">Website</TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button variant="ghost" onClick={() => handleSort("category")} className="h-auto p-0 font-semibold">
                      Category <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[100px]">Contacts</TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVendors.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewVendor(vendor)}
                  >
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.company}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>
                      {vendor.website ? (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{vendor.category ? <Badge variant="outline">{vendor.category}</Badge> : "-"}</TableCell>
                    <TableCell>{vendor.contacts.length} contacts</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === "active" ? "default" : "secondary"}>{vendor.status}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(vendor)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteVendor(vendor.id)
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

      {/* Add/Edit Vendor Dialog */}
      <Dialog
        open={showAddDialog || !!editingVendor}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAddDialog?.()
            setEditingVendor(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[600px] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {editingVendor ? "Update vendor information" : "Add a new vendor to your system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 pt-2">
              <Steps steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
            </div>

            <div className="flex-1 px-6 overflow-y-auto">{renderStepContent()}</div>

            <DialogFooter className="p-6 pt-4 border-t">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onCloseAddDialog?.()
                      setEditingVendor(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToNext()}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit">{editingVendor ? "Update Vendor" : "Add Vendor"}</Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Detail Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{selectedVendor?.company}</DialogTitle>
              <DialogDescription>
                <Badge variant={selectedVendor?.status === "active" ? "default" : "secondary"} className="mt-1">
                  {selectedVendor?.status}
                </Badge>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {selectedVendor && (
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts ({selectedVendor.contacts.length})</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Vendor Name</h3>
                      <p className="text-base">{selectedVendor.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                      <p className="text-base">{selectedVendor.company}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-base">{selectedVendor.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p className="text-base">{selectedVendor.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                      <p className="text-base">
                        {selectedVendor.website ? (
                          <a
                            href={selectedVendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {selectedVendor.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                      <p className="text-base">
                        {selectedVendor.category ? <Badge variant="outline">{selectedVendor.category}</Badge> : "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                      <p className="text-base">{selectedVendor.address || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                      <p className="text-base">{selectedVendor.createdAt.toLocaleDateString()}</p>
                    </div>
                    {selectedVendor.updatedAt && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                        <p className="text-base">{selectedVendor.updatedAt.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contacts">
                  <div className="space-y-4">
                    {selectedVendor.contacts.length > 0 ? (
                      selectedVendor.contacts.map((contact) => (
                        <Card key={contact.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium">{contact.name}</h3>
                                  {contact.isMainContact && (
                                    <Badge className="ml-2" variant="default">
                                      Main Contact
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {contact.email} • {contact.phone}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.designation}
                                  {contact.department ? ` • ${contact.department}` : ""}
                                </p>
                                {contact.lastContactedDate && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Last contacted: {contact.lastContactedDate.toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No contacts added</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <div className="p-4 bg-muted/30 rounded-lg min-h-[200px]">
                    {selectedVendor.notes ? (
                      <p className="whitespace-pre-wrap">{selectedVendor.notes}</p>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No notes available</p>
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
                  if (selectedVendor) {
                    handleEdit(selectedVendor)
                    setSelectedVendor(null)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Vendor
              </Button>
              <Button variant="default" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
