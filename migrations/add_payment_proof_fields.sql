-- Migração: Adicionar campos de comprovante de pagamento à tabela commissions
-- Data: 2026-02-17

-- Adicionar colunas para comprovante de pagamento
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofFileName" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);

-- Criar índice para melhorar performance de queries que filtram por comprovante
CREATE INDEX IF NOT EXISTS "commissions_paymentProofUrl_idx" ON commissions("paymentProofUrl");

-- Comentários nas colunas
COMMENT ON COLUMN commissions."paymentProofUrl" IS 'URL do comprovante de pagamento no Supabase Storage';
COMMENT ON COLUMN commissions."paymentProofFileName" IS 'Nome do arquivo do comprovante no storage';
COMMENT ON COLUMN commissions."paymentProofUploadedAt" IS 'Data e hora do upload do comprovante';
