# API de Comprovantes de Pagamento de Comissões

Esta documentação descreve os endpoints para gerenciar comprovantes de pagamento de comissões.

## Visão Geral

O sistema permite que administradores façam upload de comprovantes de pagamento (imagens ou PDFs) para comissões, e que representantes comerciais visualizem esses comprovantes para confirmar que suas comissões foram pagas.

## Bucket do Supabase

- **Nome do Bucket**: `comprovantes-pagamento`
- **Tipos de arquivo aceitos**: JPG, PNG, PDF
- **Tamanho máximo**: 5MB
- **Acesso**: Público (com autenticação)

## Endpoints

### 1. Upload de Comprovante (Admin/Operator)

Faz upload de um comprovante de pagamento e automaticamente marca a comissão como paga.

**Endpoint**: `POST /commissions/:id/payment-proof`

**Autenticação**: Requer token JWT de Admin/Operator

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parâmetros**:
- `id` (path): ID da comissão

**Body** (form-data):
- `file`: Arquivo do comprovante (imagem JPG/PNG ou PDF, máximo 5MB)

**Resposta de Sucesso** (200):
```json
{
  "id": "commission_id",
  "status": "PAID",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "paymentProofUrl": "https://supabase.co/storage/v1/object/public/comprovantes-pagamento/...",
  "paymentProofFileName": "commission_id/comprovante_123456.pdf",
  "paymentProofUploadedAt": "2024-01-15T10:30:00.000Z",
  "representative": {
    "id": "rep_id",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "consumer": {
    "id": "consumer_id",
    "name": "Maria Santos",
    "cpfCnpj": "12345678900"
  }
}
```

**Erros**:
- `400`: Arquivo não fornecido ou tipo inválido
- `404`: Comissão não encontrada
- `401`: Não autenticado
- `403`: Sem permissão

**Exemplo com cURL**:
```bash
curl -X POST \
  http://localhost:3000/commissions/commission_id/payment-proof \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@/path/to/comprovante.pdf'
```

---

### 2. Visualizar Comprovante (Admin/Operator)

Baixa o comprovante de pagamento de uma comissão.

**Endpoint**: `GET /commissions/:id/payment-proof`

**Autenticação**: Requer token JWT de Admin/Operator

**Parâmetros**:
- `id` (path): ID da comissão

**Resposta de Sucesso** (200):
- Retorna o arquivo (imagem ou PDF) diretamente
- Header `Content-Type`: `image/jpeg`, `image/png`, ou `application/pdf`
- Header `Content-Disposition`: `inline; filename="comprovante_123456.pdf"`

**Erros**:
- `404`: Comissão ou comprovante não encontrado
- `401`: Não autenticado
- `403`: Sem permissão

**Exemplo com cURL**:
```bash
curl -X GET \
  http://localhost:3000/commissions/commission_id/payment-proof \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output comprovante.pdf
```

---

### 3. Visualizar Comprovante (Representante)

Permite que o representante visualize o comprovante de pagamento de suas próprias comissões.

**Endpoint**: `GET /commissions/representative/:id/payment-proof`

**Autenticação**: Requer token JWT de Representante

**Parâmetros**:
- `id` (path): ID da comissão

**Resposta de Sucesso** (200):
- Retorna o arquivo (imagem ou PDF) diretamente
- Header `Content-Type`: `image/jpeg`, `image/png`, ou `application/pdf`
- Header `Content-Disposition`: `inline; filename="comprovante_123456.pdf"`

**Erros**:
- `404`: Comissão ou comprovante não encontrado
- `401`: Não autenticado
- `403`: Sem permissão (não é o representante desta comissão)

**Exemplo com cURL**:
```bash
curl -X GET \
  http://localhost:3000/commissions/representative/commission_id/payment-proof \
  -H 'Authorization: Bearer REPRESENTATIVE_TOKEN' \
  --output comprovante.pdf
```

---

### 4. Deletar Comprovante (Admin/Operator)

Remove o comprovante de pagamento de uma comissão.

**Endpoint**: `DELETE /commissions/:id/payment-proof`

**Autenticação**: Requer token JWT de Admin/Operator

**Parâmetros**:
- `id` (path): ID da comissão

**Resposta de Sucesso** (200):
```json
{
  "id": "commission_id",
  "status": "PAID",
  "paymentProofUrl": null,
  "paymentProofFileName": null,
  "paymentProofUploadedAt": null
}
```

**Erros**:
- `404`: Comissão ou comprovante não encontrado
- `401`: Não autenticado
- `403`: Sem permissão

**Exemplo com cURL**:
```bash
curl -X DELETE \
  http://localhost:3000/commissions/commission_id/payment-proof \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Fluxo de Uso

### Para Administradores:

1. **Marcar comissão como paga com comprovante**:
   ```
   POST /commissions/:id/payment-proof
   ```
   - Faz upload do comprovante
   - Marca automaticamente a comissão como PAID
   - Define a data de pagamento

2. **Visualizar comprovante**:
   ```
   GET /commissions/:id/payment-proof
   ```

3. **Deletar comprovante** (se necessário):
   ```
   DELETE /commissions/:id/payment-proof
   ```

### Para Representantes:

1. **Listar suas comissões**:
   ```
   GET /commissions/representative/my-commissions
   ```
   - Verifica quais comissões têm `paymentProofUrl` não nulo

2. **Visualizar comprovante de uma comissão paga**:
   ```
   GET /commissions/representative/:id/payment-proof
   ```

---

## Campos Adicionados ao Modelo Commission

```typescript
{
  paymentProofUrl: string | null;        // URL do comprovante no Supabase
  paymentProofFileName: string | null;   // Nome do arquivo no storage
  paymentProofUploadedAt: Date | null;   // Data do upload
}
```

---

## Validações

### Tipo de Arquivo:
- ✅ `image/jpeg`
- ✅ `image/png`
- ✅ `image/jpg`
- ✅ `application/pdf`
- ❌ Outros tipos são rejeitados

### Tamanho:
- Máximo: 5MB
- Arquivos maiores são rejeitados com erro 400

---

## Segurança

1. **Autenticação**: Todos os endpoints requerem autenticação JWT
2. **Autorização**: 
   - Upload/Delete: Apenas Admin/Operator
   - Visualização: Admin/Operator ou Representante (apenas suas comissões)
3. **Validação**: Tipo e tamanho de arquivo são validados
4. **Auditoria**: Todas as operações são registradas no AuditLog

---

## Setup

### 1. Criar o bucket no Supabase:

**Opção A - Script automático**:
```bash
npm run setup:payment-proof-storage
```

**Opção B - SQL Manual**:
Execute o script em `docs/SETUP_PAYMENT_PROOF_BUCKET.sql` no SQL Editor do Supabase.

### 2. Executar migração do Prisma:
```bash
npx prisma migrate dev --name add_payment_proof_to_commissions
```

### 3. Gerar cliente do Prisma:
```bash
npx prisma generate
```

### 4. Reiniciar o servidor:
```bash
npm run start:dev
```

---

## Exemplos de Integração

### Frontend - Upload de Comprovante:

```typescript
async function uploadPaymentProof(commissionId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_URL}/commissions/${commissionId}/payment-proof`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do comprovante');
  }

  return await response.json();
}
```

### Frontend - Visualizar Comprovante:

```typescript
function getPaymentProofUrl(commissionId: string, isRepresentative: boolean = false) {
  const endpoint = isRepresentative 
    ? `/commissions/representative/${commissionId}/payment-proof`
    : `/commissions/${commissionId}/payment-proof`;
    
  return `${API_URL}${endpoint}`;
}

// Uso em um componente:
<a 
  href={getPaymentProofUrl(commission.id, true)} 
  target="_blank"
  rel="noopener noreferrer"
>
  Ver Comprovante
</a>
```

---

## Troubleshooting

### Erro: "Bucket 'comprovantes-pagamento' não encontrado"
**Solução**: Execute o script de setup do bucket:
```bash
npm run setup:payment-proof-storage
```

### Erro: "Property 'paymentProofUrl' does not exist"
**Solução**: Execute a migração do Prisma e gere o cliente:
```bash
npx prisma migrate dev
npx prisma generate
```

### Erro 403 ao fazer upload
**Solução**: Verifique se o usuário tem role de Admin/Operator

### Comprovante não carrega
**Solução**: 
1. Verifique se o bucket está público
2. Verifique as políticas RLS no Supabase
3. Verifique se o arquivo existe no storage
