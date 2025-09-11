export interface Cardholder {
  name: string
  phone_number: string
  email: string
}

// TapPay Pay by Prime API - SERVER SIDE ONLY
export async function payByPrime(prime: string, amount: number, cardholder: Cardholder) {
  const serverType = (process.env.TAPPAY_SERVER_TYPE as "sandbox" | "production") || "sandbox"
  const tappayUrl =
    serverType === "production"
      ? "https://prod.tappaysdk.com/tpc/payment/pay-by-prime"
      : "https://sandbox.tappaysdk.com/tpc/payment/pay-by-token"

  const partnerKey = process.env.TAPPAY_PARTNER_KEY

  if (!partnerKey) {
    throw new Error("TapPay partner key is not configured.")
  }

  const payload = {
    prime,
    partner_key: partnerKey,
    merchant_id: process.env.TAPPAY_MERCHANT_ID, // Remove NEXT_PUBLIC_ prefix for security
    amount,
    currency: "TWD",
    details: "Sceut Perfume Subscription",
    cardholder: {
      name: cardholder.name,
      phone_number: cardholder.phone_number,
      email: cardholder.email,
    },
    three_domain_secure: true,
    result_url: {
      frontend_redirect_url: "https://sceut.com/subscription",
      backend_notify_url: "https://sceut.com/subscription",
    },
    remember: true,
  }
  console.log("🔍 Payload:", payload)

  const response = await fetch(tappayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": partnerKey,
    },
    body: JSON.stringify(payload),
  })

  const responseData = await response.json()

  return responseData
}

export async function payByToken(card_token: string, card_key: string, amount: number) {
  const serverType = (process.env.TAPPAY_SERVER_TYPE as "sandbox" | "production") || "sandbox"
  const tappayUrl =
    serverType === "production"
      ? "https://prod.tappaysdk.com/tpc/payment/pay-by-token"
      : "https://sandbox.tappaysdk.com/tpc/payment/pay-by-token"

  const partnerKey = process.env.TAPPAY_PARTNER_KEY

  if (!partnerKey) {
    throw new Error("TapPay partner key is not configured.")
  }

  const payload = {
    card_token,
    card_key,
    partner_key: partnerKey,
    merchant_id: process.env.TAPPAY_MERCHANT_ID, // Remove NEXT_PUBLIC_ prefix for security
    amount,
    currency: "TWD",
    details: "Sceut Perfume Subscription",
  }

  console.log("🔍 Payload:", payload)

  const response = await fetch(tappayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": partnerKey,
    },
    body: JSON.stringify(payload),
  })

  return await response.json()
}
