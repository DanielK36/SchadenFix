import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { requireProUser } from "@/lib/server/requireProUser"

/**
 * DELETE /api/pro/team/members/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, profile } = await requireProUser(request)
    if (profile.role !== "chef") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const memberId = params.id
    const { error } = await supabaseServer
      .from("pro_team_members")
      .delete()
      .eq(\"company_id\", userId)
      .eq(\"member_id\", memberId)

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to remove member", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.message?.includes("Unauthorized") ? 401 : 500
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status })
  }
}
