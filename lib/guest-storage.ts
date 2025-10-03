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
    } catch (error) {
      console.error('保存guest答案失败:', error)
    }
  }

  // 获取guest用户的quiz答案
  static getGuestQuizAnswers(): GuestQuizAnswers | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(GUEST_QUIZ_KEY)
      if (!stored) return null
      return JSON.parse(stored)
    } catch (error) {
      console.error('读取guest答案失败:', error)
      return null
    }
  }

  // 清除guest用户的quiz答案
  static clearGuestQuizAnswers(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(GUEST_QUIZ_KEY)
      localStorage.removeItem(GUEST_QUIZ_TIMESTAMP_KEY)
    } catch (error) {
      console.error('清除guest答案失败:', error)
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
    return guestAnswers || null
  }
}
