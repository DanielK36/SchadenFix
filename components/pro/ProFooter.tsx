import Link from "next/link"

export default function ProFooter() {
  return (
    <footer className="pro-footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>© 2024 ProCockpit</span>
          <span>·</span>
          <Link href="/impressum">Impressum</Link>
          <span>·</span>
          <Link href="/datenschutz">Datenschutz</Link>
          <span>·</span>
          <Link href="/agb">AGB</Link>
        </div>
      </div>
    </footer>
  )
}

