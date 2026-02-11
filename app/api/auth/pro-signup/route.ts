import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase-server"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().trim().min(1).optional(),
  professions: z.array(z.string()).min(1, "Mindestens ein Gewerk muss ausgewählt werden"),
  partnerRef: z.string().trim().optional(),
})

/**
 * POST /api/auth/pro-signup
 * Creates a Pro user (chef) and provisions the profile server-side (service role).
 *
 * This avoids fragile client-side RLS/trigger dependencies for `profiles`.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Server not configured",
          details: "Missing SUPABASE_SERVICE_ROLE_KEY",
        },
        { status: 500 }
      )
    }

    const json = await request.json()
    const body = bodySchema.parse(json)

    const { data: created, error: createUserError } =
      await supabaseServer.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          company_name: body.companyName || null,
        },
      })

    if (createUserError || !created.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user",
          details: createUserError?.message || "No user returned",
        },
        { status: 400 }
      )
    }

    const userId = created.user.id

    let affiliatePartnerId: string | null = null
    if (body.partnerRef) {
      const { data: link } = await supabaseServer
        .from("affiliate_links")
        .select("partner_id")
        .eq("code", body.partnerRef)
        .maybeSingle()
      if (link?.partner_id) affiliatePartnerId = link.partner_id
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .upsert(
        {
          id: userId,
          role: "chef",
          roles: ["chef"],
          company_name: body.companyName || null,
          professions: body.professions || [],
          ...(affiliatePartnerId ? { partner_id: affiliatePartnerId } : {}),
        },
        { onConflict: "id" }
      )
      .select("id, role, company_name")
      .single()

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to provision profile",
          details: profileError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
      profile,
    })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: err.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error", details: err?.message },
      { status: 500 }
    )
  }
}

