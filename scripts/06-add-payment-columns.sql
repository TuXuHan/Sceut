-- 創建付款記錄表
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'TWD',
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'pending'
    tappay_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 為 payments 表創建索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_number ON payments(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 為 subscribers 表添加付款相關欄位
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'credit_card',
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'active'; -- 'active', 'failed', 'suspended'

-- 創建觸發器來自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為 payments 表添加觸發器
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
