"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useDatabase } from "@/lib/database"
import { Calendar, Home, Users, UserCheck, Briefcase, GitBranch, Search, LogOut, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { searchAll } = useDatabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)

  const menuItems = [
    { title: "Dashboard", icon: Home, view: "dashboard" },
    { title: "Vendor Management", icon: Users, view: "vendors" },
    { title: "Resource Management", icon: UserCheck, view: "resources" },
    { title: "Job Requirements", icon: Briefcase, view: "jobs" },
    { title: "Process Flow", icon: GitBranch, view: "process" },
    { title: "Calendar", icon: Calendar, view: "calendar" },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchAll(query)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-6 w-6" />
          <span className="font-semibold">IT Staffing CRM</span>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Universal search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {searchResults && (
          <Card className="mt-2 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {searchResults.vendors.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium mb-1">Vendors</h4>
                  {searchResults.vendors.map((vendor: any) => (
                    <div key={vendor.id} className="text-xs p-1 hover:bg-muted rounded cursor-pointer">
                      {vendor.name} - {vendor.company}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.resources.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium mb-1">Resources</h4>
                  {searchResults.resources.map((resource: any) => (
                    <div key={resource.id} className="text-xs p-1 hover:bg-muted rounded cursor-pointer">
                      {resource.name} - {resource.techStack.join(", ")}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.jobs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Job Requirements</h4>
                  {searchResults.jobs.map((job: any) => (
                    <div key={job.id} className="text-xs p-1 hover:bg-muted rounded cursor-pointer">
                      {job.title} - {job.techStack.join(", ")}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.vendors.length === 0 &&
                searchResults.resources.length === 0 &&
                searchResults.jobs.length === 0 && (
                  <div className="text-xs text-muted-foreground">No results found</div>
                )}
            </CardContent>
          </Card>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton onClick={() => onViewChange(item.view)} isActive={activeView === item.view}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4" />
          <span className="text-sm">
            {user?.username} ({user?.role})
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
