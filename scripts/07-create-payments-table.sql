-- 建立付款記錄表
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    amount INTEGER NOT NULL, -- 金額（以分為單位）
    currency VARCHAR(3) NOT NULL DEFAULT 'TWD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'credit_card',
    cardholder_name VARCHAR(255),
    card_last_four VARCHAR(4),
    demo_mode BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 設定 RLS 政策
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己的付款記錄
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- 用戶可以插入自己的付款記錄
CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 將付款記錄關聯到訂閱表
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS payment_id BIGINT REFERENCES payments(id);

-- 為訂閱表的付款關聯建立索引
CREATE INDEX IF NOT EXISTS idx_subscribers_payment_id ON subscribers(payment_id);

COMMENT ON TABLE payments IS '付款記錄表';
COMMENT ON COLUMN payments.amount IS '付款金額（以分為單位）';
COMMENT ON COLUMN payments.demo_mode IS '是否為演示模式付款';
