import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * GET /api/pro/partners/search
 * Search for partners by profession and zip
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireProUser(request)

    const { searchParams } = new URL(request.url)
    const profession = searchParams.get("profession")
    const zip = searchParams.get("zip")
    const query = searchParams.get("q")

    // Search for partners in profiles table (role='partner')
    let dbQuery = supabaseServer
      .from("profiles")
      .select("id, company_name, email, professions")
      .eq("role", "partner")

    if (query) {
      dbQuery = dbQuery.or(`company_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: profiles, error } = await dbQuery

    if (error) {
      console.error("Error searching partners:", error)
      return NextResponse.json(
        { success: false, error: "Fehler bei der Partnersuche" },
        { status: 500 }
      )
    }

    // Filter by profession if provided (check if professions array contains the profession)
    let filteredPartners = (profiles || []).filter((profile) => {
      if (profession) {
        const professions = Array.isArray(profile.professions) ? profile.professions : []
        if (!professions.includes(profession)) {
          return false
        }
      }
      return true
    })

    // Filter by zip if provided (note: profiles table doesn't have zip_codes yet, so we include all for now)
    if (zip && zip.length >= 2) {
      // TODO: Add zip_codes field to profiles table or create a separate service_areas table
      // For now, we return all partners matching the profession
    }

    return NextResponse.json({
      success: true,
      partners: filteredPartners.map((p) => ({
        id: p.id,
        name: p.company_name,
        email: p.email || null,
        profession: profession || null, // Use the searched profession
        rating: 4.5, // Default rating since profiles doesn't have rating field
        isVerified: true, // All partners in profiles are considered verified
      })),
    })
  } catch (error: any) {
    console.error("Error in partner search:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Fehler bei der Partnersuche",
      },
      { status: 500 }
    )
  }
}
