"use client"

import { useState } from "react"
import { StarRating } from "./star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CommentSectionProps {
  orderId: string
  onSubmit?: (rating: number, comment: string) => void
  initialRating?: number
  initialComment?: string
  disabled?: boolean
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  orderId,
  onSubmit,
  initialRating = 0,
  initialComment = "",
  disabled = false
}) => {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("請先選擇評分")
      return
    }

    setIsSubmitting(true)
    
    try {
      if (onSubmit) {
        await onSubmit(rating, comment)
      }
      
      // 重置表單
      setRating(0)
      setComment("")
      
      alert(`評分已提交！你給了 ${rating} 顆星`)
    } catch (error) {
      console.error("提交評分失敗:", error)
      alert("提交失敗，請稍後再試")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">為此訂單評分</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <StarRating 
            onRate={setRating} 
            initialRating={rating}
            disabled={disabled}
            size="md"
          />
          <span className="text-sm text-gray-600">
            {rating > 0 ? `${rating} 顆星` : "請選擇評分"}
          </span>
        </div>
        
        <Textarea
          placeholder="寫下你的評論...（選填）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled}
          className="min-h-[80px] resize-none"
        />
        
        <Button 
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || rating === 0}
          className="w-full"
          size="sm"
        >
          {isSubmitting ? "提交中..." : "提交評分"}
        </Button>
      </CardContent>
    </Card>
  )
}

