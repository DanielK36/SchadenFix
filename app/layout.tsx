import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UploadthingAppProvider } from "@/components/uploadthing-provider";
import { VersionSwitcher } from "@/components/v2/VersionSwitcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Schadenportal – Schnell, digital, persönlich",
  description: "Melden Sie Ihren Schaden in wenigen Minuten. Professionell, unkompliziert, vertrauenswürdig.",
  openGraph: {
    title: "Schadenportal – Schnell, digital, persönlich",
    description: "Melden Sie Ihren Schaden in wenigen Minuten. Professionell, unkompliziert, vertrauenswürdig.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UploadthingAppProvider>
            <VersionSwitcher />
            {children}
            <Toaster />
          </UploadthingAppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
