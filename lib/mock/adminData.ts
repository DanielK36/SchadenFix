// Mock data for Admin Dashboard

export interface MockAdminOrder {
  id: string
  type: string
  status: string
  created_at: string
  customer_data: {
    name: string
    email: string
    phone: string
    address: string
    zip: string
    city: string
  }
  description: string
  assigned_to?: string | null
  company_id: string
}

export interface MockAdminPartner {
  id: string
  email: string
  company_name: string
  is_verified: boolean
  created_at: string
  profession?: string
}

export interface MockAdminInvoice {
  id: string
  order_id: string
  gross_amount: string
  status: string
  created_at: string
}

export interface MockRoutingRule {
  id: string
  zip_prefix: string
  profession: string
  preferred_assignee_id: string | null
  assignee_type: 'partner' | 'handwerker' | null
  priority: number
  active: boolean
  created_at: string
}

export const mockAdminOrders: MockAdminOrder[] = [
  {
    id: "order-1",
    type: "wasser",
    status: "neu",
    created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
    customer_data: {
      name: "Max Mustermann",
      email: "max@example.com",
      phone: "+49 151 12345678",
      address: "Musterstraße 12",
      zip: "41061",
      city: "Mönchengladbach",
    },
    description: "Wasserrohrbruch im Badezimmer",
    assigned_to: null,
    company_id: "company-1",
  },
  {
    id: "order-2",
    type: "feuer",
    status: "neu",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    customer_data: {
      name: "Anna Schmidt",
      email: "anna@example.com",
      phone: "+49 151 87654321",
      address: "Beispielweg 5",
      zip: "41063",
      city: "Mönchengladbach",
    },
    description: "Kleiner Küchenbrand, Rauchschaden",
    assigned_to: null,
    company_id: "company-1",
  },
  {
    id: "order-3",
    type: "kfz",
    status: "angebot",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    customer_data: {
      name: "Peter Weber",
      email: "peter@example.com",
      phone: "+49 151 11223344",
      address: "Teststraße 8",
      zip: "41065",
      city: "Mönchengladbach",
    },
    description: "Kratzer an der Fahrertür",
    assigned_to: "partner-1",
    company_id: "company-1",
  },
  {
    id: "order-4",
    type: "glas",
    status: "abgeschlossen",
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    customer_data: {
      name: "Lisa Müller",
      email: "lisa@example.com",
      phone: "+49 151 55667788",
      address: "Hauptstraße 20",
      zip: "41067",
      city: "Mönchengladbach",
    },
    description: "Fensterscheibe gesprungen",
    assigned_to: "partner-2",
    company_id: "company-1",
  },
  {
    id: "order-5",
    type: "wasser",
    status: "neu",
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    customer_data: {
      name: "Tom Becker",
      email: "tom@example.com",
      phone: "+49 151 99887766",
      address: "Nebenstraße 3",
      zip: "41069",
      city: "Mönchengladbach",
    },
    description: "Feuchtigkeitsschaden an Wand",
    assigned_to: null,
    company_id: "company-1",
  },
]

export const mockAdminPartners: MockAdminPartner[] = [
  {
    id: "partner-1",
    email: "partner1@example.com",
    company_name: "Malerbetrieb Müller",
    is_verified: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    profession: "maler",
  },
  {
    id: "partner-2",
    email: "partner2@example.com",
    company_name: "Trocknungsexperten GmbH",
    is_verified: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    profession: "trocknung",
  },
  {
    id: "partner-3",
    email: "partner3@example.com",
    company_name: "KFZ-Service Weber",
    is_verified: true,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    profession: "kfz",
  },
  {
    id: "partner-4",
    email: "partner4@example.com",
    company_name: "Glaserei Schmidt",
    is_verified: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    profession: "glas",
  },
  {
    id: "partner-5",
    email: "partner5@example.com",
    company_name: "Sanitär Meister",
    is_verified: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    profession: "sanitaer",
  },
]

export const mockAdminInvoices: MockAdminInvoice[] = [
  {
    id: "inv-1",
    order_id: "order-4",
    gross_amount: "279.65",
    status: "paid",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-2",
    order_id: "order-3",
    gross_amount: "450.00",
    status: "paid",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-3",
    order_id: "order-6",
    gross_amount: "320.50",
    status: "pending",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockRoutingRules: MockRoutingRule[] = [
  {
    id: "rule-1",
    zip_prefix: "41",
    profession: "maler",
    preferred_assignee_id: "partner-1",
    assignee_type: 'partner',
    priority: 1,
    active: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rule-2",
    zip_prefix: "41",
    profession: "trocknung",
    preferred_assignee_id: "partner-2",
    assignee_type: 'partner',
    priority: 1,
    active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rule-3",
    zip_prefix: "41",
    profession: "kfz",
    preferred_assignee_id: "partner-3",
    assignee_type: 'handwerker',
    priority: 2,
    active: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rule-4",
    zip_prefix: "40",
    profession: "glas",
    preferred_assignee_id: "partner-4",
    assignee_type: 'partner',
    priority: 1,
    active: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
