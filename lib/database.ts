import { create } from "zustand"
import { persist } from "zustand/middleware"

// Vendor Module
export interface Vendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  website?: string
  address?: string
  contacts: VendorContact[]
  status: "active" | "inactive"
  category?: string
  notes?: string
  createdAt: Date
  updatedAt?: Date
}

export interface VendorContact {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  department?: string
  isMainContact?: boolean
  lastContactedDate?: Date
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
  hourlyRate?: number
  location?: string
  remoteAvailability?: boolean
  startDate?: Date
  skills?: { name: string; level: "beginner" | "intermediate" | "expert" }[]
  certifications?: string[]
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
  updatedAt?: Date
}

// Job Requirement Module
export interface JobRequirement {
  id: string
  title: string
  description: string
  techStack: string[]
  experience: number
  location?: string
  remoteAvailable?: boolean
  budget?: number
  duration?: string
  priority: "low" | "medium" | "high"
  status: "open" | "in-progress" | "filled" | "cancelled"
  clientName?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  startDate?: Date
  endDate?: Date
  requirements?: string[]
  benefits?: string[]
  createdAt: Date
  updatedAt?: Date
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
  notes: string
  updatedAt: Date
  updatedBy?: string
}

// File Management Module
export interface FileCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt?: Date
}

export interface FileItem {
  id: string
  name: string
  originalFilename: string
  description?: string
  categoryId?: string
  size: number
  contentType: string
  pathname: string
  url: string
  entityType?: "vendor" | "resource" | "job" | "process" | "other"
  entityId?: string
  tags?: string[]
  uploadedBy: string
  uploadedAt: Date
  updatedAt?: Date
}

interface DatabaseState {
  vendors: Vendor[]
  resources: Resource[]
  jobRequirements: JobRequirement[]
  processFlows: ProcessFlow[]
  techStackSkills: string[]
  fileCategories: FileCategory[]
  files: FileItem[]
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
  addFileCategory: (category: Omit<FileCategory, "id" | "createdAt" | "updatedAt">) => void
  updateFileCategory: (id: string, category: Partial<FileCategory>) => void
  deleteFileCategory: (id: string) => void
  addFile: (file: Omit<FileItem, "id" | "updatedAt">) => void
  updateFile: (id: string, file: Partial<FileItem>) => void
  deleteFile: (id: string) => void
  getFilesByEntity: (entityType: FileItem["entityType"], entityId: string) => FileItem[]
  getFilesByCategory: (categoryId: string) => FileItem[]
  searchFiles: (query: string) => FileItem[]
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
          description: "Looking for a senior React developer with strong TypeScript skills",
          techStack: ["React", "TypeScript", "Node.js"],
          experience: 5,
          location: "San Francisco, CA",
          remoteAvailable: true,
          budget: 150000,
          duration: "6 months",
          priority: "high",
          status: "open",
          clientName: "TechCorp Inc.",
          contactPerson: "John Smith",
          contactEmail: "john@techcorp.com",
          contactPhone: "+1-555-0102",
          startDate: new Date("2024-02-15"),
          endDate: new Date("2024-08-15"),
          requirements: ["5+ years React experience", "TypeScript proficiency", "Team leadership"],
          benefits: ["Health insurance", "Remote work", "Flexible hours"],
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
      fileCategories: [
        {
          id: "1",
          name: "Vendor Documents",
          description: "Documents related to vendors",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          name: "Resource Resumes",
          description: "Resumes and CVs of resources",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "3",
          name: "Job Requirements",
          description: "Job descriptions and requirements",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "4",
          name: "Contracts",
          description: "Legal contracts and agreements",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "5",
          name: "Miscellaneous",
          description: "Other documents",
          createdAt: new Date("2024-01-15"),
        },
      ],
      files: [
        {
          id: "1",
          name: "TechCorp Agreement",
          originalFilename: "techcorp_agreement_2024.pdf",
          description: "Service agreement with TechCorp",
          categoryId: "1",
          size: 2500000,
          contentType: "application/pdf",
          pathname: "contracts/techcorp_agreement_2024.pdf",
          url: "https://example.com/files/techcorp_agreement_2024.pdf",
          entityType: "vendor",
          entityId: "1",
          tags: ["agreement", "contract", "2024"],
          uploadedBy: "admin",
          uploadedAt: new Date("2024-01-20"),
        },
        {
          id: "2",
          name: "Alice Cooper Resume",
          originalFilename: "alice_cooper_resume.pdf",
          categoryId: "2",
          size: 1500000,
          contentType: "application/pdf",
          pathname: "resumes/alice_cooper_resume.pdf",
          url: "https://example.com/files/alice_cooper_resume.pdf",
          entityType: "resource",
          entityId: "1",
          tags: ["resume", "developer"],
          uploadedBy: "admin",
          uploadedAt: new Date("2024-01-10"),
        },
        {
          id: "3",
          name: "Senior React Developer JD",
          originalFilename: "senior_react_developer_jd.docx",
          categoryId: "3",
          size: 500000,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          pathname: "jobs/senior_react_developer_jd.docx",
          url: "https://example.com/files/senior_react_developer_jd.docx",
          entityType: "job",
          entityId: "1",
          tags: ["job description", "react", "senior"],
          uploadedBy: "admin",
          uploadedAt: new Date("2024-01-18"),
        },
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

      addFileCategory: (category) =>
        set((state) => ({
          fileCategories: [
            ...state.fileCategories,
            { ...category, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() },
          ],
        })),

      updateFileCategory: (id, category) =>
        set((state) => ({
          fileCategories: state.fileCategories.map((c) =>
            c.id === id ? { ...c, ...category, updatedAt: new Date() } : c,
          ),
        })),

      deleteFileCategory: (id) =>
        set((state) => ({
          fileCategories: state.fileCategories.filter((c) => c.id !== id),
        })),

      addFile: (file) =>
        set((state) => ({
          files: [...state.files, { ...file, id: Date.now().toString(), updatedAt: new Date() }],
        })),

      updateFile: (id, file) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, ...file, updatedAt: new Date() } : f)),
        })),

      deleteFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        })),

      getFilesByEntity: (entityType, entityId) => {
        const state = get()
        return state.files.filter((file) => file.entityType === entityType && file.entityId === entityId)
      },

      getFilesByCategory: (categoryId) => {
        const state = get()
        return state.files.filter((file) => file.categoryId === categoryId)
      },

      searchFiles: (query) => {
        const state = get()
        const lowerQuery = query.toLowerCase()

        return state.files.filter(
          (file) =>
            file.name.toLowerCase().includes(lowerQuery) ||
            file.originalFilename.toLowerCase().includes(lowerQuery) ||
            (file.description && file.description.toLowerCase().includes(lowerQuery)) ||
            (file.tags && file.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))),
        )
      },

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
            (j.location && j.location.toLowerCase().includes(lowerQuery)),
        )

        return { vendors, resources, jobs }
      },
    }),
    {
      name: "crm-database",
    },
  ),
)
