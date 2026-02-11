/**
 * Gewerke-Konstanten für das gesamte System
 * 
 * Diese Datei enthält die zentralen Definitionen für alle verfügbaren Gewerke
 * mit ihren Icons und Labels. Diese werden verwendet in:
 * - Admin Routing Rules
 * - Pro-Registrierung
 * - Assignment Settings
 * - Partner-Verwaltung
 */

export const professionIcons: Record<string, string> = {
  maler: "🎨",
  trocknung: "💨",
  gutachter: "📋",
  bodenleger: "🔨",
  sanitaer: "🔧",
  dachdecker: "🏠",
  kfz: "🚗",
  glas: "🪟",
  rechtsfall: "⚖️",
}

export const professionLabels: Record<string, string> = {
  maler: "Maler",
  trocknung: "Trocknung",
  gutachter: "Gutachter",
  bodenleger: "Bodenleger",
  sanitaer: "Sanitär",
  dachdecker: "Dachdecker",
  kfz: "KFZ",
  glas: "Glas",
  rechtsfall: "Rechtsfall",
}

/**
 * Liste aller verfügbaren Gewerke (Schlüssel)
 */
export const availableProfessions = Object.keys(professionLabels)

/**
 * Gewerke als Array von Objekten mit allen Informationen
 */
export const professionOptions = availableProfessions.map((key) => ({
  key,
  icon: professionIcons[key] || "🔧",
  label: professionLabels[key] || key,
}))
