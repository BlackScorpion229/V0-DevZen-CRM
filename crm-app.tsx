"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useDatabase } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { VendorManagement } from "@/components/vendor-management"
import { ResourceManagement } from "@/components/resource-management"
import { JobRequirements } from "@/components/job-requirements"
import { ProcessFlowManagement } from "@/components/process-flow"
import { CalendarModule } from "@/components/calendar-module"
import { FileManagement } from "@/components/file-management"
import { Home, Users, UserCheck, Briefcase, GitBranch, Calendar, Search, User, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CRMApp() {
  const { isAuthenticated, user, logout } = useAuth()
  const { searchAll } = useDatabase()
  const [activeView, setActiveView] = useState("dashboard")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)

  // State for controlling dialogs
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [showProcessDialog, setShowProcessDialog] = useState(false)

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }

      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen])

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleNavigate = (view: string) => {
    setActiveView(view)
  }

  const handleAddVendor = () => {
    setActiveView("vendors")
    setShowVendorDialog(true)
  }

  const handleAddResource = () => {
    setActiveView("resources")
    setShowResourceDialog(true)
  }

  const handleAddJob = () => {
    setActiveView("jobs")
    setShowJobDialog(true)
  }

  const handleAddProcess = () => {
    setActiveView("process")
    setShowProcessDialog(true)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchAll(query)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Dashboard"
      case "vendors":
        return "Vendor Management"
      case "resources":
        return "Resource Management"
      case "jobs":
        return "Job Requirements"
      case "process":
        return "Process Flow"
      case "calendar":
        return "Calendar"
      case "files":
        return "File Management"
      default:
        return "Dashboard"
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />
      case "vendors":
        return <VendorManagement showAddDialog={showVendorDialog} onCloseAddDialog={() => setShowVendorDialog(false)} />
      case "resources":
        return (
          <ResourceManagement
            showAddDialog={showResourceDialog}
            onCloseAddDialog={() => setShowResourceDialog(false)}
          />
        )
      case "jobs":
        return <JobRequirements showAddDialog={showJobDialog} onCloseAddDialog={() => setShowJobDialog(false)} />
      case "process":
        return (
          <ProcessFlowManagement
            showAddDialog={showProcessDialog}
            onCloseAddDialog={() => setShowProcessDialog(false)}
          />
        )
      case "calendar":
        return <CalendarModule />
      case "files":
        return <FileManagement />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  const menuItems = [
    { title: "Dashboard", icon: Home, view: "dashboard" },
    { title: "Vendor Management", icon: Users, view: "vendors" },
    { title: "Resource Management", icon: UserCheck, view: "resources" },
    { title: "Job Requirements", icon: Briefcase, view: "jobs" },
    { title: "Process Flow", icon: GitBranch, view: "process" },
    { title: "Calendar", icon: Calendar, view: "calendar" },
    { title: "File Management", icon: FileText, view: "files" },
  ]

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-semibold hidden sm:inline">IT Staffing CRM</span>
          </div>

          {/* Navigation Icons */}
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {menuItems.map((item) => (
                <Tooltip key={item.view}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === item.view ? "secondary" : "ghost"}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => handleNavigate(item.view)}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{item.title}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <div
            className="relative w-full flex items-center h-9 rounded-md border border-input px-3 text-sm ring-offset-background cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Search anything... (Ctrl+K)</span>
          </div>
        </div>

        {/* Right side - Action Buttons and User */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {/* Search button for mobile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 md:hidden"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search (Ctrl+K)</TooltipContent>
              </Tooltip>

              {/* Add buttons */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddVendor}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 h-8 w-8 p-0"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Vendor</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddResource}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 transition-all duration-200 h-8 w-8 p-0"
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Resource</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddJob}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 transition-all duration-200 h-8 w-8 p-0"
                  >
                    <Briefcase className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Job Requirement</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAddProcess}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 transition-all duration-200 h-8 w-8 p-0"
                  >
                    <GitBranch className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Process Flow</TooltipContent>
              </Tooltip>

              {/* User menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 gap-2" onClick={logout}>
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto w-full bg-background">
        <div className="w-full max-w-none">
          <h1 className="text-2xl font-semibold mb-6">{getPageTitle()}</h1>
          {renderContent()}
        </div>
      </main>

      {/* Universal Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors, resources, jobs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            {searchResults ? (
              <>
                {searchResults.vendors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Vendors</h4>
                    {searchResults.vendors.map((vendor: any) => (
                      <div
                        key={vendor.id}
                        className="p-2 hover:bg-muted rounded cursor-pointer flex items-center"
                        onClick={() => {
                          setActiveView("vendors")
                          setSearchOpen(false)
                        }}
                      >
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.company}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.resources.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Resources</h4>
                    {searchResults.resources.map((resource: any) => (
                      <div
                        key={resource.id}
                        className="p-2 hover:bg-muted rounded cursor-pointer flex items-center"
                        onClick={() => {
                          setActiveView("resources")
                          setSearchOpen(false)
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground">{resource.techStack.join(", ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Job Requirements</h4>
                    {searchResults.jobs.map((job: any) => (
                      <div
                        key={job.id}
                        className="p-2 hover:bg-muted rounded cursor-pointer flex items-center"
                        onClick={() => {
                          setActiveView("jobs")
                          setSearchOpen(false)
                        }}
                      >
                        <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">{job.techStack.join(", ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.vendors.length === 0 &&
                  searchResults.resources.length === 0 &&
                  searchResults.jobs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No results found for "{searchQuery}"</div>
                  )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Type to search vendors, resources, and job requirements
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
