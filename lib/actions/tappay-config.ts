"use server"

export async function getTapPayConfig() {
  // Verify that required environment variables are available
  const appId = process.env.NEXT_PUBLIC_TAPPAY_APP_ID
  const appKey = process.env.NEXT_PUBLIC_TAPPAY_APP_KEY
  const serverType = process.env.NEXT_PUBLIC_TAPPAY_SERVER_TYPE

  if (!appId || !appKey || !serverType) {
    throw new Error("TapPay configuration is incomplete")
  }

  // Return only the client-side configuration
  // Note: These are meant to be public according to TapPay docs, but we fetch them server-side for better security
  return {
    appId,
    appKey,
    serverType: serverType as "sandbox" | "production",
  }
}
