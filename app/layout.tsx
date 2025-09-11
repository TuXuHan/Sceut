import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./auth-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sceut | 發現您的專屬香水",
  description: "通過我們的香水測驗，發現最適合您的香水。每月精選香水訂閱服務，讓您探索世界各地的獨特香氛。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
