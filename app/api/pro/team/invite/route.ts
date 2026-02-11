import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

function generatePassword(length = 12) {
  return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length)
}

/**
 * POST /api/pro/team/invite
 * Body: { email: string, name?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await requireProUser(request)
    if (profile.role !== "chef") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()
    const name = String(body?.name || "").trim()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 })
    }

    const password = generatePassword()

    const { data: created, error: createUserError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          company_name: name || "Mitarbeiter",
        },
      })

    if (createUserError || !created.user) {
      return NextResponse.json(
        { success: false, error: "Failed to create user", details: createUserError?.message },
        { status: 400 }
      )
    }

    const memberId = created.user.id

    const { error: profileError } = await supabaseServer
      .from("profiles")
      .upsert(
        { id: memberId, role: "azubi", company_name: name || "Mitarbeiter", email },
        { onConflict: "id" }
      )

    if (profileError) {
      return NextResponse.json(
        { success: false, error: "Failed to provision profile", details: profileError.message },
        { status: 500 }
      )
    }

    const { error: linkError } = await supabaseServer
      .from("pro_team_members")
      .insert({
        company_id: userId,
        member_id: memberId,
        role: "azubi",
      })

    if (linkError) {
      return NextResponse.json(
        { success: false, error: "Failed to add team member", details: linkError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      member: { id: memberId, email, name: name || "Mitarbeiter" },
      tempPassword: password,
    })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}
