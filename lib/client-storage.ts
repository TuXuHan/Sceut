// 客戶端儲存工具類
export class ClientStorage {
  private static getKey(userId: string, key: string): string {
    return `sceut_${userId}_${key}`
  }

  // 儲存選中的香水
  static saveSelectedPerfume(userId: string, perfume: any): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "selected_perfume")
      localStorage.setItem(key, JSON.stringify(perfume))
      console.log("已儲存選中香水:", perfume)
    } catch (error) {
      console.error("儲存香水失敗:", error)
    }
  }

  // 獲取選中的香水
  static getSelectedPerfume(userId: string): any | null {
    if (typeof window === "undefined") return null

    try {
      const key = this.getKey(userId, "selected_perfume")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("獲取香水失敗:", error)
      return null
    }
  }

  // 儲存訂閱資訊
  static saveSubscription(userId: string, subscription: any): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "subscription")
      localStorage.setItem(key, JSON.stringify(subscription))
      console.log("已儲存訂閱資訊:", subscription)
    } catch (error) {
      console.error("儲存訂閱失敗:", error)
    }
  }

  // 獲取訂閱資訊
  static getSubscription(userId: string): any | null {
    if (typeof window === "undefined") return null

    try {
      const key = this.getKey(userId, "subscription")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("獲取訂閱失敗:", error)
      return null
    }
  }

  // 儲存問卷結果
  static saveQuizResults(userId: string, results: any): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "quiz_results")
      localStorage.setItem(key, JSON.stringify(results))
      console.log("已儲存問卷結果:", results)
    } catch (error) {
      console.error("儲存問卷結果失敗:", error)
    }
  }

  // 獲取問卷結果
  static getQuizResults(userId: string): any | null {
    if (typeof window === "undefined") return null

    try {
      const key = this.getKey(userId, "quiz_results")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("獲取問卷結果失敗:", error)
      return null
    }
  }

  // 儲存問卷答案
  static setQuizAnswers(userId: string, answers: any): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "quiz_answers")
      localStorage.setItem(key, JSON.stringify(answers))
      console.log("已儲存問卷答案:", answers)
    } catch (error) {
      console.error("儲存問卷答案失敗:", error)
    }
  }

  // 獲取問卷答案
  static getQuizAnswers(userId: string): any | null {
    if (typeof window === "undefined") return null

    try {
      const key = this.getKey(userId, "quiz_answers")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("獲取問卷答案失敗:", error)
      return null
    }
  }

  // 儲存推薦結果
  static setRecommendations(userId: string, recommendations: any): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "recommendations")
      localStorage.setItem(key, JSON.stringify(recommendations))
      console.log("已儲存推薦結果:", recommendations)
    } catch (error) {
      console.error("儲存推薦結果失敗:", error)
    }
  }

  // 獲取推薦結果
  static getRecommendations(userId: string): any | null {
    if (typeof window === "undefined") return null

    try {
      const key = this.getKey(userId, "recommendations")
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("獲取推薦結果失敗:", error)
      return null
    }
  }

  // 清除推薦結果
  static clearRecommendations(userId: string): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "recommendations")
      localStorage.removeItem(key)
      console.log("已清除推薦結果")
    } catch (error) {
      console.error("清除推薦結果失敗:", error)
    }
  }

  // 清除問卷答案
  static clearQuizAnswers(userId: string): void {
    if (typeof window === "undefined") return

    try {
      const key = this.getKey(userId, "quiz_answers")
      localStorage.removeItem(key)
      console.log("已清除問卷答案")
    } catch (error) {
      console.error("清除問卷答案失敗:", error)
    }
  }

  // 檢查推薦結果是否有效
  static isRecommendationValid(userId: string, currentAnswers: any): boolean {
    if (typeof window === "undefined") return false

    try {
      const storedRecommendations = this.getRecommendations(userId)

      // 如果沒有儲存的推薦結果，則無效
      if (!storedRecommendations) {
        return false
      }

      // 如果沒有當前答案，則無效
      if (!currentAnswers) {
        return false
      }

      // 檢查推薦結果中是否包含問卷答案
      const storedAnswers = storedRecommendations.quizAnswers
      if (!storedAnswers) {
        return false
      }

      // 比較關鍵答案是否相同
      const keyFields = ["gender", "scent", "mood", "vibe", "feel"]
      for (const field of keyFields) {
        if (storedAnswers[field] !== currentAnswers[field]) {
          console.log(`推薦結果已過期: ${field} 不匹配`)
          return false
        }
      }

      console.log("推薦結果仍然有效")
      return true
    } catch (error) {
      console.error("檢查推薦結果有效性失敗:", error)
      return false
    }
  }

  // 遷移舊的 localStorage 數據到新的用戶特定格式
  static migrateOldData(userId: string): void {
    if (typeof window === "undefined") return

    try {
      console.log("開始遷移舊數據到用戶特定格式...")

      // 遷移問卷答案
      const oldQuizAnswers = localStorage.getItem("quizAnswers")
      if (oldQuizAnswers && !this.getQuizAnswers(userId)) {
        try {
          const answers = JSON.parse(oldQuizAnswers)
          this.setQuizAnswers(userId, answers)
          console.log("已遷移問卷答案")
        } catch (e) {
          console.warn("遷移問卷答案失敗:", e)
        }
      }

      // 遷移選中的香水
      const oldSelectedPerfume = localStorage.getItem("selectedPerfume")
      if (oldSelectedPerfume && !this.getSelectedPerfume(userId)) {
        try {
          const perfume = JSON.parse(oldSelectedPerfume)
          this.saveSelectedPerfume(userId, perfume)
          console.log("已遷移選中香水")
        } catch (e) {
          console.warn("遷移選中香水失敗:", e)
        }
      }

      // 遷移訂閱資訊
      const oldSubscription = localStorage.getItem("subscriptionData")
      if (oldSubscription && !this.getSubscription(userId)) {
        try {
          const subscription = JSON.parse(oldSubscription)
          this.saveSubscription(userId, subscription)
          console.log("已遷移訂閱資訊")
        } catch (e) {
          console.warn("遷移訂閱資訊失敗:", e)
        }
      }

      // 遷移推薦結果
      const oldRecommendations =
        localStorage.getItem("recommendations") || localStorage.getItem("perfumeRecommendations")
      if (oldRecommendations && !this.getRecommendations(userId)) {
        try {
          const recommendations = JSON.parse(oldRecommendations)
          this.setRecommendations(userId, recommendations)
          console.log("已遷移推薦結果")
        } catch (e) {
          console.warn("遷移推薦結果失敗:", e)
        }
      }

      console.log("數據遷移完成")
    } catch (error) {
      console.error("數據遷移過程中發生錯誤:", error)
    }
  }

  // 清除所有用戶資料
  static clearUserData(userId: string): void {
    if (typeof window === "undefined") return

    try {
      const keys = ["selected_perfume", "subscription", "quiz_results", "quiz_answers", "recommendations"]
      keys.forEach((key) => {
        const fullKey = this.getKey(userId, key)
        localStorage.removeItem(fullKey)
      })
      console.log("已清除用戶資料")
    } catch (error) {
      console.error("清除用戶資料失敗:", error)
    }
  }
}

// 為了向後相容，提供 UserStorage 包裝函式
export const UserStorage = {
  getSelectedPerfume: (userId: string) => ClientStorage.getSelectedPerfume(userId),
  saveSelectedPerfume: (userId: string, perfume: any) => ClientStorage.saveSelectedPerfume(userId, perfume),
  saveSubscription: (userId: string, subscription: any) => ClientStorage.saveSubscription(userId, subscription),
  getSubscription: (userId: string) => ClientStorage.getSubscription(userId),
  saveQuizResults: (userId: string, results: any) => ClientStorage.saveQuizResults(userId, results),
  getQuizResults: (userId: string) => ClientStorage.getQuizResults(userId),
  setQuizAnswers: (userId: string, answers: any) => ClientStorage.setQuizAnswers(userId, answers),
  getQuizAnswers: (userId: string) => ClientStorage.getQuizAnswers(userId),
  setRecommendations: (userId: string, recommendations: any) =>
    ClientStorage.setRecommendations(userId, recommendations),
  getRecommendations: (userId: string) => ClientStorage.getRecommendations(userId),
  clearRecommendations: (userId: string) => ClientStorage.clearRecommendations(userId),
  clearQuizAnswers: (userId: string) => ClientStorage.clearQuizAnswers(userId),
  isRecommendationValid: (userId: string, currentAnswers: any) =>
    ClientStorage.isRecommendationValid(userId, currentAnswers),
  migrateOldData: (userId: string) => ClientStorage.migrateOldData(userId),
  clearUserData: (userId: string) => ClientStorage.clearUserData(userId),
}
