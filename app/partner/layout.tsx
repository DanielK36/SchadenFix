import PartnerLayout from "@/components/partner/PartnerLayout"
import { Toaster } from "sonner"
import "./partner-globals.css"

export default function PartnerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PartnerLayout>{children}</PartnerLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            color: "#EAEAEA",
          },
          className: "partner-toast",
        }}
      />
    </>
  )
}

