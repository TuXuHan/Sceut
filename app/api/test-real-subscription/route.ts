import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/user-data-service';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

/**
 * 真實訂閱流程測試 API
 * 模擬實際訂閱成功時的完整流程，包括：
 * 1. 獲取用戶真實個人資料
 * 2. 模擬 NeWebPay 付款成功
 * 3. 發送訂閱確認郵件
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '請提供 userId 參數'
      }, { status: 400 });
    }

    console.log("🧪 開始真實訂閱流程測試...");
    console.log("👤 測試用戶 ID:", userId);

    // 1. 獲取用戶真實個人資料
    console.log("📋 步驟 1: 獲取用戶個人資料...");
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      console.log("⚠️ 無法獲取用戶個人資料，使用預設資料");
    } else {
      console.log("✅ 成功獲取用戶個人資料:", {
        name: userProfile.full_name || userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        city: userProfile.city,
        postal_code: userProfile.postal_code,
        country: userProfile.country
      });
    }

    // 2. 模擬 NeWebPay 付款成功資料
    console.log("💳 步驟 2: 模擬 NeWebPay 付款成功...");
    const now = new Date();
    const authTime = now.getFullYear().toString() + 
      (now.getMonth() + 1).toString().padStart(2, '0') + 
      now.getDate().toString().padStart(2, '0') + 
      now.getHours().toString().padStart(2, '0') + 
      now.getMinutes().toString().padStart(2, '0') + 
      now.getSeconds().toString().padStart(2, '0');

    const periodNo = `PER${Date.now().toString().slice(-9)}`;
    const merchantOrderNo = `ORD${Date.now().toString().slice(-8)}`;
    const periodAmt = "599";

    // 3. 模擬選擇的香水
    const selectedPerfume = {
      id: "perfume_001",
      name: "Chanel No.5",
      brand: "Chanel",
      price: 599,
      description: "經典的香奈兒五號香水"
    };

    console.log("📦 模擬付款資料:", {
      periodNo,
      authTime,
      periodAmt,
      merchantOrderNo,
      selectedPerfume: selectedPerfume.name
    });

    // 4. 準備訂閱資料（與真實 API 相同的格式）
    console.log("📝 步驟 3: 準備訂閱資料...");
    const authTimeStr = authTime.toString();
    const lastPaymentDate = new Date(
      Number.parseInt(authTimeStr.substring(0, 4)),
      Number.parseInt(authTimeStr.substring(4, 6)) - 1,
      Number.parseInt(authTimeStr.substring(6, 8)),
      Number.parseInt(authTimeStr.substring(8, 10)),
      Number.parseInt(authTimeStr.substring(10, 12)),
      Number.parseInt(authTimeStr.substring(12, 14))
    );
    const nextPaymentDate = new Date(lastPaymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const subscriptionData = {
      user_id: userId,
      name: userProfile?.full_name || userProfile?.name || "測試用戶",
      email: userProfile?.email || "test@example.com",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      postal_code: userProfile?.postal_code || "",
      country: userProfile?.country || "台灣",
      subscription_status: "active",
      payment_status: "paid",
      payment_method: "CREDIT",
      monthly_fee: Number.parseInt(periodAmt),
      period_no: periodNo,
      merchant_order_no: merchantOrderNo,
      created_at: lastPaymentDate.toISOString(),
      last_payment_date: lastPaymentDate.toISOString(),
      next_payment_date: nextPaymentDate.toISOString(),
      payment_data: {
        period_no: periodNo,
        auth_time: authTime,
        period_amt: periodAmt,
        selected_perfume: selectedPerfume,
        merchant_order_no: merchantOrderNo,
      },
      updated_at: new Date().toISOString(),
    };

    console.log("📊 訂閱資料準備完成:", {
      userName: subscriptionData.name,
      userEmail: subscriptionData.email,
      monthlyFee: subscriptionData.monthly_fee,
      nextPaymentDate: subscriptionData.next_payment_date,
      perfumeName: selectedPerfume.name
    });

    // 5. 發送訂閱確認郵件（與真實流程相同）
    console.log("📧 步驟 4: 發送訂閱確認郵件...");
    const emailResult = await sendSubscriptionConfirmationEmail({
      to: subscriptionData.email,
      userName: subscriptionData.name,
      subscriptionId: `SUB-${Date.now().toString().slice(-6)}`,
      periodNo: subscriptionData.period_no,
      monthlyFee: subscriptionData.monthly_fee,
      nextPaymentDate: subscriptionData.next_payment_date,
      perfumeName: selectedPerfume.name,
      perfumeBrand: selectedPerfume.brand,
    });

    if (emailResult.success) {
      console.log("✅ 訂閱確認郵件發送成功");
    } else {
      console.log("❌ 訂閱確認郵件發送失敗:", emailResult.error);
    }

    // 6. 返回測試結果
    return NextResponse.json({
      success: true,
      message: "真實訂閱流程測試完成",
      testResults: {
        userProfile: {
          found: !!userProfile,
          name: userProfile?.full_name || userProfile?.name || "未設定",
          email: userProfile?.email || "未設定",
          phone: userProfile?.phone || "未設定",
          address: userProfile?.address || "未設定",
          city: userProfile?.city || "未設定",
          postal_code: userProfile?.postal_code || "未設定",
          country: userProfile?.country || "未設定"
        },
        paymentData: {
          periodNo,
          authTime,
          periodAmt,
          merchantOrderNo,
          lastPaymentDate: lastPaymentDate.toISOString(),
          nextPaymentDate: nextPaymentDate.toISOString()
        },
        selectedPerfume,
        emailResult: {
          success: emailResult.success,
          emailId: emailResult.data?.id,
          error: emailResult.error
        },
        subscriptionData: {
          userName: subscriptionData.name,
          userEmail: subscriptionData.email,
          monthlyFee: subscriptionData.monthly_fee,
          status: subscriptionData.subscription_status
        }
      }
    });

  } catch (error) {
    console.error("❌ 真實訂閱流程測試失敗:", error);
    return NextResponse.json({
      success: false,
      error: "測試失敗",
      message: error instanceof Error ? error.message : "未知錯誤"
    }, { status: 500 });
  }
}
