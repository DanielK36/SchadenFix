import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { getClaimsRepository } from "@/lib/repo/claims"

/**
 * GET /api/claims - Get all claims for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user email from query params (for now, later from auth)
    const email = request.nextUrl.searchParams.get("email")
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      )
    }

    // Get all claims from repository
    const repo = getClaimsRepository()
    const allClaims = await repo.findAll()
    
    // Filter claims by email
    const userClaims = allClaims.filter(
      (claim) => claim.contact.email.toLowerCase() === email.toLowerCase()
    )

    // Sort by creation date (newest first)
    userClaims.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      claims: userClaims,
    })
  } catch (error: any) {
    console.error("Error fetching claims:", error)
    return NextResponse.json(
      { error: "Failed to fetch claims", details: error.message },
      { status: 500 }
    )
  }
}
