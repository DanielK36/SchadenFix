import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/server/requireAdmin"

/**
 * GET /api/admin/orders - Get all orders (admin only, bypasses RLS)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Use server client to bypass RLS (service_role_key)
    const { data: orders, error } = await supabaseServer
      .from("orders")
      .select("id, created_at, updated_at, status, type, customer_data, assigned_to, assigned_partner_id, company_id, scheduled_at, description")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Failed to fetch orders:", error)
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch orders", 
          details: error.message,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
    })
  } catch (error: any) {
    console.error("❌ Error fetching orders:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
