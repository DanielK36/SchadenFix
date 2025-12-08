import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Mock-Response - in Production würde hier die Datenbank-Speicherung erfolgen
    console.log("Gold Arc Rückruf-Anfrage:", body)

    // Simuliere kurze Verarbeitungszeit
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      { success: true, message: "Rückruf-Anfrage wurde erfolgreich übermittelt." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Fehler bei Gold Arc Rückruf:", error)
    return NextResponse.json(
      { success: false, message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}


