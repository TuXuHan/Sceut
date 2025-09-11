"use server"

export async function getTapPayConfig() {
  const appId = process.env.TAPPAY_APP_ID
  const appKey = process.env.TAPPAY_APP_KEY
  const serverType = process.env.TAPPAY_SERVER_TYPE

  if (!appId || !appKey || !serverType) {
    throw new Error("TapPay configuration is incomplete")
  }

  // Return configuration fetched server-side for security
  return {
    appId,
    appKey,
    serverType: serverType as "sandbox" | "production",
  }
}
