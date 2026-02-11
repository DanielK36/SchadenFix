import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/orders/:orderId - Get one order (admin only, bypasses RLS)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireAdmin(request)

    const { orderId } = await params

    // Fetch order first without embedded relation (PostgREST relationship can be missing in dev).
    const { data: order, error } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500
      return NextResponse.json(
        { success: false, error: status === 404 ? "Order not found" : "Failed to fetch order", details: error.message },
        { status }
      )
    }

    // Try to load wizard data if table exists; don't fail the request if it doesn't.
    let wizard: any = null
    const { data: wizardData, error: wizardError } = await supabaseServer
      .from("order_wizard_data")
      .select("id, category_answers, photos, voice_note_url, internal_notes, created_at")
      .eq("order_id", orderId)
      .maybeSingle()

    if (!wizardError) {
      wizard = wizardData || null
    }

    // Load assigned handwerker profile if assigned_to exists
    let assignedProfile: any = null
    if (order?.assigned_to) {
      console.log(`🔍 Loading profile for assigned_to: ${order.assigned_to}`)
      const { data: profile, error: profileError } = await supabaseServer
        .from("profiles")
        .select("id, company_name, role")
        .eq("id", order.assigned_to)
        .single()
      
      if (profileError) {
        console.warn(`⚠️ Error loading profile:`, profileError)
      } else if (profile) {
        console.log(`✅ Profile loaded:`, { company_name: profile.company_name, role: profile.role })
        assignedProfile = profile
      } else {
        console.log(`ℹ️ No profile found for assigned_to: ${order.assigned_to}`)
      }
    }

    // Load assigned partner if assigned_partner_id exists
    // Partners are stored in profiles table with role='partner'
    let assignedPartner: any = null
    if (order?.assigned_partner_id) {
      console.log(`🔍 Loading partner for assigned_partner_id: ${order.assigned_partner_id}`)
      const { data: partner, error: partnerError } = await supabaseServer
        .from("profiles")
        .select("id, company_name, email")
        .eq("id", order.assigned_partner_id)
        .eq("role", "partner")
        .maybeSingle()
      
      if (partnerError) {
        console.warn(`⚠️ Error loading partner:`, partnerError)
      } else if (partner) {
        console.log(`✅ Partner loaded:`, { company_name: partner.company_name, email: partner.email })
        assignedPartner = partner
      } else {
        console.log(`ℹ️ No partner found for assigned_partner_id: ${order.assigned_partner_id}`)
      }
    }

    // Load order_quotes (KVA) for this order
    let orderQuote: any = null
    const { data: quote } = await supabaseServer
      .from("order_quotes")
      .select("id, items, offer_sent_at, customer_accepted_at, offer_token")
      .eq("order_id", orderId)
      .maybeSingle()
    if (quote) orderQuote = quote

    // Load invoices for this order
    let orderInvoices: any[] = []
    const { data: invoices } = await supabaseServer
      .from("invoices")
      .select("id, status, gross_amount, net_amount, created_at, due_date")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
    if (invoices && Array.isArray(invoices)) orderInvoices = invoices

    return NextResponse.json({
      success: true,
      order: {
        ...(order as any),
        order_wizard_data: wizard,
        assigned_profile: assignedProfile,
        assigned_partner: assignedPartner,
        order_quote: orderQuote,
        order_invoices: orderInvoices,
      },
      ...(wizardError ? { wizard_warning: wizardError.message } : {}),
    })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

