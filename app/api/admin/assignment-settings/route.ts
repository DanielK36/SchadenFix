import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/assignment-settings
 * POST /api/admin/assignment-settings
 *
 * Admin-only endpoints for configuring assignment behavior (manual/auto/broadcast).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { data, error } = await supabaseServer
      .from("assignment_settings")
      .select("*")
      .order("profession", { ascending: true })
      .order("zip_prefix", { ascending: true, nullsFirst: true })
      .limit(500)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch assignment settings", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, settings: data || [] })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const profession = (body?.profession as string | undefined)?.trim()
    const zipPrefix = (body?.zip_prefix as string | null | undefined) ?? null
    const mode = body?.mode as "manual" | "auto" | "broadcast" | undefined

    if (!profession) {
      return NextResponse.json({ success: false, error: "Missing profession" }, { status: 400 })
    }
    if (!mode) {
      return NextResponse.json({ success: false, error: "Missing mode" }, { status: 400 })
    }

    const row = {
      profession,
      zip_prefix: zipPrefix && String(zipPrefix).trim() !== "" ? String(zipPrefix).trim() : null,
      mode,
      broadcast_partner_count:
        typeof body?.broadcast_partner_count === "number" ? body.broadcast_partner_count : 3,
      fallback_behavior:
        body?.fallback_behavior === "manual" ? ("manual" as const) : ("internal_only" as const),
      active: typeof body?.active === "boolean" ? body.active : true,
    }

    // "Upsert" behavior without relying on expression-based unique index:
    // If a row for (profession, zip_prefix) exists, update it; otherwise insert.
    const existingQuery = supabaseServer
      .from("assignment_settings")
      .select("id")
      .eq("profession", row.profession)
      .limit(1)

    const { data: existing, error: existingError } =
      row.zip_prefix === null
        ? await existingQuery.is("zip_prefix", null).single()
        : await existingQuery.eq("zip_prefix", row.zip_prefix).single()

    if (existingError && existingError.code !== "PGRST116") {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to lookup assignment setting",
          details: existingError.message,
          code: existingError.code,
        },
        { status: 500 }
      )
    }

    if (existing?.id) {
      const { data: updated, error: updateError } = await supabaseServer
        .from("assignment_settings")
        .update(row)
        .eq("id", existing.id)
        .select("*")
        .single()

      if (updateError) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update assignment setting",
            details: updateError.message,
            code: updateError.code,
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, setting: updated, updated: true })
    }

    const { data, error } = await supabaseServer.from("assignment_settings").insert(row).select("*").single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create assignment setting",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, setting: data, created: true })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

