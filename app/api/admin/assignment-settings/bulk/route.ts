import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

type Mode = "manual" | "auto" | "broadcast"
type Fallback = "internal_only" | "manual"

function normalizeZipPrefix(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length === 0 ? null : s
}

/**
 * POST /api/admin/assignment-settings/bulk
 * Body: { settings: Array<{ profession, zip_prefix?, mode, broadcast_partner_count?, fallback_behavior?, active? }> }
 *
 * Saves multiple assignment settings in one click (UX helper).
 * Implemented as "update-or-insert" per (profession, zip_prefix).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json().catch(() => null)
    const settings = (body?.settings as any[] | undefined) || []

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing settings array" },
        { status: 400 }
      )
    }

    const results: Array<{ profession: string; zip_prefix: string | null; status: "created" | "updated" }> = []

    for (const s of settings) {
      const profession = (s?.profession as string | undefined)?.trim()
      const zip_prefix = normalizeZipPrefix(s?.zip_prefix)
      const mode = s?.mode as Mode | undefined

      if (!profession) {
        return NextResponse.json({ success: false, error: "Missing profession in settings" }, { status: 400 })
      }
      if (mode !== "manual" && mode !== "auto" && mode !== "broadcast") {
        return NextResponse.json({ success: false, error: "Invalid mode in settings" }, { status: 400 })
      }

      const row = {
        profession,
        zip_prefix,
        mode,
        broadcast_partner_count: typeof s?.broadcast_partner_count === "number" ? s.broadcast_partner_count : 3,
        fallback_behavior: (s?.fallback_behavior === "manual" ? "manual" : "internal_only") as Fallback,
        active: typeof s?.active === "boolean" ? s.active : true,
      }

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
            profession: row.profession,
            zip_prefix: row.zip_prefix,
          },
          { status: 500 }
        )
      }

      if (existing?.id) {
        const { error: updateError } = await supabaseServer
          .from("assignment_settings")
          .update(row)
          .eq("id", existing.id)

        if (updateError) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to update assignment setting",
              details: updateError.message,
              code: updateError.code,
              profession: row.profession,
              zip_prefix: row.zip_prefix,
            },
            { status: 500 }
          )
        }

        results.push({ profession: row.profession, zip_prefix: row.zip_prefix, status: "updated" })
        continue
      }

      const { error: insertError } = await supabaseServer.from("assignment_settings").insert(row)
      if (insertError) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create assignment setting",
            details: insertError.message,
            code: insertError.code,
            profession: row.profession,
            zip_prefix: row.zip_prefix,
          },
          { status: 500 }
        )
      }

      results.push({ profession: row.profession, zip_prefix: row.zip_prefix, status: "created" })
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

