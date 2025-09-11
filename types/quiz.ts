export interface QuizAnswers {
  gender?: string
  style?: string
  personality?: string
  scent_preference?: string
  occasion?: string
  intensity?: string
  [key: string]: any
}

export interface QuizData {
  id: string
  user_id: string
  quiz_completed: boolean
  quiz_results: QuizAnswers
  preferences: any
  created_at: string
  updated_at: string
}
