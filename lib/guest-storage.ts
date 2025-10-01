// Guest用户（未注册）的本地存储工具类

const GUEST_QUIZ_KEY = 'sceut_guest_quiz_answers'
const GUEST_QUIZ_TIMESTAMP_KEY = 'sceut_guest_quiz_timestamp'

export interface GuestQuizAnswers {
  gender?: string
  scent?: string
  mood?: string
  occasion?: string
}

export class GuestStorage {
  // 保存guest用户的quiz答案
  static saveGuestQuizAnswers(answers: GuestQuizAnswers): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(GUEST_QUIZ_KEY, JSON.stringify(answers))
      localStorage.setItem(GUEST_QUIZ_TIMESTAMP_KEY, Date.now().toString())
      console.log('✅ Guest quiz答案已保存:', answers)
    } catch (error) {
      console.error('❌ 保存guest quiz答案失败:', error)
    }
  }

  // 获取guest用户的quiz答案
  static getGuestQuizAnswers(): GuestQuizAnswers | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(GUEST_QUIZ_KEY)
      if (!stored) return null

      const answers = JSON.parse(stored)
      console.log('📱 读取guest quiz答案:', answers)
      return answers
    } catch (error) {
      console.error('❌ 读取guest quiz答案失败:', error)
      return null
    }
  }

  // 清除guest用户的quiz答案
  static clearGuestQuizAnswers(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(GUEST_QUIZ_KEY)
      localStorage.removeItem(GUEST_QUIZ_TIMESTAMP_KEY)
      console.log('✅ Guest quiz答案已清除')
    } catch (error) {
      console.error('❌ 清除guest quiz答案失败:', error)
    }
  }

  // 检查guest答案是否存在
  static hasGuestQuizAnswers(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(GUEST_QUIZ_KEY) !== null
  }

  // 获取答案的时间戳（用于判断答案新鲜度）
  static getGuestQuizTimestamp(): number | null {
    if (typeof window === 'undefined') return null

    try {
      const timestamp = localStorage.getItem(GUEST_QUIZ_TIMESTAMP_KEY)
      return timestamp ? parseInt(timestamp, 10) : null
    } catch (error) {
      return null
    }
  }

  // 检查答案是否过期（超过7天）
  static isGuestQuizExpired(): boolean {
    const timestamp = this.getGuestQuizTimestamp()
    if (!timestamp) return true

    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return Date.now() - timestamp > sevenDays
  }

  // 迁移guest答案到用户账号（注册后调用）
  static migrateGuestAnswersToUser(userId: string): GuestQuizAnswers | null {
    const guestAnswers = this.getGuestQuizAnswers()
    
    if (guestAnswers) {
      console.log('🔄 迁移guest答案到用户账号:', userId)
      // 这里只返回答案，由调用方决定如何处理
      return guestAnswers
    }

    return null
  }
}

