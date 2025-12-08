import { ClaimInput } from "@/lib/schemas/claim"

export interface Claim extends Omit<ClaimInput, "consents"> {
  id: string
  createdAt: string
  status: "eingegangen" | "weitergeleitet" | "in_bearbeitung" | "abgeschlossen"
  routedPartners: Array<{
    name: string
    email: string
    whatsapp?: string
  }>
}

export interface ClaimsRepository {
  create(claim: ClaimInput): Promise<Claim>
  findById(id: string): Promise<Claim | null>
  findAll(): Promise<Claim[]>
}

// In-Memory implementation for development
class InMemoryClaimsRepository implements ClaimsRepository {
  private claims: Map<string, Claim> = new Map()

  async create(claim: ClaimInput): Promise<Claim> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const newClaim: Claim = {
      ...claim,
      id,
      createdAt: now,
      status: "eingegangen",
      routedPartners: [],
    }
    
    this.claims.set(id, newClaim)
    return newClaim
  }

  async findById(id: string): Promise<Claim | null> {
    return this.claims.get(id) || null
  }

  async findAll(): Promise<Claim[]> {
    return Array.from(this.claims.values())
  }
}

// Supabase implementation (stub for now)
class SupabaseClaimsRepository implements ClaimsRepository {
  async create(claim: ClaimInput): Promise<Claim> {
    // TODO: Implement Supabase insertion
    throw new Error("Supabase not configured")
  }

  async findById(id: string): Promise<Claim | null> {
    // TODO: Implement Supabase query
    throw new Error("Supabase not configured")
  }

  async findAll(): Promise<Claim[]> {
    // TODO: Implement Supabase query
    throw new Error("Supabase not configured")
  }
}

// Factory function
export function getClaimsRepository(): ClaimsRepository {
  const useSupabase = process.env.USE_SUPABASE === "true"
  
  if (useSupabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return new SupabaseClaimsRepository()
  }
  
  return new InMemoryClaimsRepository()
}

