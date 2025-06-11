"use client"

import { useState } from "react"
import { useDatabase } from "@/lib/database"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

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

export function CalendarModule() {
  const { processFlows, jobRequirements, resources } = useDatabase()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"week" | "month">("month")
  const [activeTab, setActiveTab] = useState<"upcoming" | "selected">("upcoming")

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  const getJobTitle = (jobId: string) => {
    const job = jobRequirements.find((j) => j.id === jobId)
    return job ? job.title : "Unknown Job"
  }

  const getResourceName = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    return resource ? resource.name : "Unknown Resource"
  }

  const getActivitiesForDate = (date: Date) => {
    return processFlows.filter((flow) => {
      if (!flow.scheduledDate) return false
      const flowDate = new Date(flow.scheduledDate)
      return flowDate.toDateString() === date.toDateString()
    })
  }

  const getUpcomingActivities = () => {
    const today = new Date()
    const fiveDaysFromNow = new Date()
    fiveDaysFromNow.setDate(today.getDate() + 5)

    return processFlows
      .filter((flow) => {
        if (!flow.scheduledDate) return false
        const flowDate = new Date(flow.scheduledDate)
        return flowDate >= today && flowDate <= fiveDaysFromNow
      })
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
      .slice(0, 10)
  }

  const getSelectedDateActivities = () => {
    return getActivitiesForDate(selectedDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const upcomingActivities = getUpcomingActivities()
  const selectedDateActivities = getSelectedDateActivities()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setActiveTab("selected")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    onClick={() => setViewMode("week")}
                    className="backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70"
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    onClick={() => setViewMode("month")}
                    className="backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70"
                  >
                    Month
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h2>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70 rounded-full w-8 h-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70 rounded-full w-8 h-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-16"></div>
                    }

                    const activities = getActivitiesForDate(day)
                    const hasActivities = activities.length > 0

                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-2 h-16 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border ${
                          isToday(day)
                            ? "bg-gradient-to-br from-blue-400/30 to-blue-600/30 border-blue-400/50 shadow-lg scale-105"
                            : isSelected(day)
                              ? "bg-gradient-to-br from-purple-400/30 to-purple-600/30 border-purple-400/50 shadow-lg"
                              : "bg-white/30 border-white/20 hover:bg-white/50 hover:shadow-md hover:scale-105"
                        }`}
                        onClick={() => handleDateSelect(day)}
                      >
                        <div
                          className={`text-sm font-medium text-center ${
                            isToday(day) ? "text-blue-800" : isSelected(day) ? "text-purple-800" : "text-gray-700"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        {hasActivities && (
                          <div className="mt-1 space-y-1">
                            {activities.slice(0, 1).map((activity, idx) => {
                              const statusInfo = getStatusInfo(activity.status)
                              return (
                                <div
                                  key={idx}
                                  className={`text-xs px-1 py-0.5 rounded-md text-white truncate backdrop-blur-sm ${statusInfo.color}/80`}
                                >
                                  {getResourceName(activity.resourceId).split(" ")[0]}
                                </div>
                              )
                            })}
                            {activities.length > 1 && (
                              <div className="text-xs text-gray-600 font-medium">+{activities.length - 1}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activities Section with Switch */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 h-full">
              {/* Tab Switch */}
              <div className="mb-6">
                <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-1 flex">
                  <Button
                    variant={activeTab === "upcoming" ? "default" : "ghost"}
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex-1 rounded-lg transition-all duration-200 ${
                      activeTab === "upcoming"
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                    Upcoming Activities
                  </Button>
                  <Button
                    variant={activeTab === "selected" ? "default" : "ghost"}
                    onClick={() => setActiveTab("selected")}
                    className={`flex-1 rounded-lg transition-all duration-200 ${
                      activeTab === "selected"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    Activities
                  </Button>
                </div>
              </div>

              {/* Content based on active tab */}
              <div className="space-y-4">
                {activeTab === "upcoming" && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Upcoming Activities
                      </h3>
                      <p className="text-sm text-muted-foreground">Next 5 days activities</p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100%-120px)]">
                      {upcomingActivities.map((activity) => {
                        const statusInfo = getStatusInfo(activity.status)
                        return (
                          <div
                            key={activity.id}
                            className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl p-4 hover:bg-white/70 transition-all duration-200 hover:shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full ${statusInfo.color} mt-1 shadow-sm`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{getJobTitle(activity.jobId)}</p>
                                <p className="text-sm text-gray-600">{getResourceName(activity.resourceId)}</p>
                                <Badge className={`text-white text-xs mt-1 ${statusInfo.color} shadow-sm`}>
                                  {statusInfo.label}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {activity.scheduledDate?.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {upcomingActivities.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No upcoming activities</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "selected" && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        Activities
                      </h3>
                      <p className="text-sm text-muted-foreground">Activities for selected date</p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100%-120px)]">
                      {selectedDateActivities.map((activity) => {
                        const statusInfo = getStatusInfo(activity.status)
                        return (
                          <div
                            key={activity.id}
                            className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl p-4 hover:bg-white/70 transition-all duration-200 hover:shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full ${statusInfo.color} mt-1 shadow-sm`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{getJobTitle(activity.jobId)}</p>
                                <p className="text-sm text-gray-600">{getResourceName(activity.resourceId)}</p>
                                <Badge className={`text-white text-xs mt-1 ${statusInfo.color} shadow-sm`}>
                                  {statusInfo.label}
                                </Badge>
                                {activity.notes && (
                                  <p className="text-xs text-gray-500 mt-2 bg-white/50 rounded-lg p-2 border border-white/30">
                                    {activity.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {selectedDateActivities.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No activities for this date</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
