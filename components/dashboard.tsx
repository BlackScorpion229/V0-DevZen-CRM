"use client"

import type React from "react"

import { useDatabase } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import {
  Briefcase,
  Users,
  UserCheck,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  FileText,
  Building,
  Star,
} from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: "blue" | "green" | "yellow" | "red" | "purple" | "gray"
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

function StatCard({ title, value, icon, color, trend, onClick }: StatCardProps) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-800",
    green: "bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800",
    yellow: "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
    red: "bg-gradient-to-br from-red-100 to-red-200 border-red-300 text-red-800",
    purple: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-800",
    gray: "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-800",
  }

  const iconBgClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  }

  return (
    <Card
      className={`${colorClasses[color]} border-2 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {trend.value}% {trend.isPositive ? "increase" : "decrease"}
                </span>
              </div>
            )}
          </div>
          <div className={`${iconBgClasses[color]} p-3 rounded-xl text-white shadow-lg`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardProps {
  onNavigate?: (view: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { jobRequirements, vendors, resources, processFlows } = useDatabase()

  // Job Requirements Statistics
  const jobStats = {
    total: jobRequirements.length,
    active: jobRequirements.filter((j) => j.status === "active").length,
    closed: jobRequirements.filter((j) => j.status === "closed").length,
    inactive: jobRequirements.filter((j) => j.status === "inactive").length,
    onhold: jobRequirements.filter((j) => j.status === "onhold").length,
    highPriority: jobRequirements.filter((j) => j.priority === "high" || j.priority === "urgent").length,
  }

  // Vendor Statistics
  const vendorStats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    inactive: vendors.filter((v) => v.status === "inactive").length,
    withMultipleContacts: vendors.filter((v) => v.contacts.length > 1).length,
  }

  // Resource Statistics
  const resourceStats = {
    total: resources.length,
    available: resources.filter((r) => r.status === "available").length,
    busy: resources.filter((r) => r.status === "busy").length,
    inactive: resources.filter((r) => r.status === "inactive").length,
    inhouse: resources.filter((r) => r.type === "InHouse").length,
    external: resources.filter((r) => r.type.startsWith("External")).length,
    withResume: resources.filter((r) => r.resumeFile || r.resumeMetadata).length,
  }

  // Process Flow Statistics
  const processStats = {
    total: processFlows.length,
    active: processFlows.filter((p) => !["cleared", "rejected"].includes(p.status)).length,
    cleared: processFlows.filter((p) => p.status === "cleared").length,
    rejected: processFlows.filter((p) => p.status === "rejected").length,
    scheduled: processFlows.filter((p) => p.scheduledDate && new Date(p.scheduledDate) > new Date()).length,
  }

  // Calculate trends (mock data for demonstration)
  const getRandomTrend = () => ({
    value: Math.floor(Math.random() * 20) + 1,
    isPositive: Math.random() > 0.5,
  })

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Job Requirements Status */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          Job Requirements Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requirements"
            value={jobStats.total}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("jobs")}
          />
          <StatCard
            title="Active Jobs"
            value={jobStats.active}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("jobs")}
          />
          <StatCard
            title="High Priority"
            value={jobStats.highPriority}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="yellow"
            onClick={() => onNavigate?.("jobs")}
          />
          <StatCard
            title="On Hold"
            value={jobStats.onhold}
            icon={<Clock className="h-6 w-6" />}
            color="red"
            onClick={() => onNavigate?.("jobs")}
          />
        </div>
      </div>

      {/* Vendor Status */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Building className="h-6 w-6 text-green-600" />
          Vendor Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Vendors"
            value={vendorStats.total}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("vendors")}
          />
          <StatCard
            title="Active Vendors"
            value={vendorStats.active}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("vendors")}
          />
          <StatCard
            title="Multi-Contact"
            value={vendorStats.withMultipleContacts}
            icon={<Star className="h-6 w-6" />}
            color="purple"
            onClick={() => onNavigate?.("vendors")}
          />
          <StatCard
            title="Inactive"
            value={vendorStats.inactive}
            icon={<XCircle className="h-6 w-6" />}
            color="gray"
            onClick={() => onNavigate?.("vendors")}
          />
        </div>
      </div>

      {/* Resource Operations */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-purple-600" />
          Resource Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Available Resources"
            value={resourceStats.available}
            icon={<UserCheck className="h-6 w-6" />}
            color="green"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("resources")}
          />
          <StatCard
            title="Currently Busy"
            value={resourceStats.busy}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            onClick={() => onNavigate?.("resources")}
          />
          <StatCard
            title="In-House Team"
            value={resourceStats.inhouse}
            icon={<Building className="h-6 w-6" />}
            color="blue"
            onClick={() => onNavigate?.("resources")}
          />
          <StatCard
            title="With Resume"
            value={resourceStats.withResume}
            icon={<FileText className="h-6 w-6" />}
            color="purple"
            onClick={() => onNavigate?.("resources")}
          />
        </div>
      </div>

      {/* Process Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-orange-600" />
          Process Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Processes"
            value={processStats.active}
            icon={<GitBranch className="h-6 w-6" />}
            color="blue"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("process")}
          />
          <StatCard
            title="Successfully Cleared"
            value={processStats.cleared}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            trend={getRandomTrend()}
            onClick={() => onNavigate?.("process")}
          />
          <StatCard
            title="Scheduled Today"
            value={processStats.scheduled}
            icon={<Calendar className="h-6 w-6" />}
            color="yellow"
            onClick={() => onNavigate?.("process")}
          />
          <StatCard
            title="Rejected"
            value={processStats.rejected}
            icon={<XCircle className="h-6 w-6" />}
            color="red"
            onClick={() => onNavigate?.("process")}
          />
        </div>
      </div>
    </div>
  )
}
