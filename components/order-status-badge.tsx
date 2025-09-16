import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

const statusConfig = {
  // 處理中狀態
  processing: {
    variant: "processing" as const,
    text: "處理中",
    icon: "⏳"
  },
  pending: {
    variant: "pending" as const,
    text: "待處理",
    icon: "⏳"
  },
  created: {
    variant: "created" as const,
    text: "已建立",
    icon: "📝"
  },
  
  // 付款狀態
  paid: {
    variant: "paid" as const,
    text: "已付款",
    icon: "💳"
  },
  
  // 配送狀態
  shipped: {
    variant: "shipped" as const,
    text: "已出貨",
    icon: "🚚"
  },
  delivered: {
    variant: "delivered" as const,
    text: "已送達",
    icon: "✅"
  },
  
  // 取消狀態
  cancelled: {
    variant: "cancelled" as const,
    text: "已取消",
    icon: "❌"
  },
  
  // 預設狀態
  default: {
    variant: "secondary" as const,
    text: "未知狀態",
    icon: "❓"
  }
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn("flex items-center gap-1", className)}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.text}</span>
    </Badge>
  )
}

// 訂閱狀態 Badge 組件
interface SubscriptionStatusBadgeProps {
  status: string
  className?: string
}

const subscriptionStatusConfig = {
  active: {
    variant: "active" as const,
    text: "訂閱中",
    icon: "🟢"
  },
  inactive: {
    variant: "inactive" as const,
    text: "非活躍",
    icon: "⚪"
  },
  terminated: {
    variant: "terminated" as const,
    text: "已取消",
    icon: "🔴"
  },
  default: {
    variant: "secondary" as const,
    text: "未知狀態",
    icon: "❓"
  }
}

export function SubscriptionStatusBadge({ status, className }: SubscriptionStatusBadgeProps) {
  const config = subscriptionStatusConfig[status as keyof typeof subscriptionStatusConfig] || subscriptionStatusConfig.default
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn("flex items-center gap-1", className)}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.text}</span>
    </Badge>
  )
}
