import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * GET /api/offer/[token] – öffentlich, liefert Angebotsdetail für Kunden-Link.
 * Nutzt Service-Role, da RLS für order_quotes nur Pro-User erlaubt.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) {
      return NextResponse.json({ success: false, error: "Token fehlt" }, { status: 400 })
    }

    const { data: quote, error: quoteError } = await supabaseServer
      .from("order_quotes")
      .select("order_id, items, offer_token, offer_sent_at, customer_accepted_at")
      .eq("offer_token", token)
      .maybeSingle()

    if (quoteError || !quote) {
      return NextResponse.json({ success: false, error: "Angebot nicht gefunden oder ungültiger Link" }, { status: 404 })
    }

    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .select("id, type, description, customer_data, company_id")
      .eq("id", quote.order_id)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Auftrag nicht gefunden" }, { status: 404 })
    }

    let company: Record<string, string | undefined> | null = null
    if (order.company_id) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("company_name, contact_person, email, phone, address, zip, city, iban, account_holder, tax_id, avatar_url")
        .eq("id", order.company_id)
        .maybeSingle()
      if (profile) {
        const p = profile as Record<string, unknown>
        company = {
          companyName: (p.company_name as string) ?? "",
          contactPerson: (p.contact_person as string) ?? undefined,
          email: (p.email as string) ?? undefined,
          phone: (p.phone as string) ?? undefined,
          address: (p.address as string) ?? undefined,
          zip: (p.zip as string) ?? undefined,
          city: (p.city as string) ?? undefined,
          iban: (p.iban as string) ?? undefined,
          accountHolder: (p.account_holder as string) ?? undefined,
          taxId: (p.tax_id as string) ?? undefined,
          logoUrl: (p.avatar_url as string) ?? undefined,
        }
      }
    }

    const cd = (order.customer_data as any) || {}
    const items = Array.isArray(quote.items) ? quote.items : []
    const netTotal = items.reduce((s: number, i: any) => s + (Number(i?.total) || 0), 0)
    const vatRate = 19
    const vatAmount = (netTotal * vatRate) / 100
    const grossTotal = netTotal + vatAmount

    // Kundenadresse: nur Straße + PLZ/Ort, ohne Dopplung (wenn address schon PLZ/Ort enthält, nicht nochmal anhängen)
    const addrPart = (cd.address || "").trim()
    const zipCityPart = [cd.zip, cd.city].filter(Boolean).join(" ").trim()
    let customerAddress = addrPart
    if (zipCityPart && !addrPart.includes(zipCityPart)) {
      customerAddress = customerAddress ? `${customerAddress}, ${zipCityPart}` : zipCityPart
    }

    return NextResponse.json({
      success: true,
      offer: {
        id: quote.offer_token,
        orderId: order.id,
        customerName: cd.name || "Kunde",
        customerAddress: customerAddress || "",
        damageType: order.type || "Wasserschaden",
        items,
        netTotal,
        vatAmount,
        grossTotal,
        createdAt: quote.offer_sent_at || undefined,
        offerSentAt: quote.offer_sent_at || undefined,
        customerAcceptedAt: quote.customer_accepted_at || undefined,
        alreadyAccepted: !!quote.customer_accepted_at,
        company: company || undefined,
      },
    })
  } catch (e: any) {
    console.error("GET /api/offer/[token]", e)
    return NextResponse.json({ success: false, error: "Fehler beim Laden" }, { status: 500 })
  }
}
