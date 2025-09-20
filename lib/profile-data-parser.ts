/**
 * 個人資料解析器 - 處理資料庫欄位錯亂的情況
 */

export interface ParsedProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  "711": string
}

/**
 * 智能解析個人資料，處理欄位錯亂的情況
 */
export function parseProfileData(rawData: any): ParsedProfile | null {
  if (!rawData) return null

  console.log("🔍 解析原始資料:", rawData)

  // 根據你提供的資料結構，我們需要智能識別每個欄位的實際內容
  const fields = {
    id: rawData.id,
    name: rawData.name,
    phone: rawData.phone,
    address: rawData.address,
    city: rawData.city,
    postal_code: rawData.postal_code,
    country: rawData.country,
    email: rawData.email,
    "711": rawData["711"]
  }

  console.log("📋 原始欄位:", fields)

  // 智能識別邏輯
  const parsed: ParsedProfile = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    "711": ""
  }

  // 1. 識別姓名 - 通常是中文名字
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      // 檢查是否為中文姓名（2-4個中文字符）
      if (/^[\u4e00-\u9fa5]{2,4}$/.test(value.trim()) && !parsed.name) {
        parsed.name = value.trim()
        console.log(`✅ 識別姓名: ${key} = ${value}`)
        break
      }
    }
  }

  // 2. 識別電話 - 通常是數字開頭的字符串
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      // 檢查是否為電話號碼格式
      if (/^0\d{8,9}$/.test(value.trim()) && !parsed.phone) {
        parsed.phone = value.trim()
        console.log(`✅ 識別電話: ${key} = ${value}`)
        break
      }
    }
  }

  // 3. 識別地址 - 包含"路"、"街"、"號"等地址關鍵字
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      // 檢查是否包含地址關鍵字
      if (/[路街巷弄號樓]/.test(value.trim()) && !parsed.address) {
        parsed.address = value.trim()
        console.log(`✅ 識別地址: ${key} = ${value}`)
        break
      }
    }
  }

  // 4. 識別城市 - 通常是"市"、"縣"結尾
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      // 檢查是否為城市名稱
      if (/[市縣]$/.test(value.trim()) && !parsed.city) {
        parsed.city = value.trim()
        console.log(`✅ 識別城市: ${key} = ${value}`)
        break
      }
    }
  }

  // 5. 識別郵遞區號 - 純數字，3-5位
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      // 檢查是否為郵遞區號
      if (/^\d{3,5}$/.test(value.trim()) && !parsed.postal_code) {
        parsed.postal_code = value.trim()
        console.log(`✅ 識別郵遞區號: ${key} = ${value}`)
        break
      }
    }
  }

  // 6. 識別國家 - 通常是"台灣"
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && value.trim()) {
      if (value.trim() === "台灣" && !parsed.country) {
        parsed.country = value.trim()
        console.log(`✅ 識別國家: ${key} = ${value}`)
        break
      }
    }
  }

  // 7. 識別郵箱 - 包含@符號
  if (fields.email && typeof fields.email === 'string' && fields.email.includes('@')) {
    parsed.email = fields.email.trim()
    console.log(`✅ 識別郵箱: email = ${fields.email}`)
  }

  // 8. 識別711門市 - 直接從711欄位取得
  if (fields["711"] && typeof fields["711"] === 'string' && fields["711"].trim()) {
    parsed["711"] = fields["711"].trim()
    console.log(`✅ 識別711門市: 711 = ${fields["711"]}`)
  }

  console.log("📋 解析結果:", parsed)

  return parsed
}

/**
 * 檢查個人資料是否完整
 * 新政策：只檢查縣市名稱和711門市
 */
export function isProfileComplete(parsedData: ParsedProfile | null): boolean {
  if (!parsedData) return false

  const hasName = !!(parsedData.name && parsedData.name.trim())
  const hasPhone = !!(parsedData.phone && parsedData.phone.trim())
  const hasCity = !!(parsedData.city && parsedData.city.trim())
  const has711 = !!(parsedData["711"] && parsedData["711"].trim())
  const hasEmail = !!(parsedData.email && parsedData.email.trim())

  console.log("🔍 完整性檢查:", {
    hasName,
    hasPhone,
    hasCity,
    has711,
    hasEmail,
    complete: hasName && hasPhone && hasCity && has711 && hasEmail
  })

  // 新政策：縣市和711門市必填，地址選填
  return hasName && hasPhone && hasCity && has711 && hasEmail
}
