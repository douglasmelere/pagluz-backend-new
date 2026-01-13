# 📄 Guia: Como Acessar Faturas no Frontend

## ⚠️ IMPORTANTE: Não use URLs do Supabase diretamente!

O backend já retorna a URL correta do endpoint. **NUNCA** tente acessar a URL do Supabase diretamente, pois o bucket não é público e resultará em erro "Bucket not found".

---

## 🔍 Como o Backend Retorna as URLs

Quando você busca um consumidor, o campo `invoiceUrl` já vem com a URL correta do endpoint do backend:

### Para Representantes:
```json
{
  "id": "abc123",
  "name": "João Silva",
  "invoiceUrl": "/consumers/representative/abc123/invoice",
  "invoiceFileName": "Fatura-Joao-Silva-2025-12-27.pdf"
}
```

### Para Admins:
```json
{
  "id": "abc123",
  "name": "João Silva",
  "invoiceUrl": "/consumers/abc123/invoice",
  "invoiceFileName": "Fatura-Joao-Silva-2025-12-27.pdf"
}
```

**Note:** A URL já é relativa e começa com `/consumers/`. Você só precisa adicionar a URL base da sua API.

---

## ✅ Implementação Correta

### Opção 1: Abrir em Nova Aba (Mais Simples)

```typescript
// Para Representantes
const viewInvoice = (consumerId: string) => {
  const invoiceUrl = `/consumers/representative/${consumerId}/invoice`;
  const fullUrl = `${process.env.REACT_APP_API_URL || 'https://sua-api.com'}${invoiceUrl}`;
  
  // Abre em nova aba
  window.open(fullUrl, '_blank');
};

// Para Admins
const viewInvoiceAdmin = (consumerId: string) => {
  const invoiceUrl = `/consumers/${consumerId}/invoice`;
  const fullUrl = `${process.env.REACT_APP_API_URL || 'https://sua-api.com'}${invoiceUrl}`;
  
  window.open(fullUrl, '_blank');
};
```

**⚠️ ATENÇÃO:** Se você usar `window.open()` diretamente, certifique-se de que:
1. O token JWT está sendo enviado via cookie (se configurado)
2. OU use a Opção 2 abaixo que envia o token no header

---

### Opção 2: Download com Autenticação (Recomendado)

```typescript
// Para Representantes
const downloadInvoice = async (consumerId: string) => {
  try {
    const token = localStorage.getItem('token'); // ou como você armazena o token
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://sua-api.com';
    const invoiceUrl = `/consumers/representative/${consumerId}/invoice`;
    
    const response = await fetch(`${apiBaseUrl}${invoiceUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar fatura');
    }

    // Cria blob e faz download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extrai nome do arquivo do header
    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'fatura.pdf';
    
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar fatura:', error);
    alert('Erro ao baixar fatura. Tente novamente.');
  }
};

// Para Admins
const downloadInvoiceAdmin = async (consumerId: string) => {
  try {
    const token = localStorage.getItem('token');
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://sua-api.com';
    const invoiceUrl = `/consumers/${consumerId}/invoice`;
    
    const response = await fetch(`${apiBaseUrl}${invoiceUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar fatura');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'fatura.pdf';
    
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar fatura:', error);
    alert('Erro ao baixar fatura. Tente novamente.');
  }
};
```

---

### Opção 3: Visualizar no Navegador (Sem Download)

```typescript
// Para Representantes
const viewInvoiceInBrowser = async (consumerId: string) => {
  try {
    const token = localStorage.getItem('token');
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://sua-api.com';
    const invoiceUrl = `/consumers/representative/${consumerId}/invoice`;
    
    const response = await fetch(`${apiBaseUrl}${invoiceUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar fatura');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Abre em nova aba
    window.open(url, '_blank');
    
    // Limpa a URL após um tempo (opcional)
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao visualizar fatura:', error);
    alert('Erro ao visualizar fatura. Tente novamente.');
  }
};

// Para Admins
const viewInvoiceInBrowserAdmin = async (consumerId: string) => {
  try {
    const token = localStorage.getItem('token');
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://sua-api.com';
    const invoiceUrl = `/consumers/${consumerId}/invoice`;
    
    const response = await fetch(`${apiBaseUrl}${invoiceUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar fatura');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao visualizar fatura:', error);
    alert('Erro ao visualizar fatura. Tente novamente.');
  }
};
```

---

## 📱 Exemplo Completo com React/Axios

Se você usa Axios ou uma biblioteca similar:

```typescript
import axios from 'axios';

// Configuração do Axios (já deve ter isso)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://sua-api.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token (já deve ter isso)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para visualizar fatura (Representante)
export const viewInvoice = async (consumerId: string) => {
  try {
    const response = await api.get(`/consumers/representative/${consumerId}/invoice`, {
      responseType: 'blob', // IMPORTANTE: responseType deve ser 'blob'
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Limpa após um tempo
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao visualizar fatura:', error);
    throw error;
  }
};

// Função para visualizar fatura (Admin)
export const viewInvoiceAdmin = async (consumerId: string) => {
  try {
    const response = await api.get(`/consumers/${consumerId}/invoice`, {
      responseType: 'blob', // IMPORTANTE: responseType deve ser 'blob'
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao visualizar fatura:', error);
    throw error;
  }
};

// Função para fazer download (Representante)
export const downloadInvoice = async (consumerId: string) => {
  try {
    const response = await api.get(`/consumers/representative/${consumerId}/invoice`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extrai nome do arquivo do header
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'fatura.pdf';
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar fatura:', error);
    throw error;
  }
};

// Função para fazer download (Admin)
export const downloadInvoiceAdmin = async (consumerId: string) => {
  try {
    const response = await api.get(`/consumers/${consumerId}/invoice`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'fatura.pdf';
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar fatura:', error);
    throw error;
  }
};
```

---

## 🎨 Exemplo de Componente React

```tsx
import React from 'react';
import { viewInvoice, downloadInvoice } from '@/services/invoiceService';

interface Consumer {
  id: string;
  name: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
}

interface InvoiceButtonProps {
  consumer: Consumer;
  userRole: 'REPRESENTATIVE' | 'ADMIN';
}

export const InvoiceButton: React.FC<InvoiceButtonProps> = ({ consumer, userRole }) => {
  if (!consumer.invoiceUrl) {
    return <span className="text-gray-400">Sem fatura</span>;
  }

  const handleView = async () => {
    try {
      if (userRole === 'REPRESENTATIVE') {
        await viewInvoice(consumer.id);
      } else {
        await viewInvoiceAdmin(consumer.id);
      }
    } catch (error) {
      alert('Erro ao visualizar fatura');
    }
  };

  const handleDownload = async () => {
    try {
      if (userRole === 'REPRESENTATIVE') {
        await downloadInvoice(consumer.id);
      } else {
        await downloadInvoiceAdmin(consumer.id);
      }
    } catch (error) {
      alert('Erro ao baixar fatura');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleView}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        👁️ Ver
      </button>
      <button
        onClick={handleDownload}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        ⬇️ Baixar
      </button>
    </div>
  );
};
```

---

## ❌ O QUE NÃO FAZER

### ❌ ERRADO - Acessar URL do Supabase diretamente:
```typescript
// NUNCA faça isso!
const invoiceUrl = consumer.invoiceUrl; // Se for URL do Supabase
window.open(invoiceUrl, '_blank'); // ❌ Erro: Bucket not found
```

### ❌ ERRADO - Usar URL sem autenticação:
```typescript
// NUNCA faça isso sem token!
const response = await fetch(`/consumers/${id}/invoice`); // ❌ Sem Authorization header
```

### ❌ ERRADO - Não tratar responseType como blob:
```typescript
// NUNCA faça isso com Axios sem responseType: 'blob'
const response = await api.get(`/consumers/${id}/invoice`); // ❌ Vai dar erro
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Usar a URL retornada pelo backend (`/consumers/.../invoice`)
- [ ] Adicionar a URL base da API antes da URL relativa
- [ ] Incluir o token JWT no header `Authorization`
- [ ] Usar `responseType: 'blob'` se estiver usando Axios
- [ ] Tratar erros adequadamente
- [ ] Limpar URLs criadas com `createObjectURL` após uso

---

## 🔗 Endpoints Disponíveis

### Para Representantes:
```
GET /consumers/representative/:consumerId/invoice
Headers: Authorization: Bearer {representative_token}
Response: Arquivo (PDF ou imagem)
```

### Para Admins:
```
GET /consumers/:consumerId/invoice
Headers: Authorization: Bearer {admin_token}
Response: Arquivo (PDF ou imagem)
```

---

## 📝 Notas Importantes

1. **URLs Relativas:** O backend sempre retorna URLs relativas começando com `/consumers/`
2. **Autenticação Obrigatória:** Todos os endpoints requerem token JWT válido
3. **Content-Type:** O backend retorna o content-type correto (PDF, JPEG, PNG, etc.)
4. **Nome do Arquivo:** O nome amigável vem no header `Content-Disposition`
5. **Bucket Não Público:** O bucket do Supabase não é público, por isso você DEVE usar os endpoints do backend

---

## 🆘 Resolução de Problemas

### Erro: "Bucket not found"
**Causa:** Tentando acessar URL do Supabase diretamente  
**Solução:** Use o endpoint do backend (`/consumers/.../invoice`)

### Erro: 401 Unauthorized
**Causa:** Token JWT não está sendo enviado ou está inválido  
**Solução:** Verifique se o token está no header `Authorization: Bearer {token}`

### Erro: 404 Not Found
**Causa:** URL incorreta ou consumidor não tem fatura  
**Solução:** Verifique se o `consumerId` está correto e se o consumidor tem `invoiceUrl`

### Arquivo não abre corretamente
**Causa:** Não está usando `responseType: 'blob'` ou não está criando o blob corretamente  
**Solução:** Use `responseType: 'blob'` no Axios ou crie o blob corretamente com `new Blob([response.data])`

---

**Última atualização:** 27/12/2025





