import { NextRequest, NextResponse } from "next/server"
import { claimSchema, ClaimInput } from "@/lib/schemas/claim"
import { getClaimsRepository } from "@/lib/repo/claims"
import { routePartnerFromPayload } from "@/lib/partner-routing"
import {
  sendCustomerConfirmationEmail,
  sendInternalNotificationEmail,
  sendPartnerEmail,
} from "@/lib/email"
import { supabaseServer } from "@/lib/supabase-server"
import { randomUUID } from "crypto"
import { autoAssignOnCreate } from "@/services/assignmentService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = claimSchema.parse(body)
    
    // Get repository
    const repo = getClaimsRepository()
    
    // Route partners first (before creating claim)
    const routingResult = routePartnerFromPayload(validatedData)
    
    // Analytics: Routing target
    console.log(`📊 Analytics: routing_target`, {
      internalOnly: routingResult.internalOnly,
      partnerCount: routingResult.partners.length,
      partners: routingResult.partners.map((p) => p.name),
    })
    
    // Create claim with partners
    const claim = await repo.create(validatedData)
    // Update claim with routed partners
    if (claim.routedPartners) {
      claim.routedPartners = routingResult.partners
    }

    // Create Order in Supabase for Pro-System (must succeed, otherwise the workflow can't continue)
    // IMPORTANT: Customer submits are unauthenticated -> this requires service role (RLS bypass).
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY fehlt. Ohne Service-Role kann ein anonymer Kunde wegen RLS keinen Auftrag in `orders` anlegen.",
        },
        { status: 500 }
      )
    }

    // Map claim type to order type
    const typeMap: Record<string, string> = {
      kfz: "kfz",
      glas: "glas",
      wasser: "wasser",
      feuer: "feuer",
      gebaeude: "gebaeude",
      sturm: "gebaeude",
      recht: "rechtsfall",
      sonstiges: "wasser",
    }

    const orderType = typeMap[validatedData.type] || "wasser"

    // Find or create Chef profile - company_id = Chef-Profil-ID
    let chefProfile: { id: string } | null = null
    
    const { data: chefProfiles, error: chefError } = await supabaseServer
      .from("profiles")
      .select("id")
      .eq("role", "chef")
      .limit(1)

    if (chefError) {
      console.error("❌ Error loading chef profile:", chefError)
      return NextResponse.json(
        {
          success: false,
          error: "Chef-Profil konnte nicht geladen werden.",
          details: chefError,
        },
        { status: 500 }
      )
    }

    chefProfile = chefProfiles && chefProfiles.length > 0 ? chefProfiles[0] : null

    // Auto-create chef profile if none exists
    if (!chefProfile) {
      console.log("⚠️ No chef profile found, creating one...")
      
      try {
        // Create a system auth user first
        const systemEmail = `system-${Date.now()}@schadenportal.local`
        const systemPassword = randomUUID()
        
        const { data: authUser, error: authError } = await supabaseServer.auth.admin.createUser({
          email: systemEmail,
          password: systemPassword,
          email_confirm: true,
          user_metadata: {
            full_name: "System Chef",
            is_system: true,
          },
        })

        if (authError || !authUser.user) {
          console.error("❌ Failed to create auth user:", authError)
          return NextResponse.json(
            {
              success: false,
              error: "System-Benutzer konnte nicht erstellt werden.",
              details: authError,
            },
            { status: 500 }
          )
        }

        // Create chef profile
        const { data: newProfile, error: profileError } = await supabaseServer
          .from("profiles")
          .insert({
            id: authUser.user.id,
            role: "chef",
            company_name: "Default Company",
          })
          .select("id")
          .single()

        if (profileError || !newProfile) {
          console.error("❌ Failed to create chef profile:", profileError)
          return NextResponse.json(
            {
              success: false,
              error: "Chef-Profil konnte nicht erstellt werden.",
              details: profileError,
            },
            { status: 500 }
          )
        }

        chefProfile = newProfile
        console.log("✅ Created chef profile:", chefProfile.id)
      } catch (createError: any) {
        console.error("❌ Error creating chef profile:", createError)
        return NextResponse.json(
          {
            success: false,
            error: "Fehler beim Erstellen des Chef-Profils.",
            details: createError?.message || createError,
          },
          { status: 500 }
        )
      }
    }

    const companyId = chefProfile.id

    // Persist the full intake payload (your form data) alongside the order.
    // This makes the data visible in Supabase and available to Admin flows.
    const intake = {
      ...validatedData,
      routedPartners: routingResult.partners,
      ticketId: claim.id,
    }

    // Store ALL form data in orders.customer_data.claim (single source of truth)
    // No order_wizard_data needed for customer claims - that's only for Azubi wizard
    const customerData = {
      name: validatedData.contact.name,
      email: validatedData.contact.email,
      phone: validatedData.contact.phone,
      address: validatedData.locationText || "",
      zip: validatedData.plz || "",
      city: "", // Ort/Adresse steht in address (locationText); kein separates Stadtfeld im Formular
      claim: intake, // Complete form data including photos, routedPartners, ticketId
      photos: validatedData.photos || [], // Also store photos directly in customer_data for easy access
    }

    const description =
      validatedData.description || `${validatedData.type} Schaden`

    // Affiliate tracking: resolve ref code to partner_id
    const requestUrl = new URL(request.url)
    const refCode = requestUrl.searchParams.get("ref")
    let affiliatePartnerId: string | null = null
    let affiliateLinkConversions = 0
    
    console.log(`🔍 Referral code check: refCode="${refCode}"`)
    
    if (refCode) {
      const { data: link, error: linkError } = await supabaseServer
        .from("affiliate_links")
        .select("partner_id, conversions")
        .eq("code", refCode)
        .maybeSingle()

      if (linkError) {
        console.warn("⚠️ Affiliate link lookup failed:", linkError.message)
      } else if (link?.partner_id) {
        affiliatePartnerId = link.partner_id
        affiliateLinkConversions = Number(link.conversions || 0)
        console.log(`✅ Referral code found: partner_id=${affiliatePartnerId}, conversions=${affiliateLinkConversions}`)
      } else {
        console.warn(`⚠️ Referral code "${refCode}" not found in affiliate_links`)
      }
    } else {
      console.log("ℹ️ No referral code in URL")
    }

    console.log("🔍 Inserting order with customer_data.claim:", JSON.stringify(customerData.claim, null, 2).substring(0, 200))
    console.log(`🔍 Will set assigned_partner_id: ${affiliatePartnerId || "null"}`)

    const insertData: any = {
      type: orderType,
      customer_data: customerData as any, // Explicit cast to ensure JSONB serialization
      description,
      company_id: companyId,
      status: "neu",
    }
    
    if (affiliatePartnerId) {
      insertData.assigned_partner_id = affiliatePartnerId
      console.log(`📝 Adding assigned_partner_id=${affiliatePartnerId} to insert`)
    }

    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .insert(insertData)
      .select("id, customer_data, assigned_partner_id")
      .single()

    // Verify what was actually saved
    if (order) {
      const savedCustomerData = (order as any).customer_data
      const savedAssignedPartnerId = (order as any).assigned_partner_id
      console.log("✅ Order saved. customer_data.claim exists:", !!savedCustomerData?.claim)
      console.log(`✅ Order saved. assigned_partner_id: ${savedAssignedPartnerId || "null"}`)
      if (affiliatePartnerId && !savedAssignedPartnerId) {
        console.error(`❌ ERROR: assigned_partner_id was not saved! Expected: ${affiliatePartnerId}, Got: ${savedAssignedPartnerId}`)
        console.error("   This might mean the column doesn't exist in the database. Please run the migration: supabase/migrations/20250122_orders_assigned_partner_id.sql")
      }
      if (!savedCustomerData?.claim) {
        console.error("❌ ERROR: customer_data.claim was not saved! Full customer_data:", JSON.stringify(savedCustomerData, null, 2))
      } else {
        console.log("✅ Successfully saved claim data in orders.customer_data.claim")
      }
    }

    if (orderError || !order?.id) {
      console.error("❌ Order insert failed:", orderError)
      if (orderError?.message?.includes("assigned_partner_id")) {
        console.error("   ERROR: assigned_partner_id column might not exist. Please run migration: supabase/migrations/20250122_orders_assigned_partner_id.sql")
      }
      return NextResponse.json(
        {
          success: false,
          error: "Auftrag konnte nicht in `orders` gespeichert werden.",
          details: orderError || { message: "No order id returned" },
        },
        { status: 500 }
      )
    }

    // Track affiliate conversion
    if (affiliatePartnerId && refCode) {
      await supabaseServer
        .from("affiliate_links")
        .update({ conversions: affiliateLinkConversions + 1 })
        .eq("code", refCode)
    }

    // Create commission entry for affiliate partner if available
    if (affiliatePartnerId) {
      await supabaseServer
        .from("partner_commissions")
        .insert({
          partner_id: affiliatePartnerId,
          order_id: order.id,
          amount: 0,
          commission_rate: 10.0,
          status: "PENDING",
        })
    }

    // Automatische Zuweisung basierend auf Routing Rules (Handwerker oder Partner)
    try {
      const assignmentResult = await autoAssignOnCreate({
        order: {
          id: order.id,
          type: orderType,
          customer_data: customerData as any,
        },
      })

      if (assignmentResult.applied) {
        console.log(`✅ Automatische Zuweisung erfolgreich:`, {
          assigneeId: assignmentResult.assigneeId,
          assigneeType: assignmentResult.assigneeType,
        })
      } else {
        console.log(`ℹ️ Keine automatische Zuweisung:`, {
          reason: assignmentResult.reason,
        })
      }
    } catch (assignmentError) {
      // Fehler bei automatischer Zuweisung sollte den Order nicht blockieren
      console.error("⚠️ Fehler bei automatischer Zuweisung (nicht kritisch):", assignmentError)
    }
    
    // Send emails
    try {
      await sendCustomerConfirmationEmail(claim, claim.id, routingResult)
    } catch (error) {
      console.error("Customer email failed:", error)
    }
    
    try {
      await sendInternalNotificationEmail(claim, claim.id, routingResult)
    } catch (error) {
      console.error("Internal email failed:", error)
    }
    
    // Send emails to partners only if:
    // - Not "Nur Rückruf"
    // - Partner consent given
    // - Partners were routed
    if (!routingResult.internalOnly && validatedData.consents.partner && routingResult.partners.length > 0) {
      for (const partner of routingResult.partners) {
        try {
          await sendPartnerEmail(partner, claim, claim.id)
        } catch (error) {
          console.error(`Partner email to ${partner.name} failed:`, error)
        }
      }
    }
    
    // Send email to agent if consent given (stub for now)
    if (validatedData.consents.agent) {
      console.log("Agent notification would be sent (stub)")
    }
    
    const hasWorkshopBinding = validatedData.type === "kfz" && (validatedData as any).werkstattbindung === true
    
    // Redirect zur Danke-Seite
    const basePath = "/danke"
    
    // Redirect URL mit Parametern
    const redirectUrl = new URL(`${basePath}?ticket=${claim.id}`, process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    if (routingResult.internalOnly || routingResult.partners.length === 0) {
      redirectUrl.searchParams.set("onlyCallback", "true")
    }
    if (hasWorkshopBinding) {
      redirectUrl.searchParams.set("workshopBinding", "true")
    }
    if (routingResult.partners.length > 0) {
      redirectUrl.searchParams.set("partners", encodeURIComponent(JSON.stringify(routingResult.partners)))
    }
    
    return NextResponse.json(
      { 
        success: true, 
        ticketId: claim.id,
        redirectUrl: redirectUrl.pathname + redirectUrl.search,
        orderCreated: true,
        orderId: order.id,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Claim submission error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

