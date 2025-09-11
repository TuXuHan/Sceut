interface ShippingAddress {
  name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

export interface Subscription {
  id: string
  user_id: string
  status: "active" | "paused" | "cancelled" | "pending"
  created_at: string
  updated_at: string
  subscription_plan?: string
  monthly_fee: number
  shipping_address?: ShippingAddress
  billing_address?: ShippingAddress
  payment_method?: string
  notes?: string
}

export interface QuizData {
  id: string
  user_id: string
  quiz_completed: boolean
  quiz_results: any
  preferences: any
  created_at: string
  updated_at: string
}
