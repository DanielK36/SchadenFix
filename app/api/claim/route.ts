import { NextRequest, NextResponse } from "next/server"
import { claimSchema, ClaimInput } from "@/lib/schemas/claim"
import { getClaimsRepository } from "@/lib/repo/claims"
import { routePartnerFromPayload } from "@/lib/partner-routing"
import {
  sendCustomerConfirmationEmail,
  sendInternalNotificationEmail,
  sendPartnerEmail,
} from "@/lib/email"
import { createOrder } from "@/services/orderService"
import { supabaseServer } from "@/lib/supabase-server"

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

    // Create Order in Supabase for Pro-System
    try {
      // Map claim type to order type
      const typeMap: Record<string, string> = {
        kfz: "kfz",
        glas: "glas",
        wasser: "wasser",
        feuer: "feuer",
        gebaeude: "gebaeude",
        sturm: "gebaeude",
        recht: "rechtsfall",
        sonstiges: "wasser", // Default fallback
      }

      const orderType = typeMap[validatedData.type] || "wasser"

      // Get the first company profile (or create a default one)
      // Use server client to bypass RLS
      let companyId: string | null = null

      // Try to find a chef profile first
      const { data: chefProfiles, error: chefError } = await supabaseServer
        .from("profiles")
        .select("id, company_id")
        .eq("role", "chef")
        .limit(1)

      if (chefProfiles && chefProfiles.length > 0) {
        companyId = chefProfiles[0].company_id || chefProfiles[0].id
        console.log("✅ Found chef profile:", companyId)
      } else {
        // Fallback: Get any profile
        const { data: anyProfiles, error: anyError } = await supabaseServer
          .from("profiles")
          .select("id, company_id")
          .limit(1)

        if (anyProfiles && anyProfiles.length > 0) {
          companyId = anyProfiles[0].company_id || anyProfiles[0].id
          console.log("⚠️ No chef profile found, using first available profile:", companyId)
        } else {
          // Last resort: Try to create a default profile automatically
          console.warn("⚠️ No profiles found. Attempting to create default profile...")
          
          // Cannot create profile here because it requires an auth user
          // User must run /api/setup manually
          console.error("❌ Cannot create order: No profiles exist in the system.")
          console.error("Please visit http://localhost:3000/api/setup to create a default profile")
        }
      }

      if (companyId) {
        // Create customer data object
        const customerData = {
          name: validatedData.contact.name,
          email: validatedData.contact.email,
          phone: validatedData.contact.phone,
          address: validatedData.locationText || "",
          zip: validatedData.plz || "",
          city: validatedData.locationText || "", // Use locationText as city for now
        }

        // Create description from claim
        const description = validatedData.description || `${validatedData.type} Schaden`

        // Create order in Supabase using server client (bypasses RLS)
        const { data: order, error: orderError } = await supabaseServer
          .from("orders")
          .insert({
            type: orderType,
            customer_data: customerData,
            description: description,
            company_id: companyId,
            status: "neu",
          })
          .select()
          .single()

        if (orderError) {
          console.error("❌ Failed to create order in Supabase:", orderError)
          console.error("Order error code:", orderError.code)
          console.error("Order error message:", orderError.message)
          console.error("Order error details:", JSON.stringify(orderError, null, 2))
          console.error("Company ID used:", companyId)
          // Continue anyway - claim is created
        } else {
          console.log("✅ Order created in Supabase:", order.id)
          console.log("Order details:", JSON.stringify(order, null, 2))
        }
      } else {
        console.warn("⚠️ No company found - order not created.")
        console.warn("Please ensure you have a profile with role 'chef' in the profiles table.")
        console.warn("You can check this in Supabase: SELECT * FROM profiles WHERE role = 'chef';")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      // Continue anyway - claim is created
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
    
    // Prüfe ob Request von v2 oder v3 kommt
    const referer = request.headers.get("referer") || ""
    const isV2 = referer.includes("/v2/")
    const isV3 = referer.includes("/v3/")
    const basePath = isV3 ? "/v3/thanks" : isV2 ? "/v2/thanks" : "/danke"
    
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

