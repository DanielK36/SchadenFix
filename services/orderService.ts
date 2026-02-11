import { supabase } from "@/lib/supabase"

// Types
export interface CustomerData {
  name: string
  address?: string
  zip?: string
  city?: string
  phone?: string
  email?: string
}

export type OrderStatus = "neu" | "bearbeitung" | "angebot" | "warte_auf_kunde" | "genehmigt" | "abgeschlossen" | "storniert"
export type OrderType = "wasser" | "feuer" | "kfz" | "glas" | "gebaeude" | "rechtsfall"

export interface CreateOrderData {
  type: OrderType
  customerData: CustomerData
  description?: string
  scheduledAt?: string
}

export interface WizardData {
  category_answers: Record<string, any>
  photos?: string[]
  voice_note_url?: string
  internal_notes?: string
}

export interface Order {
  id: string
  created_at: string
  updated_at: string
  status: OrderStatus
  type: OrderType
  customer_data: CustomerData
  assigned_to: string | null
  company_id: string
  scheduled_at: string | null
  description: string | null
  magic_token: string
  order_wizard_data?: {
    id: string
    category_answers: Record<string, any>
    photos: string[]
    voice_note_url: string | null
    internal_notes: string | null
    created_at: string
  }
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  // Get current user's profile
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) throw new Error("Profile not found")

  // If user is chef, company_id = their id. Otherwise find their chef.
  let companyId: string
  if (profile.role === "chef") {
    companyId = user.id
  } else {
    // For azubi/partner, find their chef (for now use their id as fallback)
    // TODO: Implement proper company relationship
    companyId = user.id
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      type: data.type,
      customer_data: data.customerData,
      description: data.description,
      scheduled_at: data.scheduledAt,
      company_id: companyId,
      status: "neu",
    })
    .select()
    .single()

  if (error) throw error
  return order
}

/**
 * Update order wizard data (from Azubi mobile app)
 */
export async function updateOrderWizardData(
  orderId: string,
  wizardData: WizardData
): Promise<void> {
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  // Check if order_wizard_data already exists
  const { data: existingData } = await supabase
    .from("order_wizard_data")
    .select("id")
    .eq("order_id", orderId)
    .single()

  if (existingData) {
    // Update existing
    const { error } = await supabase
      .from("order_wizard_data")
      .update({
        category_answers: wizardData.category_answers,
        photos: wizardData.photos || [],
        voice_note_url: wizardData.voice_note_url || null,
        internal_notes: wizardData.internal_notes || null,
      })
      .eq("order_id", orderId)

    if (error) throw error
  } else {
    // Create new
    const { error } = await supabase.from("order_wizard_data").insert({
      order_id: orderId,
      category_answers: wizardData.category_answers,
      photos: wizardData.photos || [],
      voice_note_url: wizardData.voice_note_url || null,
      internal_notes: wizardData.internal_notes || null,
      created_by: user.id,
    })

    if (error) throw error
  }

  // Update order status to "bearbeitung" if it was "neu"
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "bearbeitung" })
    .eq("id", orderId)
    .eq("status", "neu")

  if (orderError) throw orderError
}

/**
 * Get order by ID (for detail view)
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_wizard_data (
        id,
        category_answers,
        photos,
        voice_note_url,
        internal_notes,
        created_at
      )
    `
    )
    .eq("id", orderId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }

  return order
}

/**
 * Get all orders for the current user's company
 * Also includes orders assigned to the current user (assigned_to)
 */
export async function getOrdersByCompany(): Promise<Order[]> {
  // Get current user's profile
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) throw new Error("Profile not found")

  // If user is chef, company_id = their id. Otherwise find their chef.
  let companyId: string
  if (profile.role === "chef") {
    companyId = user.id
  } else {
    // For azubi/partner, find their chef (for now use their id as fallback)
    // TODO: Implement proper company relationship
    companyId = user.id
  }

  // Get orders where:
  // 1. company_id matches (orders from their company)
  // 2. OR assigned_to matches (orders assigned to this user)
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_wizard_data (
        id,
        category_answers,
        photos,
        voice_note_url,
        internal_notes,
        created_at
      )
    `
    )
    .or(`company_id.eq.${companyId},assigned_to.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) throw error
  return orders || []
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("User not authenticated")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) throw new Error("Profile not found")

  // If user is chef, company_id = their id. Otherwise find their chef.
  let companyId: string
  if (profile.role === "chef") {
    companyId = user.id
  } else {
    // For azubi/partner, find their chef (for now use their id as fallback)
    // TODO: Implement proper company relationship
    companyId = user.id
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_wizard_data (
        id,
        category_answers,
        photos,
        voice_note_url,
        internal_notes,
        created_at
      )
    `
    )
    .eq("company_id", companyId)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) throw error
  return orders || []
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)

  if (error) throw error
}

/**
 * Accept order (assign to current user)
 * Used when a handwerker accepts an order that was broadcast to multiple handwerkers
 * @param orderId - The order ID to accept
 * @param userId - The user ID to assign the order to (from authenticated request)
 */
export async function acceptOrder(orderId: string, userId: string): Promise<void> {
  // Check if order exists and is not already assigned
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, assigned_to, status")
    .eq("id", orderId)
    .single()

  if (orderError) throw orderError
  if (!order) throw new Error("Order not found")

  // Assign order to user and update status to "bearbeitung"
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      assigned_to: userId,
      status: "bearbeitung" 
    })
    .eq("id", orderId)

  if (updateError) throw updateError
}

/**
 * Assign order to employee
 */
export async function assignOrderToEmployee(
  orderId: string,
  employeeId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ assigned_to: employeeId })
    .eq("id", orderId)

  if (error) throw error
}

/**
 * Create invoice for order
 */
export async function createInvoice(
  orderId: string,
  invoiceData: {
    net_amount: number
    vat_rate: number
    gross_amount: number
    due_date: string
    description: string
  }
): Promise<string> {
  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      ...invoiceData,
    })
    .select("id")
    .single()

  if (error) throw error

  // Update order status to "angebot"
  await updateOrderStatus(orderId, "angebot")

  return data.id
}

