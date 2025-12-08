import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

/**
 * Setup endpoint - creates a default profile if none exists
 * Call this once: GET /api/setup
 */
export async function GET(request: NextRequest) {
  try {
    // Check if any profiles exist
    const { data: existingProfiles, error: checkError } = await supabaseServer
      .from("profiles")
      .select("id")
      .limit(1)

    if (checkError) {
      console.error("Supabase error:", checkError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to check profiles", 
          details: checkError.message,
          hint: checkError.code === "PGRST301" || checkError.message.includes("Invalid API key")
            ? "Please check your SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
            : checkError.message
        },
        { status: 500 }
      )
    }

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Profiles already exist",
        count: existingProfiles.length,
      })
    }

    // Create a system user first, then the profile
    // We need to create an auth user first because profiles.id references auth.users(id)
    const systemEmail = `system-${Date.now()}@system.local`
    const systemPassword = crypto.randomUUID() // Random password
    
    const { data: authUser, error: authError } = await supabaseServer.auth.admin.createUser({
      email: systemEmail,
      password: systemPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "System Admin",
        is_system: true,
      },
    })

    if (authError || !authUser.user) {
      // If we can't create an auth user, try to use an existing one
      const { data: existingUsers } = await supabaseServer.auth.admin.listUsers()
      
      if (!existingUsers || existingUsers.users.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Failed to create system user",
            details: authError?.message || "No users found and cannot create new one",
            hint: "Please create a user manually in Supabase Auth, or run the SQL script in supabase/create_default_profile.sql"
          },
          { status: 500 }
        )
      }

      // Use the first existing user
      const userId = existingUsers.users[0].id
      
      // Check if profile already exists
      const { data: existingProfile } = await supabaseServer
        .from("profiles")
        .select("id, role, company_id")
        .eq("id", userId)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabaseServer
          .from("profiles")
          .update({
            role: "chef",
            company_id: existingProfile.company_id || userId,
            company_name: "Default Company",
          })
          .eq("id", userId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            { success: false, error: "Failed to update profile", details: updateError.message },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: "Profile already existed, updated to chef role",
          profile: {
            id: updatedProfile.id,
            role: updatedProfile.role,
            company_id: updatedProfile.company_id,
          },
        })
      }

      // Create new profile
      const { data: newProfile, error: createError } = await supabaseServer
        .from("profiles")
        .insert({
          id: userId,
          role: "chef",
          company_id: userId, // Self-reference
          company_name: "Default Company",
          full_name: existingUsers.users[0].user_metadata?.full_name || "System Admin",
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { success: false, error: "Failed to create profile", details: createError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Default profile created successfully using existing user",
        profile: {
          id: newProfile.id,
          role: newProfile.role,
          company_id: newProfile.company_id,
        },
      })
    }

    // Create profile for the new auth user
    const userId = authUser.user.id
    
    // Check if profile already exists (shouldn't happen, but just in case)
    const { data: existingProfile } = await supabaseServer
      .from("profiles")
      .select("id, role, company_id")
      .eq("id", userId)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabaseServer
        .from("profiles")
        .update({
          role: "chef",
          company_id: existingProfile.company_id || userId,
          company_name: "Default Company",
        })
        .eq("id", userId)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { success: false, error: "Failed to update profile", details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Profile already existed, updated to chef role",
        profile: {
          id: updatedProfile.id,
          role: updatedProfile.role,
          company_id: updatedProfile.company_id,
        },
      })
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabaseServer
      .from("profiles")
      .insert({
        id: userId,
        role: "chef",
        company_id: userId, // Self-reference
        company_name: "Default Company",
        full_name: "System Admin",
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { success: false, error: "Failed to create profile", details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Default profile created successfully",
      profile: {
        id: newProfile.id,
        role: newProfile.role,
        company_id: newProfile.company_id,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

