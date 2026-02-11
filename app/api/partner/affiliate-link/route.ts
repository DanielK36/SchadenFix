import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

function generateCode(length = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase()
}

/**
 * GET /api/partner/affiliate-link
 * Returns existing affiliate link or creates a new one
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, profile } = await requirePartner(request)

    const { data: existing, error: existingError } = await supabaseServer
      .from("affiliate_links")
      .select("id, code, url, clicks, conversions")
      .eq("partner_id", userId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json(
        { success: false, error: "Failed to load affiliate link", details: existingError.message },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json({ success: true, link: existing })
    }

    // Ensure partners row exists for FK usage
    await supabaseServer
      .from("partners")
      .upsert(
        { id: userId, company_name: profile.company_name || "Partner", email: null },
        { onConflict: "id" }
      )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3006"
    const code = generateCode()
    const url = `${baseUrl}/?ref=${code}`

    const { data: created, error: createError } = await supabaseServer
      .from("affiliate_links")
      .insert({
        partner_id: userId,
        code,
        url,
      })
      .select("id, code, url, clicks, conversions")
      .single()

    if (createError || !created) {
      return NextResponse.json(
        { success: false, error: "Failed to create affiliate link", details: createError?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, link: created })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
