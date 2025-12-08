export type LeadStatus = "KONTAKT_AUFGENOMMEN" | "ANGEBOT_ERSTELLT" | "AUFTRAG_ERTEILT" | "ABGESCHLOSSEN"

export interface PartnerLead {
  id: string
  customerName: string
  createdAt: string
  status: LeadStatus
  expectedCommission: number
  receivedCommission?: number
  note?: string
}

export interface PartnerCommission {
  id: string
  customerName: string
  amount: number
  createdAt: string
  status: "PENDING" | "PAID"
}

export interface PartnerPayout {
  id: string
  amount: number
  paidAt: string
  period: string
}

export interface PartnerActivity {
  id: string
  type: "LEAD" | "COMMISSION" | "PAYOUT"
  title: string
  description?: string
  createdAt: string
  amount?: number
}

export interface PartnerTeamMember {
  id: string
  name: string
  joinedAt: string
  totalCommissions: number
  monthlyCommissions: number
}


