import type {
  ProOrder,
  ProInvoice,
  ProBillingMonth,
  ProZipArea,
  ProPerformance,
  ProProfile,
  ProStatus,
  DamageType,
} from "@/lib/types/pro"

// Mock Orders
export const mockOrders: ProOrder[] = [
  {
    id: "SP-2024-001",
    damageType: "KFZ",
    customerName: "Max Mustermann",
    customerPhone: "+49 151 12345678",
    customerEmail: "max@example.com",
    customerAddress: "Musterstraße 12",
    zip: "41061",
    city: "Mönchengladbach",
    createdAt: "2024-11-20T10:30:00Z",
    scheduledAt: "2024-11-21T14:00:00Z",
    status: "IN_PROGRESS",
    description: "Kratzer an der Fahrertür nach Parkrempler. Lackschaden ca. 30cm.",
    photos: ["/placeholder-photo-1.jpg"],
    internalNotes: [
      {
        id: "note-1",
        content: "Kunde wünscht Termin am Nachmittag",
        createdAt: "2024-11-20T11:00:00Z",
        createdBy: "Handwerker",
      },
    ],
  },
  {
    id: "SP-2024-002",
    damageType: "WASSER",
    customerName: "Anna Schmidt",
    customerPhone: "+49 151 87654321",
    customerEmail: "anna@example.com",
    customerAddress: "Beispielweg 5",
    zip: "41063",
    city: "Mönchengladbach",
    createdAt: "2024-11-20T08:15:00Z",
    status: "NEW",
    description: "Wasserrohrbruch im Badezimmer. Wasser läuft aus.",
    photos: ["/placeholder-photo-2.jpg", "/placeholder-photo-3.jpg"],
  },
  {
    id: "SP-2024-003",
    damageType: "GLAS",
    customerName: "Peter Weber",
    customerPhone: "+49 151 11223344",
    zip: "41065",
    city: "Mönchengladbach",
    createdAt: "2024-11-19T16:45:00Z",
    status: "DONE",
    description: "Fensterscheibe im Wohnzimmer gesprungen.",
    invoiceId: "INV-001",
  },
  {
    id: "SP-2024-004",
    damageType: "FEUER",
    customerName: "Lisa Müller",
    customerPhone: "+49 151 55667788",
    zip: "41067",
    city: "Mönchengladbach",
    createdAt: "2024-11-19T12:20:00Z",
    status: "IN_PROGRESS",
    description: "Kleiner Küchenbrand, Rauchschaden an Wand und Decke.",
  },
  {
    id: "SP-2024-005",
    damageType: "GEBAEUDE",
    customerName: "Thomas Klein",
    customerPhone: "+49 151 99887766",
    zip: "41069",
    city: "Mönchengladbach",
    createdAt: "2024-11-18T14:00:00Z",
    status: "DONE",
    description: "Dachschaden nach Sturm, mehrere Ziegel fehlen.",
    invoiceId: "INV-002",
  },
]

// Mock Invoices
export const mockInvoices: ProInvoice[] = [
  {
    id: "INV-001",
    orderId: "SP-2024-003",
    customerName: "Peter Weber",
    customerAddress: "Beispielstraße 8, 41065 Mönchengladbach",
    netAmount: 450.0,
    vatRate: 19,
    grossAmount: 535.5,
    dueDate: "2024-12-03",
    createdAt: "2024-11-19T17:00:00Z",
    status: "SENT",
  },
  {
    id: "INV-002",
    orderId: "SP-2024-005",
    customerName: "Thomas Klein",
    customerAddress: "Musterweg 15, 41069 Mönchengladbach",
    netAmount: 1200.0,
    vatRate: 19,
    grossAmount: 1428.0,
    dueDate: "2024-12-04",
    createdAt: "2024-11-18T15:30:00Z",
    status: "PAID",
  },
]

// Mock Billing Months
export const mockBillingMonths: ProBillingMonth[] = [
  {
    month: "2024-11",
    totalRevenue: 8500.0,
    serviceFee: 850.0,
    status: "OPEN",
  },
  {
    month: "2024-10",
    totalRevenue: 12400.0,
    serviceFee: 1240.0,
    status: "SCHEDULED",
  },
  {
    month: "2024-09",
    totalRevenue: 9800.0,
    serviceFee: 980.0,
    status: "PAID",
    paidAt: "2024-10-05T00:00:00Z",
  },
]

// Mock ZIP Areas
export const mockZipAreas: ProZipArea[] = [
  {
    id: "zip-1",
    zipRange: "41061-41063",
    active: true,
    load: "GREEN",
  },
  {
    id: "zip-2",
    zipRange: "41064-41066",
    active: true,
    load: "ORANGE",
  },
  {
    id: "zip-3",
    zipRange: "41067-41069",
    active: false,
    load: "RED",
  },
]

// Mock Performance
export const mockPerformance: ProPerformance = {
  averageRating: 4.7,
  averageResponseTime: 74, // minutes
  completionRate: 94,
  reviews: [
    {
      id: "rev-1",
      orderId: "SP-2024-003",
      rating: 5,
      comment: "Sehr schnelle und professionelle Arbeit!",
      createdAt: "2024-11-19T18:00:00Z",
    },
    {
      id: "rev-2",
      orderId: "SP-2024-005",
      rating: 4,
      comment: "Gute Qualität, Termin wurde eingehalten.",
      createdAt: "2024-11-18T16:00:00Z",
    },
  ],
}

// Mock Profile
export const mockProfile: ProProfile = {
  id: "pro-1",
  role: "HANDWERKER",
  companyName: "Mustermann Handwerksbetrieb GmbH",
  contactPerson: "Hans Mustermann",
  email: "hans@mustermann-handwerk.de",
  phone: "+49 2161 123456",
  address: "Handwerkerstraße 42",
  zip: "41061",
  city: "Mönchengladbach",
  iban: "DE89 3704 0044 0532 0130 00",
  accountHolder: "Mustermann Handwerksbetrieb GmbH",
  sepaMandate: true,
  documents: {
    businessLicense: {
      url: "/documents/business-license.pdf",
      status: "APPROVED",
    },
    insurance: {
      url: "/documents/insurance.pdf",
      status: "APPROVED",
    },
  },
  notifications: {
    emailNewOrders: true,
    emailOrderChanges: true,
  },
}

// Helper functions
export function getOrderById(id: string): ProOrder | undefined {
  return mockOrders.find((order) => order.id === id)
}

export function getOrdersByStatus(status: ProStatus): ProOrder[] {
  return mockOrders.filter((order) => order.status === status)
}

export function getOrdersByType(type: DamageType): ProOrder[] {
  return mockOrders.filter((order) => order.damageType === type)
}

export function getInvoiceByOrderId(orderId: string): ProInvoice | undefined {
  return mockInvoices.find((invoice) => invoice.orderId === orderId)
}

