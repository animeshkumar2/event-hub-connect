-- Migration: Add token payment fields to orders and leads tables
-- Date: 2024-01-10
-- Description: Adds fields required for token payment flow

-- Add token payment fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS token_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS awaiting_token_payment BOOLEAN DEFAULT false;

-- Add payment type field to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'FULL',
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS original_payment_id UUID;

-- Add order reference and source to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id),
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id),
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'INQUIRY',
ADD COLUMN IF NOT EXISTS token_amount DECIMAL(10, 2);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_leads_order_id ON leads(order_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_orders_awaiting_token ON orders(awaiting_token_payment);

-- Update existing orders to have token_amount calculated (25% of total)
UPDATE orders 
SET token_amount = ROUND(total_amount * 0.25, 0)
WHERE token_amount IS NULL OR token_amount = 0;

-- Update existing orders to not be awaiting token payment if already confirmed
UPDATE orders 
SET awaiting_token_payment = false 
WHERE status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Update existing orders to be awaiting token payment if pending
UPDATE orders 
SET awaiting_token_payment = true 
WHERE status = 'PENDING' AND (token_paid IS NULL OR token_paid = 0);

COMMENT ON COLUMN orders.token_amount IS 'Required token payment amount (calculated as percentage of total)';
COMMENT ON COLUMN orders.awaiting_token_payment IS 'True if order is waiting for token payment before processing';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: TOKEN, FULL, PARTIAL, REFUND';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for refund if payment_type is REFUND';
COMMENT ON COLUMN payments.original_payment_id IS 'Reference to original payment for refunds';
COMMENT ON COLUMN leads.order_id IS 'Reference to order if lead was created from direct order';
COMMENT ON COLUMN leads.source IS 'Source of lead: INQUIRY, DIRECT_ORDER, CHAT, OFFER';
COMMENT ON COLUMN leads.token_amount IS 'Token amount paid for this lead';
