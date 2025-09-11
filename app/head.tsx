import Script from "next/script"

export default function Head() {
  return (
    <>
      <title>Sceut | 發現您的專屬香水</title>
      <meta
        name="description"
        content="通過我們的香水測驗，發現最適合您的香水。每月精選香水訂閱服務，讓您探索世界各地的獨特香氛。"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* TapPay SDK，一定要 beforeInteractive */}
      <Script
        src="https://js.tappaysdk.com/tpdirect/v5.1.0"
        strategy="beforeInteractive"
        onLoad={() => console.log("✅ TapPay SDK 已載入")}
        onError={() => console.error("❌ TapPay SDK 載入失敗")}
      />
    </>
  )
}
