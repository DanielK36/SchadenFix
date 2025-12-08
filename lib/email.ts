import { Resend } from "resend"
import { Claim } from "@/lib/repo/claims"
import { RoutingResult } from "@/lib/partner-routing"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendCustomerConfirmationEmail(
  claim: Claim,
  ticketId: string,
  routingResult: RoutingResult
): Promise<void> {
  if (!resend) {
    // Demo-Modus: Loggen statt senden
    console.log("=".repeat(60))
    console.log("📧 E-MAIL (DEMO) - An Kunde:")
    console.log("=".repeat(60))
    console.log(`An: ${claim.contact.email}`)
    console.log(`Betreff: Ihre Schadensmeldung ${ticketId}`)
    console.log(`Ticket-Nummer: ${ticketId}`)
    console.log(`Schadentyp: ${claim.type}`)
    console.log("=".repeat(60))
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "Schadenportal <noreply@schadenportal.de>",
      to: claim.contact.email,
      subject: `Ihre Schadensmeldung ${ticketId}`,
      html: `
        <h1>Vielen Dank für Ihre Schadensmeldung</h1>
        <p>Sehr geehrte/r ${claim.contact.name},</p>
        <p>Ihre Schadensmeldung wurde erfolgreich eingereicht.</p>
        <p><strong>Ticket-Nummer:</strong> ${ticketId}</p>
        <p><strong>Schadentyp:</strong> ${claim.type}</p>
        <p><strong>Datum:</strong> ${new Date(claim.occurredAt).toLocaleDateString("de-DE")}</p>
        ${routingResult.partners.length > 0 ? `<p><strong>Ihr Partner:</strong> ${routingResult.partners[0].name}</p>` : ""}
        ${claim.type === "kfz" && (claim as any).werkstattbindung ? `<p><strong>Hinweis:</strong> Ihr Vertrag enthält eine Werkstattbindung. Die Partnerwahl stimmt in der Regel Ihre Versicherung ab.</p>` : ""}
        <h2>So geht's weiter:</h2>
        <ul>
          <li>Bestätigung per E-Mail ist unterwegs.</li>
          ${routingResult.partners.length > 0 
            ? `<li><strong>${routingResult.partners[0].name}</strong> meldet sich i. d. R. <strong>innerhalb von 2–4 Std.</strong></li>`
            : `<li>Unser Team meldet sich i. d. R. <strong>innerhalb von 60 Min.</strong> bei Ihnen.</li>`}
          <li>Sie können Ihre Ticket-ID jederzeit angeben.</li>
        </ul>
        <p><strong>Notfälle:</strong> 02161 … (24/7)</p>
        <p>Mit freundlichen Grüßen,<br>Ihr Team Schadenportal</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send customer email:", error)
    throw error
  }
}

export async function sendInternalNotificationEmail(
  claim: Claim,
  ticketId: string,
  routingResult: RoutingResult
): Promise<void> {
  if (!resend) {
    // Demo-Modus: Loggen statt senden
    console.log("=".repeat(60))
    console.log("📧 E-MAIL (DEMO) - An interne Inbox:")
    console.log("=".repeat(60))
    console.log(`Ticket-ID: ${ticketId}`)
    console.log(`Typ: ${claim.type}`)
    console.log(`Kontakt: ${claim.contact.name} (${claim.contact.email}, ${claim.contact.phone})`)
    console.log(`Beschreibung: ${claim.description}`)
    console.log(`Ort: ${claim.locationText}, ${claim.plz}`)
    console.log(`Geroutete Partner: ${routingResult.partners.map(p => p.name).join(", ") || "Keine"}`)
    console.log(`Interner Fall: ${routingResult.internalOnly ? "Ja (Nur Rückruf)" : "Nein"}`)
    console.log("=".repeat(60))
    return
  }

  const photosList = claim.photos.length > 0
    ? `<ul>${claim.photos.map((url) => `<li><a href="${url}">${url}</a></li>`).join("")}</ul>`
    : "<p>Keine Fotos hochgeladen.</p>"

  const partnersList = routingResult.partners.length > 0
    ? `<ul>${routingResult.partners.map((p) => `<li>${p.name} (${p.email})</li>`).join("")}</ul>`
    : `<p>Keine Partner geroutet. ${routingResult.internalOnly ? "<strong>Interner Fall (Nur Rückruf) - SLA: 60 Min.</strong>" : ""}</p>`

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "Schadenportal <noreply@schadenportal.de>",
      to: process.env.INTERNAL_EMAIL || "service@schadenportal.de",
      subject: `Neue Schadensmeldung ${ticketId} - ${claim.type}`,
      html: `
        <h1>Neue Schadensmeldung</h1>
        <p><strong>Ticket-ID:</strong> ${ticketId}</p>
        <p><strong>Typ:</strong> ${claim.type}</p>
        <p><strong>Kontakt:</strong> ${claim.contact.name} (${claim.contact.email}, ${claim.contact.phone})</p>
        <p><strong>Beschreibung:</strong> ${claim.description}</p>
        <p><strong>Ort:</strong> ${claim.locationText}, ${claim.plz}</p>
        <p><strong>Datum/Uhrzeit:</strong> ${new Date(claim.occurredAt).toLocaleString("de-DE")}</p>
        ${claim.noticedAt ? `<p><strong>Bemerkt am:</strong> ${new Date(claim.noticedAt).toLocaleString("de-DE")}</p>` : ""}
        ${claim.guilt ? `<p><strong>Schuldfrage:</strong> ${claim.guilt}</p>` : ""}
        <p><strong>Wünsche:</strong> ${claim.wish.join(", ")}</p>
        <h2>Fotos:</h2>
        ${photosList}
        <h2>Geroutete Partner:</h2>
        ${partnersList}
      `,
    })
  } catch (error) {
    console.error("Failed to send internal email:", error)
    throw error
  }
}

export async function sendPartnerEmail(
  partner: Partner,
  claim: Claim,
  ticketId: string
): Promise<void> {
  if (!resend) {
    // Demo-Modus: Loggen statt senden
    console.log(`📧 E-MAIL (DEMO) - An Partner ${partner.name}: ${partner.email}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "Schadenportal <noreply@schadenportal.de>",
      to: partner.email,
      subject: `Neue Schadensmeldung ${ticketId}`,
      html: `
        <h1>Neue Schadensmeldung zugewiesen</h1>
        <p>Sehr geehrte/r ${partner.name},</p>
        <p>Ihnen wurde eine neue Schadensmeldung zugewiesen:</p>
        <p><strong>Ticket-ID:</strong> ${ticketId}</p>
        <p><strong>Typ:</strong> ${claim.type}</p>
        <p><strong>Ort:</strong> ${claim.locationText}, ${claim.plz}</p>
        <p><strong>Datum:</strong> ${new Date(claim.occurredAt).toLocaleDateString("de-DE")}</p>
        <p><strong>Beschreibung:</strong> ${claim.description}</p>
        ${claim.photos.length > 0 ? `<p><strong>Fotos:</strong> ${claim.photos.length} Fotos verfügbar</p>` : ""}
        <p>Bitte nehmen Sie Kontakt mit dem Kunden auf:</p>
        <p><strong>${claim.contact.name}</strong><br>
        E-Mail: ${claim.contact.email}<br>
        Telefon: ${claim.contact.phone}</p>
        <p>Mit freundlichen Grüßen,<br>Schadenportal</p>
      `,
    })
  } catch (error) {
    console.error(`Failed to send email to partner ${partner.name}:`, error)
    // Don't throw - continue with other partners
  }
}

