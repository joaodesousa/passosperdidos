import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "./components/header"
import Footer from "./components/footer"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Passos Perdidos - Acompanhe as Iniciativas Legislativas da Assembleia da República",
  description: "Passos Perdidos oferece uma visão detalhada e atualizada das iniciativas legislativas em curso na Assembleia da República de Portugal. Acompanhe a tramitação de propostas de lei, resoluções e outros projetos.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <script defer src="https://umami.outplay.cloud/script.js" data-website-id="243b9f60-e688-4dd3-b346-f79700c6e926"></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#09090B]">
            <Header />
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

