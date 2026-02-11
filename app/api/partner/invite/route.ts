import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"
import { randomBytes } from "crypto"

const inviteSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
})

/**
 * POST /api/partner/invite
 * Generates a Magic Link invitation for a partner
 * Requires: Authenticated partner user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    // Parse request body
    const body = await request.json()
    const { email } = inviteSchema.parse(body)

    // Generate secure token
    const token = randomBytes(32).toString("hex")

    // Set expiration (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseServer
      .from("partner_invitations")
      .insert({
        inviter_partner_id: userId,
        invitee_email: email.toLowerCase().trim(),
        token,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id, token, expires_at")
      .single()

    if (inviteError || !invitation) {
      console.error("Error creating invitation:", inviteError)
      return NextResponse.json(
        {
          success: false,
          error: "Einladung konnte nicht erstellt werden",
          details: inviteError?.message,
        },
        { status: 500 }
      )
    }

    // Generate Magic Link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3006"
    const magicLink = `${baseUrl}/partner/invite/${token}`

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        token: invitation.token,
        expiresAt: invitation.expires_at,
        magicLink,
      },
    })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Ungültige Eingabe", details: err.errors },
        { status: 400 }
      )
    }

    console.error("Error in POST /api/partner/invite:", err)
    return NextResponse.json(
      { success: false, error: "Interner Fehler", details: err?.message },
      { status: 500 }
    )
  }
}
