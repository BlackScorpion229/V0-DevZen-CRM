"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { VendorManagement } from "@/components/vendor-management"
import { ResourceManagement } from "@/components/resource-management"
import { JobRequirements } from "@/components/job-requirements"
import { ProcessFlowManagement } from "@/components/process-flow"
import { CalendarModule } from "@/components/calendar-module"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Briefcase, GitBranch } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function CRMApp() {
  const { isAuthenticated } = useAuth()
  const [activeView, setActiveView] = useState("dashboard")

  // State for controlling dialogs
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [showProcessDialog, setShowProcessDialog] = useState(false)

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
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset className="flex flex-col min-h-screen w-full">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
          {/* Left side - Toggle and Title */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <SidebarTrigger className="h-7 w-7" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-semibold truncate">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <TooltipProvider>
            <div className="flex items-center gap-2 shrink-0">
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
            </div>
          </TooltipProvider>
        </header>

        <main className="flex-1 p-6 overflow-auto w-full bg-background">
          <div className="w-full max-w-none">{renderContent()}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
