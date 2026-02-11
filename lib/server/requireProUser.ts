import { NextRequest } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * Require Pro user authentication in API routes
 * Returns the authenticated user ID and profile
 * Throws an error if not authenticated or not a Pro user
 */
export async function requireProUser(request: NextRequest): Promise<{ userId: string; profile: { id: string; role: string; company_name?: string | null } }> {
  // Get the authorization header
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No authorization header")
  }

  const token = authHeader.substring(7)

  // Verify the token and get the user
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)

  if (authError || !user) {
    throw new Error("Unauthorized: Invalid token")
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("id, role, company_name")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    throw new Error("Unauthorized: Profile not found")
  }

  // Check if user has Pro/Partner role
  if (profile.role !== 'chef' && profile.role !== 'azubi' && profile.role !== 'partner' && profile.role !== 'admin') {
    throw new Error("Unauthorized: User does not have Pro/Partner access")
  }

  return {
    userId: user.id,
    profile: {
      id: profile.id,
      role: profile.role,
      company_name: profile.company_name,
    },
  }
}
