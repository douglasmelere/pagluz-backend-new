-- ============================================
-- MIGRAÇÃO: Adicionar Comprovantes de Pagamento
-- ============================================
-- Execute este SQL no seu banco PostgreSQL
-- ============================================

-- 1. Adicionar colunas para comprovante de pagamento
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofFileName" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);

-- 2. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS "commissions_paymentProofUrl_idx" ON commissions("paymentProofUrl");

-- 3. Verificar se as colunas foram criadas (opcional)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'commissions'
  AND column_name IN ('paymentProofUrl', 'paymentProofFileName', 'paymentProofUploadedAt')
ORDER BY column_name;

-- ============================================
-- Deve retornar 3 linhas:
-- - paymentProofFileName | text | YES
-- - paymentProofUploadedAt | timestamp(3) without time zone | YES
-- - paymentProofUrl | text | YES
-- ============================================
