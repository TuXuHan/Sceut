"use client"

import { useState } from "react"

interface StarRatingProps {
  onRate?: (rating: number) => void
  initialRating?: number
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  onRate, 
  initialRating = 0, 
  disabled = false,
  size = "md"
}) => {
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(initialRating)

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl", 
    lg: "text-3xl"
  }

  const handleClick = (star: number) => {
    if (disabled) return
    
    setRating(star)
    onRate && onRate(star)
  }

  return (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => handleClick(star)}
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
          } ${disabled ? "cursor-not-allowed" : "hover:text-yellow-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

