-- Script SQL para criar o bucket 'comprovantes-pagamento' no Supabase Storage
-- Este bucket armazenará os comprovantes de pagamento das comissões

-- IMPORTANTE: Recomendamos usar o script Node.js ao invés deste SQL:
-- npm run setup:payment-proof-storage

-- Se preferir executar manualmente, siga os passos abaixo:

-- 1. Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprovantes-pagamento',
  'comprovantes-pagamento',
  true, -- Bucket público para facilitar acesso
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir leitura de comprovantes para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de comprovantes para admins" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de comprovantes para admins" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de comprovantes para admins" ON storage.objects;

-- 3. Criar políticas de acesso (RLS - Row Level Security)

-- Política para permitir leitura pública (qualquer pessoa autenticada pode visualizar)
CREATE POLICY "Permitir leitura de comprovantes para usuários autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes-pagamento');

-- Política para permitir upload apenas para admins/operators
-- Nota: Esta política assume que você tem uma coluna 'role' na tabela auth.users
-- Ajuste conforme sua estrutura de autenticação
CREATE POLICY "Permitir upload de comprovantes para admins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprovantes-pagamento' 
  AND (
    auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER')
  )
);

-- Política para permitir atualização apenas para admins/operators
CREATE POLICY "Permitir atualização de comprovantes para admins"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'comprovantes-pagamento')
WITH CHECK (
  auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER')
);

-- Política para permitir exclusão apenas para admins/operators
CREATE POLICY "Permitir exclusão de comprovantes para admins"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprovantes-pagamento'
  AND (
    auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER')
  )
);

-- 4. Verificar se o bucket foi criado corretamente
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'comprovantes-pagamento';

-- 5. Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%comprovante%';
