# Funcionalidade de Comprovantes de Pagamento - Guia Rápido

## 📋 Resumo

Esta funcionalidade permite que administradores anexem comprovantes de pagamento (imagens ou PDFs) às comissões e que representantes comerciais visualizem esses comprovantes.

## 🚀 Setup Rápido

### 1. Criar o bucket no Supabase

Execute o script automatizado:

```bash
npm run setup:payment-proof-storage
```

**OU** execute manualmente o SQL em `docs/SETUP_PAYMENT_PROOF_BUCKET.sql` no Supabase Dashboard.

### 2. Aplicar migração do banco de dados

⚠️ **IMPORTANTE**: A migração já foi aplicada automaticamente ao gerar o cliente do Prisma.

Os seguintes campos foram adicionados à tabela `commissions`:
- `paymentProofUrl` (String, nullable)
- `paymentProofFileName` (String, nullable)
- `paymentProofUploadedAt` (DateTime, nullable)

### 3. Reiniciar o servidor

Se o servidor estiver rodando, reinicie-o para carregar as mudanças:

```bash
# Pare o servidor atual (Ctrl+C) e execute:
npm run start:dev
```

## 📡 Endpoints Disponíveis

### Para Administradores (Admin/Operator):

1. **Upload de comprovante** (marca automaticamente como paga):
   ```
   POST /commissions/:id/payment-proof
   Content-Type: multipart/form-data
   Body: { file: <arquivo> }
   ```

2. **Visualizar comprovante**:
   ```
   GET /commissions/:id/payment-proof
   ```

3. **Deletar comprovante**:
   ```
   DELETE /commissions/:id/payment-proof
   ```

### Para Representantes:

1. **Visualizar comprovante de suas comissões**:
   ```
   GET /commissions/representative/:id/payment-proof
   ```

## 📄 Tipos de Arquivo Aceitos

- ✅ Imagens: JPG, JPEG, PNG
- ✅ Documentos: PDF
- ❌ Tamanho máximo: 5MB

## 🔐 Segurança

- Todos os endpoints requerem autenticação JWT
- Upload/Delete: Apenas Admin/Operator
- Visualização: Admin/Operator ou Representante (apenas suas próprias comissões)
- Todas as operações são registradas no AuditLog

## 📚 Documentação Completa

Consulte `docs/PAYMENT_PROOF_API.md` para:
- Exemplos detalhados de uso
- Códigos de erro
- Exemplos de integração frontend
- Troubleshooting

## 🧪 Testando a Funcionalidade

### Usando cURL:

```bash
# Upload de comprovante
curl -X POST \
  http://localhost:3000/commissions/COMMISSION_ID/payment-proof \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -F 'file=@/caminho/para/comprovante.pdf'

# Visualizar comprovante (Admin)
curl -X GET \
  http://localhost:3000/commissions/COMMISSION_ID/payment-proof \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  --output comprovante.pdf

# Visualizar comprovante (Representante)
curl -X GET \
  http://localhost:3000/commissions/representative/COMMISSION_ID/payment-proof \
  -H 'Authorization: Bearer REPRESENTATIVE_TOKEN' \
  --output comprovante.pdf
```

### Usando Postman/Insomnia:

1. Crie uma requisição POST para `/commissions/:id/payment-proof`
2. Adicione o header `Authorization: Bearer <token>`
3. No body, selecione `form-data`
4. Adicione um campo `file` do tipo `File`
5. Selecione o arquivo do comprovante
6. Envie a requisição

## 🗂️ Estrutura de Arquivos Criados/Modificados

### Novos Arquivos:
- `src/common/services/payment-proof-storage.service.ts` - Serviço de storage
- `src/scripts/setup-payment-proof-storage.ts` - Script de setup
- `docs/SETUP_PAYMENT_PROOF_BUCKET.sql` - SQL para criar bucket
- `docs/PAYMENT_PROOF_API.md` - Documentação completa
- `docs/PAYMENT_PROOF_QUICK_START.md` - Este arquivo

### Arquivos Modificados:
- `prisma/schema.prisma` - Adicionados campos de comprovante
- `src/modules/commissions/commissions.module.ts` - Adicionado provider
- `src/modules/commissions/commissions.service.ts` - Novos métodos
- `src/modules/commissions/commissions.controller.ts` - Novos endpoints
- `package.json` - Novo script npm

## ❓ Problemas Comuns

### "Bucket não encontrado"
**Solução**: Execute `npm run setup:payment-proof-storage`

### Erro de tipo TypeScript
**Solução**: Execute `npx prisma generate` para regenerar o cliente

### Erro 403 ao fazer upload
**Solução**: Verifique se o usuário tem role Admin/Operator

### Comprovante não carrega
**Solução**: Verifique se o bucket está público no Supabase Dashboard

## 💡 Fluxo de Uso Típico

1. Admin acessa lista de comissões pendentes
2. Admin clica em "Marcar como paga" e faz upload do comprovante
3. Sistema automaticamente:
   - Salva o comprovante no Supabase
   - Marca a comissão como PAID
   - Define a data de pagamento
   - Registra a ação no AuditLog
4. Representante acessa suas comissões
5. Representante vê que a comissão foi paga
6. Representante clica para visualizar o comprovante
7. Comprovante é exibido (PDF ou imagem)

## 🔄 Próximos Passos Sugeridos

1. ✅ Criar bucket no Supabase
2. ✅ Testar upload de comprovante via API
3. ⏭️ Integrar no frontend do admin
4. ⏭️ Integrar no frontend do representante
5. ⏭️ Adicionar notificação por email quando comprovante for anexado
