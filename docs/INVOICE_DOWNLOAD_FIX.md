# 🔧 Correção: Erro "Bucket not found" ao Buscar Faturas

## ❌ Problema Identificado

Quando o sistema de admin buscava consumidores com faturas, estava recebendo o erro:
```json
{
  "statusCode": "404",
  "error": "Bucket not found",
  "message": "Bucket not found"
}
```

### Causa

O campo `invoiceUrl` no banco de dados armazena a URL pública do Supabase Storage. No entanto, o bucket `faturas-representantes` não está configurado como público, então quando o front-end tenta acessar diretamente essa URL, recebe o erro "Bucket not found".

## ✅ Solução Implementada

### 1. Correção no Backend

Os métodos que retornam consumidores agora substituem a URL do Supabase pela URL do endpoint do backend:

#### Para Admins:
```typescript
// src/modules/consumers/consumers.service.ts - método findOne()
if (consumer.invoiceUrl && consumer.invoiceFileName) {
  return {
    ...consumer,
    invoiceUrl: `/consumers/${id}/invoice`, // URL do endpoint do backend
  };
}
```

#### Para Representantes:
```typescript
// src/modules/consumers/consumers.service.ts - método findRepresentativeConsumer()
if (consumer.invoiceUrl && consumer.invoiceFileName) {
  return {
    ...consumer,
    invoiceUrl: `/consumers/representative/${consumerId}/invoice`, // URL do endpoint do backend
  };
}
```

### 2. Endpoints de Download

O backend já possui endpoints seguros para download de faturas:

#### Para Representantes:
```
GET /consumers/representative/:consumerId/invoice
Authorization: Bearer {representative_token}
```

#### Para Admins:
```
GET /consumers/:consumerId/invoice
Authorization: Bearer {admin_token}
```

Estes endpoints:
1. Buscam o arquivo no Supabase Storage usando a `SERVICE_ROLE_KEY`
2. Retornam o arquivo diretamente para o cliente
3. Usam o nome amigável da fatura no `Content-Disposition`

## 📋 Como Usar no Front-End

### ❌ ERRADO (Não funciona):
```typescript
// NÃO use a URL do Supabase diretamente
const invoiceUrl = consumer.invoiceUrl; // URL do Supabase
window.open(invoiceUrl, '_blank'); // ❌ Erro: Bucket not found
```

### ✅ CORRETO (Funciona):
```typescript
// Use a URL do endpoint do backend
const invoiceUrl = consumer.invoiceUrl; // Já é a URL do endpoint do backend
const fullUrl = `${API_BASE_URL}${invoiceUrl}`;
window.open(fullUrl, '_blank'); // ✅ Funciona!

// Ou usando fetch com autenticação
const response = await fetch(`${API_BASE_URL}${consumer.invoiceUrl}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
window.open(url, '_blank');
```

## 🔍 Verificação

### Como Verificar se Está Funcionando

1. **No Backend:**
   - O campo `invoiceUrl` retornado deve começar com `/consumers/` (não com `https://`)
   - Exemplo correto: `/consumers/abc123/invoice`
   - Exemplo incorreto: `https://supabase.../storage/v1/object/public/...`

2. **No Front-End:**
   - Ao clicar em "Ver Fatura", deve abrir o arquivo corretamente
   - Não deve aparecer erro "Bucket not found"

## 📝 Notas Importantes

1. **URLs Retornadas:**
   - O backend agora sempre retorna URLs relativas do endpoint (`/consumers/...`)
   - O front-end deve concatenar com a URL base da API

2. **Autenticação:**
   - Os endpoints de download requerem autenticação
   - Certifique-se de incluir o token JWT no header `Authorization`

3. **Nome do Arquivo:**
   - O arquivo é servido com o nome amigável (ex: `Fatura-Joao-Silva-2025-12-27.pdf`)
   - Isso é definido no header `Content-Disposition`

## 🎯 Exemplo Completo de Implementação

```typescript
// Componente React/Next.js
import { api } from '@/services/api';

export function InvoiceViewer({ consumer }: { consumer: any }) {
  const handleViewInvoice = async () => {
    try {
      // A URL já vem do backend como endpoint relativo
      const invoiceUrl = consumer.invoiceUrl; // Ex: "/consumers/abc123/invoice"
      
      // Opção 1: Abrir em nova aba (simples)
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${invoiceUrl}`;
      window.open(fullUrl, '_blank');
      
      // Opção 2: Download direto (com mais controle)
      const response = await api.get(invoiceUrl, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extrai o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'fatura.pdf';
      
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao visualizar fatura:', error);
      toast.error('Erro ao abrir fatura');
    }
  };

  if (!consumer.invoiceUrl) {
    return <p>Nenhuma fatura anexada</p>;
  }

  return (
    <div>
      <button onClick={handleViewInvoice}>
        📄 Ver Fatura
      </button>
    </div>
  );
}
```

## ✅ Status

- [x] Método `findOne()` corrigido para admins
- [x] Método `findRepresentativeConsumer()` corrigido para representantes
- [x] Endpoints de download funcionando
- [x] Documentação criada

**Data da Correção:** 27/12/2025

## 📌 Métodos Corrigidos

Todos os métodos que retornam consumidores agora corrigem automaticamente a URL da fatura:

### Para Admins:
- `findOne(id)` - Busca um consumidor específico
- `findAll()` - Lista todos os consumidores

### Para Representantes:
- `findRepresentativeConsumer(representativeId, consumerId)` - Busca um consumidor específico
- `findByRepresentative(representativeId)` - Lista consumidores do representante

