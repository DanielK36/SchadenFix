"use client"

import { mockBillingMonths, mockInvoices } from "@/lib/mock/proData"
import { Button } from "@/components/ui/button"
import { RevenueChart } from "@/components/pro/RevenueChart"

// Mock revenue data for last 6 months
const revenueData = [
  { month: "Jun", revenue: 7200 },
  { month: "Jul", revenue: 8100 },
  { month: "Aug", revenue: 7800 },
  { month: "Sep", revenue: 9200 },
  { month: "Okt", revenue: 8500 },
  { month: "Nov", revenue: 8500 },
]

export default function ProBillingPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
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
          {mockBillingMonths.slice(0, 3).map((month) => (
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
                  <p className="text-3xl font-bold text-[#FFD700]">
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
        {mockBillingMonths.map((month) => (
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
                <p className="pro-kpi-medium text-[#FFD700]">
                  {month.totalRevenue.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div>
                <p className="pro-body-small text-[#6B7280]">Servicegebühr (10%)</p>
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
          {mockBillingMonths
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
                    <span className="font-semibold text-[#FFD700]">
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
              {mockBillingMonths
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

      {/* Invoice Documents */}
      <div className="pro-card">
        <h2 className="pro-h2 mb-4">Rechnungsdokumente</h2>
        <div className="space-y-2">
          {mockBillingMonths.map((month) => (
            <div
              key={month.month}
              className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-lg"
            >
              <span className="pro-body-small text-[#374151]">
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
