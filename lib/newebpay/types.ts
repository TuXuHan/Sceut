// Types for periodic payment - based on NeWebPay documentation 4.3.1 請求參數

export interface PeriodicPaymentRequest {
  MerOrderNo: string;
  ProdDesc: string;
  PeriodAmt: number;
  PeriodType: 'D' | 'W' | 'M' | 'Y'; // D=固定天期制, W=每週, M=每月, Y=每年
  PeriodPoint: string;
  PeriodStartType: '1' | '2' | '3'; // 1=立即執行十元授權, 2=立即執行委託金額授權, 3=不檢查信用卡資訊
  PeriodTimes: number; // 總執行次數
  ReturnURL?: string;
  NotifyURL?: string;
  BackURL?: string;
  Language?: 'zh-Tw' | 'en';
  PeriodMemo?: string;
}

export interface PeriodicPaymentResponse {
  Status: string;
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    PeriodType: string;
    PeriodAmt: string;
    AuthTimes: number;
    DateArray: string;
    PeriodNo: string;
    // Additional fields for PeriodStartType 1 or 2
    AuthTime?: string;
    TradeNo?: string;
    CardNo?: string;
    AuthCode?: string;
    RespondCode?: string;
    EscrowBank?: string;
    AuthBank?: string;
    PaymentMethod?: string;
  };
}

// Types for alter status - based on NeWebPay documentation 4.4.1 請求參數
export interface AlterStatusRequest {
  MerOrderNo: string;
  PeriodNo: string;
  AlterType: 'suspend' | 'terminate' | 'restart'; // suspend=暫停, terminate=終止, restart=啟用
}

export interface AlterStatusResponse {
  Status: string;
  Message: string;
  Result?: {
    MerOrderNo: string;
    PeriodNo: string;
    AlterType: string;
    NewNextTime?: string; // 下一期授權日期
  };
}

// Types for alter amount - based on NeWebPay documentation 4.5.1 請求參數
export interface AlterAmountRequest {
  MerOrderNo: string;
  PeriodNo: string;
  AlterAmt?: number; // 委託金額
  PeriodType?: 'D' | 'W' | 'M' | 'Y'; // 週期類別
  PeriodPoint?: string; // 交易週期授權時間
  PeriodTimes?: number; // 授權期數
  Extday?: string; // 信用卡到期日 (格式: YYMM)
  NotifyURL?: string; // 每期授權結果通知網址
}

export interface AlterAmountResponse {
  Status: string;
  Message: string;
  Result?: {
    MerOrderNo: string;
    PeriodNo: string;
    AlterAmt?: string;
    PeriodType?: string;
    PeriodPoint?: string;
    NewNextAmt?: string; // 下一期授權金額
    NewNextTime?: string; // 下一期授權時間
    PeriodTimes?: number;
    Extday?: string;
    NotifyURL?: string;
  };
}

// Common response interface for all periodic payment notifications
export interface PeriodicPaymentNotification {
  Status: string;
  Message: string;
  Result?: {
    RespondCode: string;
    MerchantID: string;
    MerchantOrderNo: string;
    OrderNo: string;
    TradeNo: string;
    AuthDate: string;
    TotalTimes: string;
    AlreadyTimes: string;
    AuthAmt: number;
    AuthCode: string;
    EscrowBank: string;
    AuthBank: string;
    NextAuthDate: string;
    PeriodNo: string;
  };
}

// Form data interface for creating periodic payment HTML form
export interface PeriodicPaymentFormData {
  LangType: "zh-Tw" | "en";
  MerOrderNo: string;
  ProdDesc: string;
  Version: string;
  PeriodAmt: number;
  PeriodType: 'D' | 'W' | 'M' | 'Y';
  PeriodPoint: string;
  PeriodStartType: 1 | 2 | 3;
  PeriodTimes: number;
  PeriodFirstdate: string;
  PeriodMemo: string;
  PayerEmail: string;
  EmailModify: 0 | 1;
  PaymentInfo: "Y" | "N";
  OrderInfo: "Y" | "N";
  ReturnURL?: string;
  NotifyURL?: string;
  BackURL?: string;
  UNIONPAY: 0 | 1;
}
