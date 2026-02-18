# Aplicar Migração de Comprovantes de Pagamento

## Opção 1: Executar SQL Diretamente no Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole e execute o seguinte SQL:

```sql
-- Adicionar colunas para comprovante de pagamento
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofFileName" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS "commissions_paymentProofUrl_idx" ON commissions("paymentProofUrl");
```

4. Clique em **Run** ou pressione `Ctrl+Enter`

## Opção 2: Usando psql (linha de comando)

Se você tiver acesso ao psql, execute:

```bash
psql "postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres" -c "ALTER TABLE commissions ADD COLUMN IF NOT EXISTS \"paymentProofUrl\" TEXT, ADD COLUMN IF NOT EXISTS \"paymentProofFileName\" TEXT, ADD COLUMN IF NOT EXISTS \"paymentProofUploadedAt\" TIMESTAMP(3); CREATE INDEX IF NOT EXISTS \"commissions_paymentProofUrl_idx\" ON commissions(\"paymentProofUrl\");"
```

## Opção 3: Usando DBeaver ou outro cliente SQL

1. Conecte-se ao banco com as credenciais:
   - Host: `147.93.71.233`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: `4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG`

2. Execute o SQL:
```sql
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofFileName" TEXT,
ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "commissions_paymentProofUrl_idx" ON commissions("paymentProofUrl");
```

## Verificar se funcionou

Após executar, verifique se as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'commissions'
  AND column_name IN ('paymentProofUrl', 'paymentProofFileName', 'paymentProofUploadedAt')
ORDER BY column_name;
```

Deve retornar 3 linhas:
- paymentProofFileName
- paymentProofUploadedAt
- paymentProofUrl

## Depois de aplicar

1. Reinicie o servidor: `npm run start:dev`
2. Teste os endpoints de comprovante
