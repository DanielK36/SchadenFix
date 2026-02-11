import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requirePartner } from "@/lib/server/requirePartner"

/**
 * PUT /api/partner/settings/profile
 * Update partner profile fields
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requirePartner(request)

    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("id, company_name")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: "Failed to load profile", details: error?.message },
        { status: 500 }
      )
    }

    // Get email from auth.users
    const { data: { user } } = await supabaseServer.auth.admin.getUserById(userId)

    return NextResponse.json({ 
      success: true, 
      profile: {
        ...profile,
        email: user?.email || null
      }
    })
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

    const updates: Record<string, any> = {}
    if (typeof body.company_name === "string") updates.company_name = body.company_name

    // Email updates go to auth.users, not profiles
    if (typeof body.email === "string" && body.email) {
      const { error: emailError } = await supabaseServer.auth.admin.updateUserById(userId, {
        email: body.email
      })
      if (emailError) {
        return NextResponse.json(
          { success: false, error: "Failed to update email", details: emailError.message },
          { status: 500 }
        )
      }
    }

    if (Object.keys(updates).length === 0 && !body.email) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      )
    }

    let profileError = null
    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseServer
        .from("profiles")
        .update(updates)
        .eq("id", userId)
      
      profileError = error
    }

    if (profileError) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile", details: profileError.message },
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
