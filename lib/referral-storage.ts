/**
 * Referral-Code (ref) für Schadenmeldung über Session speichern und auslesen.
 * Verhindert, dass der Code beim Navigieren (z. B. zwischen Startseite und Melden) verloren geht.
 */
const STORAGE_KEY = "schaden_ref"

export function persistRefFromUrl(ref: string | null): void {
  if (typeof window === "undefined") return
  if (ref && ref.trim()) {
    sessionStorage.setItem(STORAGE_KEY, ref.trim())
  }
}

export function getRefForClaim(urlRef: string | null): string | null {
  if (typeof window === "undefined") return urlRef
  const fromUrl = urlRef?.trim()
  if (fromUrl) return fromUrl
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored?.trim() || null
}

export function clearRefAfterSubmit(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}
