import { NextRequest } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function requireAdmin(request: NextRequest): Promise<{ userId: string }> {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null

  if (!token) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 })
  }

  const { data: userData, error: userError } = await supabaseServer.auth.getUser(token)
  if (userError || !userData.user) {
    throw Object.assign(new Error("Unauthorized"), { status: 401, details: userError?.message })
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    throw Object.assign(new Error("Forbidden"), { status: 403 })
  }

  return { userId: userData.user.id }
}

