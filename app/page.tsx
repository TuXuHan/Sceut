"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle, Gift, Zap } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/app/auth-provider"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative text-gray-800 py-12 md:py-20 lg:py-32 flex items-center justify-center overflow-hidden min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]">
        {/* Background Image */}
        <Image
          src="/hero-background.jpeg"
          alt="Sceut 香水品牌背景"
          layout="fill"
          objectFit="cover"
          quality={75}
          className="opacity-20"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-[#F5F2ED]/70 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extralight mb-4 md:mb-6 tracking-tight text-gray-900 leading-tight"
          >
            探索您的專屬命定香氣
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-gray-700 mb-8 md:mb-10 max-w-2xl mx-auto font-light leading-relaxed px-4"
          >
            每月僅需 <span className="font-semibold text-[#8A7B6C]">NT$599</span>，Sceut
            為您精心挑選來自全球頂級品牌的試用裝香水，
            <br className="hidden sm:inline" />
            讓您輕鬆發掘並體驗最能代表您獨特個性的香氛。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              asChild
              className="bg-gray-800 hover:bg-black text-white rounded-none h-11 md:h-12 px-6 md:px-10 text-sm font-light tracking-widest uppercase"
            >
              <Link href={isAuthenticated ? "/quiz" : "/register"}>開始您的香氣之旅</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-extralight text-center mb-12 md:mb-16 tracking-wide text-gray-800">
            為何選擇 Sceut？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-4 md:p-6 border border-[#EFEFEF] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4 md:mb-6">
                <Zap className="w-10 h-10 md:w-12 md:h-12 text-[#C2B8A3]" />
              </div>
              <h3 className="text-lg md:text-xl font-normal mb-2 md:mb-3 text-gray-800 tracking-wide">
                個性化香氣探索
              </h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                透過專業香氣測驗，精準匹配您的個人風格與喜好，每月發現令您驚艷的新香。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-4 md:p-6 border border-[#EFEFEF] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4 md:mb-6">
                <Gift className="w-10 h-10 md:w-12 md:h-12 text-[#C2B8A3]" />
              </div>
              <h3 className="text-lg md:text-xl font-normal mb-2 md:mb-3 text-gray-800 tracking-wide">頂級品牌精選</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                無需盲購正裝，即可體驗來自全球知名設計師與小眾品牌的奢華香水。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center p-4 md:p-6 border border-[#EFEFEF] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4 md:mb-6">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-[#C2B8A3]" />
              </div>
              <h3 className="text-lg md:text-xl font-normal mb-2 md:mb-3 text-gray-800 tracking-wide">彈性無憂訂閱</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                每月固定費用，免費配送。您可以隨時調整偏好，或輕鬆暫停、取消訂閱。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-[#F5F2ED]">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-extralight text-center mb-12 md:mb-16 tracking-wide text-gray-800">
            簡單三步驟，開啟香氛之旅
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 text-center">
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-extralight text-[#C2B8A3] mb-3 md:mb-4">1</div>
              <h3 className="text-lg md:text-xl font-normal mb-2 text-gray-800">註冊帳戶</h3>
              <p className="text-sm text-gray-600 font-light">填寫基本資料，成為Sceut會員。</p>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-extralight text-[#C2B8A3] mb-3 md:mb-4">2</div>
              <h3 className="text-lg md:text-xl font-normal mb-2 text-gray-800">完成香氣測驗</h3>
              <p className="text-sm text-gray-600 font-light">告訴我們您的偏好，讓我們更懂您。</p>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-4xl md:text-5xl font-extralight text-[#C2B8A3] mb-3 md:mb-4">3</div>
              <h3 className="text-lg md:text-xl font-normal mb-2 text-gray-800">訂閱並等待驚喜</h3>
              <p className="text-sm text-gray-600 font-light">每月專屬香水送上門。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
