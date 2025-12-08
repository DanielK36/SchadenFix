export type ProRole = "HANDWERKER" | "WERKSTATT" | "GUTACHTER" | "ANWALT"

export type ProStatus = "NEW" | "IN_PROGRESS" | "DONE" | "CANCELLED"

export type DamageType = "KFZ" | "GLAS" | "WASSER" | "FEUER" | "GEBAEUDE" | "RECHTSFALL"

export type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE"

export interface ProOrder {
  id: string
  damageType: DamageType
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  zip: string
  city: string
  createdAt: string
  scheduledAt?: string
  status: ProStatus
  description: string
  photos?: string[]
  internalNotes?: ProNote[]
  invoiceId?: string
}

export interface ProNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
}

export interface ProInvoice {
  id: string
  orderId: string
  customerName: string
  customerAddress: string
  netAmount: number
  vatRate: number
  grossAmount: number
  dueDate: string
  createdAt: string
  status: "DRAFT" | "SENT" | "PAID"
}

export interface ProBillingMonth {
  month: string // YYYY-MM
  totalRevenue: number
  serviceFee: number // 10% of revenue
  status: "OPEN" | "SCHEDULED" | "PAID"
  paidAt?: string
}

export interface ProZipArea {
  id: string
  zipRange: string // e.g. "41061-41069"
  active: boolean
  load: "GREEN" | "ORANGE" | "RED"
}

export interface ProPerformance {
  averageRating: number // 1-5
  averageResponseTime: number // minutes
  completionRate: number // percentage
  reviews: ProReview[]
}

export interface ProReview {
  id: string
  orderId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface ProProfile {
  id: string
  role: ProRole
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  zip: string
  city: string
  iban?: string
  accountHolder?: string
  sepaMandate?: boolean
  documents?: {
    businessLicense?: { url: string; status: "PENDING" | "APPROVED" }
    insurance?: { url: string; status: "PENDING" | "APPROVED" }
  }
  notifications: {
    emailNewOrders: boolean
    emailOrderChanges: boolean
  }
}

