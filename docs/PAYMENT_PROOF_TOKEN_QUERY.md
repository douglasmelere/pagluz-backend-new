# Como Visualizar Comprovantes em Nova Aba

## Problema Resolvido

Os endpoints de download de comprovante agora aceitam o token JWT tanto no **header Authorization** quanto como **query parameter** `?token=`.

Isso permite abrir comprovantes em nova aba usando `window.open()`.

## Endpoints que Suportam Token na Query String

### 1. Admin/Operator
```
GET /commissions/:id/payment-proof?token=YOUR_JWT_TOKEN
```

### 2. Representante
```
GET /commissions/representative/:id/payment-proof?token=YOUR_JWT_TOKEN
```

## Como Usar no Frontend

### Opção 1: Abrir em Nova Aba (Recomendado)

```typescript
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('token'); // ou getAuthToken()
  const url = `${API_URL}/commissions/${commissionId}/payment-proof?token=${token}`;
  
  window.open(url, '_blank');
}
```

### Opção 2: Fetch com Blob (para Modal)

```typescript
async function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('token');
  
  // Pode usar tanto query string quanto header
  const url = `${API_URL}/commissions/${commissionId}/payment-proof?token=${token}`;
  
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  
  // Abrir em modal ou nova aba
  window.open(blobUrl, '_blank');
  
  // Limpar depois
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
```

### Opção 3: Link Direto (em <a> tag)

```tsx
function CommissionRow({ commission }) {
  const token = localStorage.getItem('token');
  const proofUrl = `${API_URL}/commissions/${commission.id}/payment-proof?token=${token}`;
  
  return (
    <tr>
      <td>{commission.consumer.name}</td>
      <td>R$ {commission.commissionValue.toFixed(2)}</td>
      <td>
        {commission.paymentProofUrl && (
          <a href={proofUrl} target="_blank" rel="noopener noreferrer">
            Ver Comprovante
          </a>
        )}
      </td>
    </tr>
  );
}
```

## Segurança

- ✅ O token é validado da mesma forma que no header
- ✅ Todas as permissões e guards continuam funcionando
- ✅ O token na URL é temporário (expira conforme configurado no JWT)
- ⚠️ Evite compartilhar URLs com token (elas dão acesso temporário)

## Atualização nos Prompts

Atualize os prompts do frontend para usar esta abordagem:

**Antes:**
```typescript
// Não funcionava com window.open()
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Depois:**
```typescript
// Funciona perfeitamente!
const url = `${API_URL}/commissions/${id}/payment-proof?token=${token}`;
window.open(url, '_blank');
```

## Exemplo Completo

```typescript
import { useState } from 'react';

function CommissionsList() {
  const [commissions, setCommissions] = useState([]);
  
  const viewProof = (commissionId: string) => {
    const token = localStorage.getItem('admin_token');
    const url = `${process.env.REACT_APP_API_URL}/commissions/${commissionId}/payment-proof?token=${token}`;
    window.open(url, '_blank');
  };
  
  return (
    <table>
      <tbody>
        {commissions.map(commission => (
          <tr key={commission.id}>
            <td>{commission.consumer.name}</td>
            <td>
              {commission.paymentProofUrl && (
                <button onClick={() => viewProof(commission.id)}>
                  Ver Comprovante
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Testando

Teste abrindo a URL diretamente no navegador:
```
http://localhost:3000/commissions/COMMISSION_ID/payment-proof?token=YOUR_JWT_TOKEN
```

Deve abrir o PDF ou imagem diretamente!
