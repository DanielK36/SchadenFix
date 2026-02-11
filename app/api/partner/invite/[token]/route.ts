import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * GET /api/partner/invite/[token]
 * Validates a Magic Link token and returns invitation details
 * Public endpoint (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token fehlt" },
        { status: 400 }
      )
    }

    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabaseServer
      .from("partner_invitations")
      .select(
        `
        id,
        inviter_partner_id,
        invitee_email,
        status,
        expires_at,
        created_at,
        partners:inviter_partner_id (
          id,
          company_name
        )
      `
      )
      .eq("token", token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: "Einladung nicht gefunden" },
        { status: 404 }
      )
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      // Mark as expired
      await supabaseServer
        .from("partner_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)

      return NextResponse.json(
        { success: false, error: "Einladung ist abgelaufen" },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Einladung wurde bereits verwendet",
          status: invitation.status,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        inviteeEmail: invitation.invitee_email,
        inviterCompanyName:
          (invitation.partners as any)?.company_name || "Unbekannt",
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
      },
    })
  } catch (err: any) {
    console.error("Error in GET /api/partner/invite/[token]:", err)
    return NextResponse.json(
      { success: false, error: "Interner Fehler", details: err?.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/partner/invite/[token]/accept
 * Accepts a Magic Link invitation
 * Requires: Authenticated user (can be new signup)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token fehlt" },
        { status: 400 }
      )
    }

    const { userId } = await requirePartner(request)

    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabaseServer
      .from("partner_invitations")
      .select("id, inviter_partner_id, invitee_email, status, expires_at")
      .eq("token", token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { success: false, error: "Einladung nicht gefunden" },
        { status: 404 }
      )
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      await supabaseServer
        .from("partner_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)

      return NextResponse.json(
        { success: false, error: "Einladung ist abgelaufen" },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Einladung wurde bereits verwendet",
        },
        { status: 409 }
      )
    }

    // Verify email matches (optional check - can be relaxed)
    const { data: authUser, error: authUserError } = await supabaseServer.auth.getUser(
      request.headers.get("authorization")?.substring(7) || ""
    )
    if (authUserError || !authUser?.user) {
      return NextResponse.json(
        { success: false, error: "Bitte melde dich zuerst an" },
        { status: 401 }
      )
    }
    const userEmail = authUser.user.email?.toLowerCase().trim()
    const inviteeEmail = invitation.invitee_email.toLowerCase().trim()

    if (userEmail !== inviteeEmail) {
      return NextResponse.json(
        {
          success: false,
          error: `Diese Einladung ist für ${invitation.invitee_email} bestimmt`,
        },
        { status: 403 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("id, role, partner_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profil nicht gefunden" },
        { status: 404 }
      )
    }

    // Update profile: set parent_partner_id to inviter (partner hierarchy)
    const { error: updateError } = await supabaseServer
      .from("profiles")
      .update({
        parent_partner_id: invitation.inviter_partner_id,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: "Profil konnte nicht aktualisiert werden",
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabaseServer
      .from("partner_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq("id", invitation.id)

    if (acceptError) {
      console.error("Error accepting invitation:", acceptError)
      // Don't fail - profile is already updated
    }

    return NextResponse.json({
      success: true,
      message: "Einladung erfolgreich akzeptiert",
      partnerId: invitation.inviter_partner_id,
    })
  } catch (err: any) {
    console.error("Error in POST /api/partner/invite/[token]/accept:", err)
    return NextResponse.json(
      { success: false, error: "Interner Fehler", details: err?.message },
      { status: 500 }
    )
  }
}
