"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { mockBillingMonths, mockInvoices } from "@/lib/mock/proData"
import { Button } from "@/components/ui/button"
import { RevenueChart } from "@/components/pro/RevenueChart"
import { useDemoMode } from "@/lib/hooks/useDemoMode"
import { supabase } from "@/lib/supabase"


export default function ProBillingPage() {
  const { isDemoMode } = useDemoMode()
  const [billingMonths, setBillingMonths] = useState<{ month: string; totalRevenue: number; serviceFee: number; status: string }[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<{ day: string; revenue: number }[]>([])
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)

  useEffect(() => {
    async function loadBilling() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setBillingMonths(mockBillingMonths)
          setInvoices(mockInvoices)
          setRevenueData([
            { day: "Jun", revenue: 7200 },
            { day: "Jul", revenue: 8100 },
            { day: "Aug", revenue: 7800 },
            { day: "Sep", revenue: 9200 },
            { day: "Okt", revenue: 8500 },
            { day: "Nov", revenue: 8500 },
          ])
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch("/api/pro/invoices", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        if (!data?.success) throw new Error(data?.error || "Failed to load invoices")

        const invoicesData = data.invoices || []
        setInvoices(invoicesData)

        const byMonth = new Map<string, { totalRevenue: number; serviceFee: number; status: string }>()
        invoicesData.forEach((inv: any) => {
          const monthKey = new Date(inv.created_at).toISOString().slice(0, 7)
          const prev = byMonth.get(monthKey) || { totalRevenue: 0, serviceFee: 0, status: "OPEN" }
          const gross = Number(inv.gross_amount || 0)
          prev.totalRevenue += gross
          prev.serviceFee += gross * 0.15
          if (inv.status === "paid") prev.status = "PAID"
          byMonth.set(monthKey, prev)
        })

        const months = Array.from(byMonth.entries()).map(([month, values]) => ({
          month,
          totalRevenue: values.totalRevenue,
          serviceFee: values.serviceFee,
          status: values.status,
        }))
        setBillingMonths(months.length ? months : [])

        const recent = months.slice(-6).map((m) => ({
          day: new Date(m.month + "-01").toLocaleDateString("de-DE", { month: "short" }),
          revenue: m.totalRevenue,
        }))
        setRevenueData(recent)
      } catch (error) {
        console.warn(error)
        setBillingMonths([])
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    loadBilling()
  }, [isDemoMode])

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    if (isDemoMode) return
    setMarkingPaidId(invoiceId)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch(`/api/pro/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: "paid" }),
      })
      const data = await res.json()
      if (data?.success) {
        setInvoices((prev) => prev.map((inv: any) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv)))
        const inv = invoices.find((i: any) => i.id === invoiceId)
        if (inv) {
          const monthKey = new Date(inv.created_at).toISOString().slice(0, 7)
          setBillingMonths((prev) =>
            prev.map((m) =>
              m.month === monthKey ? { ...m, status: "PAID" } : m
            )
          )
        }
      } else alert(data?.error ?? "Status konnte nicht aktualisiert werden.")
    } catch (e) {
      alert("Fehler beim Markieren als bezahlt.")
    } finally {
      setMarkingPaidId(null)
    }
  }

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="pro-h1">Rechnungscenter</h1>
        <p className="pro-body-small mt-1 text-[#6B7280]">Übersicht über Umsätze und Servicegebühren</p>
      </div>

      {/* Revenue Chart */}
      <div className="pro-card">
        <h2 className="pro-h2 mb-3">Umsatz-Entwicklung (letzte 6 Monate)</h2>
        <RevenueChart data={revenueData} />
      </div>

      {/* Monthly Overview */}
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {billingMonths.slice(0, 3).map((month) => (
            <div key={month.month} className="pro-card min-w-[280px] p-4">
              <h3 className="pro-h2 mb-3 text-base">
                {new Date(month.month + "-01").toLocaleDateString("de-DE", {
                  month: "short",
                  year: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="pro-body-small text-[#6B7280] mb-1">Umsatz</p>
                  <p className="text-3xl font-bold text-[#B8903A]">
                    {month.totalRevenue.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#EAEAEA]">
                  <span
                    className={`pro-badge ${
                      month.status === "PAID"
                        ? "pro-badge-success"
                        : month.status === "SCHEDULED"
                          ? "pro-badge-warning"
                          : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {month.status === "PAID"
                      ? "Bezahlt"
                      : month.status === "SCHEDULED"
                        ? "Geplant"
                        : "Offen"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop - Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {billingMonths.map((month) => (
          <div key={month.month} className="pro-card">
            <h3 className="pro-h2 mb-4">
              {new Date(month.month + "-01").toLocaleDateString("de-DE", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="pro-body-small text-[#6B7280]">Gesamtumsatz</p>
                <p className="pro-kpi-medium text-[#B8903A]">
                  {month.totalRevenue.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div>
                <p className="pro-body-small text-[#6B7280]">Servicegebühr (15%)</p>
                <p className="text-2xl font-semibold text-[#1A1A1A]">
                  {month.serviceFee.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="pt-3 border-t border-[#EAEAEA]">
                <span
                  className={`pro-badge ${
                    month.status === "PAID"
                      ? "pro-badge-success"
                      : month.status === "SCHEDULED"
                        ? "pro-badge-warning"
                        : "bg-[#F7F7F7] text-[#6B7280]"
                  }`}
                >
                  {month.status === "PAID"
                    ? "Bezahlt"
                    : month.status === "SCHEDULED"
                      ? "Geplant"
                      : "Offen"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Open Service Fees */}
      <div className="pro-card">
        <div className="border-b border-[#EAEAEA] pb-4 mb-4">
          <h2 className="pro-h2">Offene Servicegebühren</h2>
        </div>
        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {billingMonths
            .filter((m) => m.status !== "PAID")
            .map((month) => (
              <div key={month.month} className="p-4 bg-[#F7F7F7] rounded-lg border border-[#EAEAEA]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1A1A]">
                    {new Date(month.month + "-01").toLocaleDateString("de-DE", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <span
                    className={`pro-badge ${
                      month.status === "SCHEDULED"
                        ? "pro-badge-warning"
                        : "bg-[#F7F7F7] text-[#6B7280]"
                    }`}
                  >
                    {month.status === "SCHEDULED" ? "Geplant" : "Offen"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Umsatz:</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {month.totalRevenue.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Gebühr:</span>
                    <span className="font-semibold text-[#B8903A]">
                      {month.serviceFee.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                  Monat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                  Umsatz
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                  Servicegebühr
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#EAEAEA]">
              {billingMonths
                .filter((m) => m.status !== "PAID")
                .map((month) => (
                  <tr key={month.month} className="pro-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(month.month + "-01").toLocaleDateString("de-DE", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {month.totalRevenue.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {month.serviceFee.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`pro-badge ${
                          month.status === "SCHEDULED"
                            ? "pro-badge-warning"
                            : "bg-[#F7F7F7] text-[#6B7280]"
                        }`}
                      >
                        {month.status === "SCHEDULED" ? "Geplant" : "Offen"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Einzelne Rechnungen – Rechnung bezahlt-Button */}
      {!isDemoMode && invoices.length > 0 && (
        <div className="pro-card">
          <h2 className="pro-h2 mb-4">Rechnungen</h2>
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-lg flex-wrap gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="pro-body-small text-[#6B7280]">
                    {Number(inv.gross_amount || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    {inv.order_id && (
                      <>
                        {" · "}
                        <Link href={`/pro/orders/${inv.order_id}`} className="text-[#B8903A] hover:underline">
                          Zum Auftrag
                        </Link>
                      </>
                    )}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${inv.status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {inv.status === "paid" ? "Bezahlt" : "Offen"}
                  </span>
                </div>
                {inv.status !== "paid" && (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={markingPaidId === inv.id}
                    onClick={() => handleMarkInvoicePaid(inv.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {markingPaidId === inv.id ? "Wird gespeichert…" : "Rechnung bezahlt"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Documents */}
      <div className="pro-card">
        <h2 className="pro-h2 mb-4">Rechnungsdokumente</h2>
        <div className="space-y-2">
          {billingMonths.map((month) => (
            <div
              key={month.month}
              className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-lg"
            >
              <span className="pro-body-small text-[#6B7280]">
                Rechnung {new Date(month.month + "-01").toLocaleDateString("de-DE", {
                  month: "long",
                  year: "numeric",
                })}
                .pdf
              </span>
              <Button variant="ghost" size="sm">
                Herunterladen
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
