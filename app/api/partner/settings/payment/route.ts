import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * PUT /api/partner/settings/payment
 * Store payout settings for partner
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: settings, error } = await supabaseServer
      .from("partner_payout_settings")
      .select("iban, account_holder, tax_id")
      .eq("partner_id", userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to load payment settings", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, payment: settings || null })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)
    const body = await request.json()

    const { iban, accountHolder, taxId } = body || {}

    if (!iban || !accountHolder) {
      return NextResponse.json(
        { success: false, error: "IBAN und Kontoinhaber sind erforderlich" },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from("partner_payout_settings")
      .upsert(
        {
          partner_id: userId,
          iban,
          account_holder: accountHolder,
          tax_id: taxId || null,
        },
        { onConflict: "partner_id" }
      )

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to update payment settings", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
