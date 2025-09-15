"use client"

import { useEffect } from "react"

export default function AuthCallback() {
  useEffect(() => {
    window.location.replace("/login?success=verification_complete")
  }, [])

  return null
}
