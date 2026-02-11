import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/routing-rules - list rules (admin only)
 * POST /api/admin/routing-rules - create rule (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { data: rules, error } = await supabaseServer
      .from("routing_rules")
      .select("*")
      .order("zip_prefix", { ascending: true })
      .order("priority", { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch routing rules", details: error.message },
        { status: 500 }
      )
    }

    // Enrich rules with partner/handwerker data
    const enrichedRules = await Promise.all(
      (rules || []).map(async (rule: any) => {
        if (!rule.preferred_assignee_id) {
          return rule
        }

        if (rule.assignee_type === 'partner') {
          // Load partner data from profiles table (partners are stored with role='partner')
          const { data: partner } = await supabaseServer
            .from("profiles")
            .select("id, company_name")
            .eq("id", rule.preferred_assignee_id)
            .eq("role", "partner")
            .maybeSingle()
          
          return {
            ...rule,
            partner: partner ? { ...partner, rating: 4.5 } : null, // Default rating since profiles doesn't have rating
          }
        } else if (rule.assignee_type === 'handwerker') {
          // Load handwerker data from profiles
          const { data: handwerker } = await supabaseServer
            .from("profiles")
            .select("id, company_name, role")
            .eq("id", rule.preferred_assignee_id)
            .in("role", ["chef", "azubi"])
            .single()
          
          return {
            ...rule,
            handwerker: handwerker || null,
          }
        }

        return rule
      })
    )

    return NextResponse.json({ success: true, rules: enrichedRules })
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
    const { zip_prefix, profession, preferred_assignee_id, assignee_type, priority, active } = body || {}

    if (!zip_prefix || !profession) {
      return NextResponse.json(
        { success: false, error: "Missing zip_prefix or profession" },
        { status: 400 }
      )
    }

    // Validierung: Wenn preferred_assignee_id gesetzt ist, muss assignee_type auch gesetzt sein
    if (preferred_assignee_id && !assignee_type) {
      return NextResponse.json(
        { success: false, error: "assignee_type is required when preferred_assignee_id is provided" },
        { status: 400 }
      )
    }

    // Validierung: assignee_type muss 'partner' oder 'handwerker' sein
    if (assignee_type && !['partner', 'handwerker'].includes(assignee_type)) {
      return NextResponse.json(
        { success: false, error: "assignee_type must be 'partner' or 'handwerker'" },
        { status: 400 }
      )
    }

    const { data: rule, error } = await supabaseServer
      .from("routing_rules")
      .insert({
        zip_prefix,
        profession,
        preferred_assignee_id: preferred_assignee_id || null,
        assignee_type: assignee_type || null,
        priority: priority ?? 1,
        active: active ?? true,
      })
      .select("*")
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to create routing rule", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, rule })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error", details: error?.details },
      { status }
    )
  }
}

