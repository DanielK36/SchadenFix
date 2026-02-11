"use client"

import { supabase } from "./supabase"
import { User } from "@supabase/supabase-js"

/**
 * Get current authenticated user (client-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    
    if (error) {
      // User not authenticated
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Get current session (for Magic Link handling)
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error getting session:", error)
      return null
    }
    
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

/**
 * Handle Magic Link authentication
 * Call this when user clicks on a magic link
 */
export async function handleMagicLink(hash: string): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: hash,
      type: 'magiclink',
    })
    
    if (error) {
      return { user: null, error }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// ============================================
// PRO/PARTNER AUTHENTICATION
// ============================================

export interface ProUser {
  user: User
  profile: {
    id: string
    role: 'chef' | 'azubi' | 'partner' | 'admin'
    roles?: string[] | null
    company_name?: string | null
  } | null
}

/**
 * Sign in Pro/Partner user with email and password
 */
export async function signInPro(email: string, password: string): Promise<{ user: ProUser | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error as Error }
    }

    if (!data.user) {
      return { user: null, error: new Error("No user returned from sign in") }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, roles, company_name")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      // User exists but no profile - might be a new user
      return { 
        user: { 
          user: data.user, 
          profile: null 
        }, 
        error: null 
      }
    }

    // Check if user has Pro/Partner role
    if (profile.role !== 'chef' && profile.role !== 'azubi' && profile.role !== 'partner' && profile.role !== 'admin') {
      return { 
        user: null, 
        error: new Error("User does not have Pro/Partner access") 
      }
    }

    return {
      user: {
        user: data.user,
          profile,
      },
      error: null,
    }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

/**
 * Get current Pro/Partner user with profile
 */
export async function getCurrentProUser(): Promise<ProUser | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role, roles, company_name")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    // Check if user has Pro/Partner role
    if (profile.role !== 'chef' && profile.role !== 'azubi' && profile.role !== 'partner' && profile.role !== 'admin') {
      return null
    }

    return {
      user,
      profile,
    }
  } catch (error) {
    console.error("Error getting current Pro user:", error)
    return null
  }
}

/**
 * Sign out Pro/Partner user
 */
export async function signOutPro(): Promise<void> {
  return signOut()
}

/**
 * Require authentication - throws error if not authenticated
 * Use in server components or API routes
 */
export async function requireAuth(): Promise<ProUser> {
  const proUser = await getCurrentProUser()
  if (!proUser) {
    throw new Error("Authentication required")
  }
  return proUser
}
