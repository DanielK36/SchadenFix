import type { PartnerLead, PartnerCommission, PartnerPayout, PartnerActivity, PartnerTeamMember } from "@/lib/types/partner"

export const mockLeads: PartnerLead[] = [
  {
    id: "lead-1",
    customerName: "Max Mustermann",
    createdAt: "2024-04-20T10:00:00Z",
    status: "ABGESCHLOSSEN",
    expectedCommission: 150,
    receivedCommission: 150,
  },
  {
    id: "lead-2",
    customerName: "Anna Schmidt",
    createdAt: "2024-04-22T14:30:00Z",
    status: "AUFTRAG_ERTEILT",
    expectedCommission: 200,
  },
  {
    id: "lead-3",
    customerName: "Peter Müller",
    createdAt: "2024-04-23T09:15:00Z",
    status: "ANGEBOT_ERSTELLT",
    expectedCommission: 180,
  },
  {
    id: "lead-4",
    customerName: "Lisa Weber",
    createdAt: "2024-04-24T16:45:00Z",
    status: "KONTAKT_AUFGENOMMEN",
    expectedCommission: 120,
  },
]

export const mockCommissions: PartnerCommission[] = [
  {
    id: "comm-1",
    customerName: "Max Mustermann",
    amount: 150,
    createdAt: "2024-04-20T10:00:00Z",
    status: "PAID",
  },
  {
    id: "comm-2",
    customerName: "Anna Schmidt",
    amount: 200,
    createdAt: "2024-04-22T14:30:00Z",
    status: "PENDING",
  },
  {
    id: "comm-3",
    customerName: "Peter Müller",
    amount: 180,
    createdAt: "2024-04-23T09:15:00Z",
    status: "PENDING",
  },
]

export const mockPayouts: PartnerPayout[] = [
  {
    id: "payout-1",
    amount: 1500,
    paidAt: "2024-03-15T00:00:00Z",
    period: "März 2024",
  },
  {
    id: "payout-2",
    amount: 1800,
    paidAt: "2024-02-15T00:00:00Z",
    period: "Februar 2024",
  },
]

export const mockActivities: PartnerActivity[] = [
  {
    id: "act-1",
    type: "COMMISSION",
    title: "Neue Provision: 84 €",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amount: 84,
  },
  {
    id: "act-2",
    type: "LEAD",
    title: "Neuer Kunde: Max Mustermann",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-3",
    type: "COMMISSION",
    title: "Neue Provision: 112 €",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 112,
  },
]

export const mockTeamMembers: PartnerTeamMember[] = [
  {
    id: "team-1",
    name: "Sarah Johnson",
    joinedAt: "2024-01-15T00:00:00Z",
    totalCommissions: 5000,
    monthlyCommissions: 800,
  },
  {
    id: "team-2",
    name: "Michael Brown",
    joinedAt: "2024-02-20T00:00:00Z",
    totalCommissions: 3200,
    monthlyCommissions: 600,
  },
]

// Dashboard KPIs
export const mockDashboardKPIs = {
  monthlyCommissions: 1506.0,
  lifetimeCommissions: 24392.0,
  referredCustomers: 47,
  nextPayoutInDays: 14,
  pendingAmount: 380,
}

// Chart data for last 7 days
export const mockChartData = [
  { day: "Mo", revenue: 200 },
  { day: "Di", revenue: 250 },
  { day: "Mi", revenue: 180 },
  { day: "Do", revenue: 300 },
  { day: "Fr", revenue: 220 },
  { day: "Sa", revenue: 150 },
  { day: "So", revenue: 206 },
]


