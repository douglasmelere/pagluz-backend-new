# 🚀 Guia Rápido: Acessar Faturas no Frontend

## ⚠️ REGRA DE OURO
**NUNCA use a URL do Supabase diretamente!** Use sempre o endpoint do backend que já vem no campo `invoiceUrl`.

---

## 📋 URLs Retornadas pelo Backend

O backend já retorna a URL correta no campo `invoiceUrl`:

- **Representantes:** `/consumers/representative/{consumerId}/invoice`
- **Admins:** `/consumers/{consumerId}/invoice`

Você só precisa adicionar a URL base da sua API antes.

---

## ✅ Código Pronto para Copiar

### Para Representantes (Visualizar):
```typescript
const viewInvoice = async (consumerId: string) => {
  const token = localStorage.getItem('token');
  const apiBaseUrl = 'https://sua-api.com'; // Sua URL base
  
  const response = await fetch(`${apiBaseUrl}/consumers/representative/${consumerId}/invoice`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};
```

### Para Admins (Visualizar):
```typescript
const viewInvoiceAdmin = async (consumerId: string) => {
  const token = localStorage.getItem('token');
  const apiBaseUrl = 'https://sua-api.com'; // Sua URL base
  
  const response = await fetch(`${apiBaseUrl}/consumers/${consumerId}/invoice`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};
```

### Com Axios (Recomendado):
```typescript
// Visualizar (Representante)
const viewInvoice = async (consumerId: string) => {
  const response = await api.get(`/consumers/representative/${consumerId}/invoice`, {
    responseType: 'blob' // IMPORTANTE!
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};

// Visualizar (Admin)
const viewInvoiceAdmin = async (consumerId: string) => {
  const response = await api.get(`/consumers/${consumerId}/invoice`, {
    responseType: 'blob' // IMPORTANTE!
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};
```

---

## ❌ NÃO FAÇA ISSO

```typescript
// ❌ ERRADO - URL do Supabase
window.open(consumer.invoiceUrl, '_blank'); // Se for URL do Supabase

// ❌ ERRADO - Sem autenticação
fetch(`/consumers/${id}/invoice`); // Sem Authorization header

// ❌ ERRADO - Sem responseType: 'blob'
api.get(`/consumers/${id}/invoice`); // Sem responseType: 'blob'
```

---

## ✅ Checklist

- [ ] Usar endpoint do backend (`/consumers/.../invoice`)
- [ ] Incluir token no header `Authorization: Bearer {token}`
- [ ] Usar `responseType: 'blob'` (se Axios)
- [ ] Criar blob corretamente: `new Blob([response.data])`

---

## 🔗 Endpoints

- **Representante:** `GET /consumers/representative/:id/invoice`
- **Admin:** `GET /consumers/:id/invoice`

Ambos requerem autenticação JWT.

---

**Ver guia completo:** `docs/FRONTEND_INVOICE_ACCESS_GUIDE.md`





