import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase-server"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().trim().min(1),
})

/**
 * POST /api/auth/partner-signup
 * Creates a Partner user and provisions the profile server-side (service role).
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
          company_name: body.companyName,
        },
      })

    if (createUserError || !created.user) {
      const message = createUserError?.message || "No user returned"
      const errorCode = createUserError?.status || createUserError?.code || ""
      
      // Check multiple ways Supabase might indicate user already exists
      const alreadyExists =
        errorCode === 409 ||
        errorCode === "23505" || // PostgreSQL unique violation
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("registered") ||
        message.toLowerCase().includes("exists") ||
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("user already registered") ||
        message.toLowerCase().includes("email address is already registered")

      if (alreadyExists) {
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
            code: "USER_EXISTS",
            details: message,
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user",
          details: message,
        },
        { status: 400 }
      )
    }

    const userId = created.user.id

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .upsert(
        {
          id: userId,
          role: "partner",
          roles: ["partner"],
          company_name: body.companyName,
          email: body.email,
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

    // Ensure partner row exists for FK usage
    const { error: partnerRowError } = await supabaseServer
      .from("partners")
      .upsert(
        {
          id: userId,
          company_name: body.companyName,
          email: body.email,
        },
        { onConflict: "id" }
      )

    if (partnerRowError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to provision partner",
          details: partnerRowError.message,
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

