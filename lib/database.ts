import { create } from "zustand"
import { persist } from "zustand/middleware"

// Vendor Module
export interface Vendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  website?: string // New field
  address?: string // New field
  contacts: VendorContact[]
  status: "active" | "inactive"
  category?: string // New field: categorize vendors
  notes?: string // New field
  createdAt: Date
  updatedAt?: Date // New field
}

export interface VendorContact {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  department?: string // New field
  isMainContact?: boolean // New field
  lastContactedDate?: Date // New field
}

// Resource Module
export interface Resource {
  id: string
  name: string
  email: string
  phone: string
  techStack: string[]
  experience: number
  type: "InHouse" | "InHouse-Friends" | "External-LinkedIn" | "External-Email"
  status: "available" | "busy" | "inactive"
  hourlyRate?: number // New field
  location?: string // New field
  remoteAvailability?: boolean // New field
  startDate?: Date // New field: when they joined/became available
  skills?: { name: string; level: "beginner" | "intermediate" | "expert" }[] // New field: detailed skills
  certifications?: string[] // New field
  resumeFile?: string
  resumeMetadata?: {
    url: string
    pathname: string
    contentType: string
    size: number
    uploadedAt: Date
    filename: string
  }
  createdAt: Date
  updatedAt?: Date // New field
}

// Job Requirement Module
export interface JobRequirement {
  id: string
  title: string
  vendorId: string
  contactId: string
  techStack: string[]
  experience: string
  description: string
  status: "active" | "inactive" | "closed" | "onhold"
  priority?: "low" | "medium" | "high" | "urgent" // New field
  jobType?: "full-time" | "contract" | "part-time" // New field
  remoteOption?: boolean // New field
  location?: string // New field
  salary?: { min: number; max: number; currency: string } // New field
  startDate?: Date // New field
  endDate?: Date // New field for contract positions
  assignedResources: string[]
  createdAt: Date
  updatedAt?: Date // New field
}

// Process Flow Module
export interface ProcessFlow {
  id: string
  jobId: string
  resourceId: string
  status:
    | "resume-submitted"
    | "screening-scheduled"
    | "screening-cleared"
    | "client-screening-scheduled"
    | "client-screening-cleared"
    | "final-interview-scheduled"
    | "cleared"
    | "rejected"
  scheduledDate?: Date
  completedDate?: Date // New field
  interviewers?: string[] // New field
  feedbackScore?: number // New field: 1-5 rating
  feedbackNotes?: string // New field
  nextSteps?: string // New field
  notes: string
  updatedAt: Date
  updatedBy?: string // New field
}

interface DatabaseState {
  vendors: Vendor[]
  resources: Resource[]
  jobRequirements: JobRequirement[]
  processFlows: ProcessFlow[]
  techStackSkills: string[]
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => void
  updateVendor: (id: string, vendor: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
  addResource: (resource: Omit<Resource, "id" | "createdAt" | "updatedAt">) => void
  updateResource: (id: string, resource: Partial<Resource>) => void
  deleteResource: (id: string) => void
  addJobRequirement: (job: Omit<JobRequirement, "id" | "createdAt" | "updatedAt">) => void
  updateJobRequirement: (id: string, job: Partial<JobRequirement>) => void
  deleteJobRequirement: (id: string) => void
  addProcessFlow: (flow: Omit<ProcessFlow, "id" | "updatedAt">) => void
  updateProcessFlow: (id: string, flow: Partial<ProcessFlow>) => void
  deleteProcessFlow: (id: string) => void
  addTechStackSkill: (skill: string) => void
  searchAll: (query: string) => { vendors: Vendor[]; resources: Resource[]; jobs: JobRequirement[] }
}

export const useDatabase = create<DatabaseState>()(
  persist(
    (set, get) => ({
      vendors: [
        {
          id: "1",
          name: "TechCorp Solutions",
          company: "TechCorp Inc.",
          email: "contact@techcorp.com",
          phone: "+1-555-0101",
          website: "https://techcorp.example.com",
          address: "123 Tech Street, San Francisco, CA",
          contacts: [
            {
              id: "1",
              name: "John Smith",
              email: "john@techcorp.com",
              phone: "+1-555-0102",
              designation: "HR Manager",
              department: "Human Resources",
              isMainContact: true,
            },
            {
              id: "2",
              name: "Sarah Johnson",
              email: "sarah@techcorp.com",
              phone: "+1-555-0103",
              designation: "Technical Lead",
              department: "Engineering",
              isMainContact: false,
            },
          ],
          status: "active",
          category: "Technology",
          notes: "Premium vendor with excellent track record",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date(),
        },
      ],
      resources: [
        {
          id: "1",
          name: "Alice Cooper",
          email: "alice@company.com",
          phone: "+1-555-0201",
          techStack: ["React", "Node.js", "TypeScript"],
          experience: 5,
          type: "InHouse",
          status: "available",
          hourlyRate: 75,
          location: "New York, NY",
          remoteAvailability: true,
          startDate: new Date("2023-06-15"),
          skills: [
            { name: "React", level: "expert" },
            { name: "Node.js", level: "intermediate" },
            { name: "TypeScript", level: "expert" },
          ],
          certifications: ["AWS Certified Developer", "MongoDB Certified Developer"],
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date(),
        },
      ],
      jobRequirements: [
        {
          id: "1",
          title: "Senior React Developer",
          vendorId: "1",
          contactId: "1",
          techStack: ["React", "TypeScript", "Node.js"],
          experience: "5+ years",
          description: "Looking for a senior React developer with strong TypeScript skills",
          status: "active",
          priority: "high",
          jobType: "contract",
          remoteOption: true,
          location: "San Francisco, CA (Remote)",
          salary: { min: 120000, max: 150000, currency: "USD" },
          startDate: new Date("2024-02-15"),
          endDate: new Date("2024-08-15"),
          assignedResources: ["1"],
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date(),
        },
      ],
      processFlows: [
        {
          id: "1",
          jobId: "1",
          resourceId: "1",
          status: "resume-submitted",
          scheduledDate: new Date("2024-01-25"),
          completedDate: new Date("2024-01-22"),
          interviewers: ["John Smith", "Technical Team Lead"],
          feedbackScore: 4,
          feedbackNotes: "Strong technical skills, good communication",
          nextSteps: "Schedule technical screening",
          notes: "Resume submitted to client",
          updatedAt: new Date("2024-01-22"),
          updatedBy: "admin",
        },
      ],
      techStackSkills: [
        "React",
        "Angular",
        "Vue.js",
        "Node.js",
        "Python",
        "Java",
        "C#",
        ".NET",
        "TypeScript",
        "JavaScript",
        "PHP",
        "Ruby",
        "Go",
        "Rust",
        "Swift",
        "Kotlin",
      ],

      addVendor: (vendor) =>
        set((state) => ({
          vendors: [
            ...state.vendors,
            { ...vendor, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() },
          ],
        })),

      updateVendor: (id, vendor) =>
        set((state) => ({
          vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...vendor, updatedAt: new Date() } : v)),
        })),

      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((v) => v.id !== id),
        })),

      addResource: (resource) =>
        set((state) => ({
          resources: [
            ...state.resources,
            { ...resource, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() },
          ],
        })),

      updateResource: (id, resource) =>
        set((state) => ({
          resources: state.resources.map((r) => (r.id === id ? { ...r, ...resource, updatedAt: new Date() } : r)),
        })),

      deleteResource: (id) =>
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        })),

      addJobRequirement: (job) =>
        set((state) => ({
          jobRequirements: [
            ...state.jobRequirements,
            { ...job, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() },
          ],
        })),

      updateJobRequirement: (id, job) =>
        set((state) => ({
          jobRequirements: state.jobRequirements.map((j) =>
            j.id === id ? { ...j, ...job, updatedAt: new Date() } : j,
          ),
        })),

      deleteJobRequirement: (id) =>
        set((state) => ({
          jobRequirements: state.jobRequirements.filter((j) => j.id !== id),
        })),

      addProcessFlow: (flow) =>
        set((state) => ({
          processFlows: [...state.processFlows, { ...flow, id: Date.now().toString(), updatedAt: new Date() }],
        })),

      updateProcessFlow: (id, flow) =>
        set((state) => ({
          processFlows: state.processFlows.map((f) => (f.id === id ? { ...f, ...flow, updatedAt: new Date() } : f)),
        })),

      deleteProcessFlow: (id) =>
        set((state) => ({
          processFlows: state.processFlows.filter((f) => f.id !== id),
        })),

      addTechStackSkill: (skill) =>
        set((state) => ({
          techStackSkills: [...new Set([...state.techStackSkills, skill])],
        })),

      searchAll: (query) => {
        const state = get()
        const lowerQuery = query.toLowerCase()

        const vendors = state.vendors.filter(
          (v) =>
            v.name.toLowerCase().includes(lowerQuery) ||
            v.company.toLowerCase().includes(lowerQuery) ||
            v.email.toLowerCase().includes(lowerQuery) ||
            (v.website && v.website.toLowerCase().includes(lowerQuery)) ||
            (v.category && v.category.toLowerCase().includes(lowerQuery)),
        )

        const resources = state.resources.filter(
          (r) =>
            r.name.toLowerCase().includes(lowerQuery) ||
            r.email.toLowerCase().includes(lowerQuery) ||
            r.techStack.some((tech) => tech.toLowerCase().includes(lowerQuery)) ||
            (r.location && r.location.toLowerCase().includes(lowerQuery)) ||
            (r.certifications && r.certifications.some((cert) => cert.toLowerCase().includes(lowerQuery))),
        )

        const jobs = state.jobRequirements.filter(
          (j) =>
            j.title.toLowerCase().includes(lowerQuery) ||
            j.description.toLowerCase().includes(lowerQuery) ||
            j.techStack.some((tech) => tech.toLowerCase().includes(lowerQuery)) ||
            (j.location && j.location.toLowerCase().includes(lowerQuery)) ||
            (j.jobType && j.jobType.toLowerCase().includes(lowerQuery)),
        )

        return { vendors, resources, jobs }
      },
    }),
    {
      name: "crm-database",
    },
  ),
)
