# Prompt: Implementação de Upload de Comprovantes de Pagamento - Sistema Admin

## Contexto

Preciso implementar a funcionalidade de upload de comprovantes de pagamento para comissões no sistema de administração. Os administradores devem poder anexar comprovantes (imagens ou PDFs) ao marcar uma comissão como paga.

## Objetivo

Adicionar interface para que administradores possam:
1. Fazer upload de comprovantes de pagamento ao marcar comissões como pagas
2. Visualizar comprovantes já anexados
3. Deletar comprovantes (se necessário)

## Especificações da API

### Base URL
```
http://localhost:3000
```
ou a URL de produção configurada.

### Autenticação
Todos os endpoints requerem token JWT de Admin/Operator no header:
```
Authorization: Bearer <token>
```

### Endpoints Disponíveis

#### 1. Upload de Comprovante
**Endpoint:** `POST /commissions/:id/payment-proof`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file`: Arquivo do comprovante (obrigatório)

**Validações:**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/jpg`, `application/pdf`
- Tamanho máximo: 5MB
- Arquivo obrigatório

**Resposta de Sucesso (200):**
```json
{
  "id": "clx123abc",
  "status": "PAID",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "paymentProofUrl": "https://supabase.pagluz.com.br/storage/v1/object/public/comprovantes-pagamento/clx123abc/comprovante_1234567890.pdf",
  "paymentProofFileName": "clx123abc/comprovante_1234567890.pdf",
  "paymentProofUploadedAt": "2024-01-15T10:30:00.000Z",
  "commissionValue": 150.00,
  "representative": {
    "id": "rep123",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "consumer": {
    "id": "cons123",
    "name": "Maria Santos",
    "cpfCnpj": "12345678900"
  }
}
```

**Erros Possíveis:**
- `400`: Arquivo não fornecido, tipo inválido ou tamanho excedido
- `404`: Comissão não encontrada
- `401`: Token inválido ou expirado
- `403`: Usuário sem permissão (não é Admin/Operator)

**Comportamento Importante:**
- ⚠️ Ao fazer upload, a comissão é **automaticamente marcada como PAID**
- Se já existir um comprovante, ele será **substituído**
- A data de pagamento (`paidAt`) é definida automaticamente

---

#### 2. Visualizar Comprovante
**Endpoint:** `GET /commissions/:id/payment-proof`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Resposta de Sucesso (200):**
- Retorna o arquivo diretamente (stream)
- Content-Type: `image/jpeg`, `image/png`, ou `application/pdf`
- Content-Disposition: `inline; filename="comprovante_xxx.pdf"`

**Erros Possíveis:**
- `404`: Comissão não encontrada ou comprovante não existe
- `401`: Token inválido
- `403`: Sem permissão

**Como usar:**
- Para exibir em uma nova aba: `window.open(url, '_blank')`
- Para download: usar atributo `download` em link
- Para preview inline: usar `<iframe>` ou `<img>` dependendo do tipo

---

#### 3. Deletar Comprovante
**Endpoint:** `DELETE /commissions/:id/payment-proof`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Resposta de Sucesso (200):**
```json
{
  "id": "clx123abc",
  "status": "PAID",
  "paymentProofUrl": null,
  "paymentProofFileName": null,
  "paymentProofUploadedAt": null
}
```

**Erros Possíveis:**
- `404`: Comissão ou comprovante não encontrado
- `401`: Token inválido
- `403`: Sem permissão

**Comportamento:**
- Remove o comprovante do storage
- Limpa os campos relacionados no banco
- **NÃO altera o status da comissão** (continua PAID)

---

## Requisitos de UI/UX

### 1. Tela de Listagem de Comissões

**Adicionar indicador visual:**
- Ícone/badge mostrando se a comissão tem comprovante anexado
- Verificar se `paymentProofUrl !== null`

**Exemplo:**
```jsx
{commission.paymentProofUrl && (
  <Badge color="green">
    <FileCheck /> Comprovante Anexado
  </Badge>
)}
```

---

### 2. Modal/Formulário de Marcar como Paga

**Adicionar campo de upload:**

```jsx
<Form>
  <FormField
    label="Comprovante de Pagamento"
    required
    help="Aceita imagens (JPG, PNG) ou PDF. Máximo 5MB."
  >
    <FileInput
      accept="image/jpeg,image/png,image/jpg,application/pdf"
      maxSize={5 * 1024 * 1024} // 5MB
      onChange={handleFileChange}
    />
  </FormField>
  
  <Button type="submit">
    Marcar como Paga e Anexar Comprovante
  </Button>
</Form>
```

**Validações no Frontend:**
- Verificar tipo de arquivo antes do upload
- Verificar tamanho (5MB máximo)
- Mostrar preview do arquivo selecionado
- Exibir progresso do upload

**Exemplo de função de upload:**
```typescript
async function uploadPaymentProof(commissionId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_URL}/commissions/${commissionId}/payment-proof`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer upload');
  }

  return await response.json();
}
```

---

### 3. Visualização de Comprovante

**Botão para visualizar:**
```jsx
{commission.paymentProofUrl && (
  <Button
    variant="outline"
    onClick={() => viewPaymentProof(commission.id)}
  >
    <Eye /> Ver Comprovante
  </Button>
)}
```

**Opções de implementação:**

**Opção A - Nova aba:**
```typescript
function viewPaymentProof(commissionId: string) {
  const url = `${API_URL}/commissions/${commissionId}/payment-proof`;
  const headers = new Headers({
    'Authorization': `Bearer ${getAuthToken()}`,
  });
  
  // Abre em nova aba
  window.open(url, '_blank');
}
```

**Opção B - Modal com preview:**
```typescript
function viewPaymentProof(commissionId: string) {
  const url = `${API_URL}/commissions/${commissionId}/payment-proof`;
  
  // Exibir em modal
  setPreviewUrl(url);
  setShowModal(true);
}

// No modal:
<Modal>
  <iframe 
    src={previewUrl} 
    style={{ width: '100%', height: '600px' }}
  />
</Modal>
```

**Opção C - Download direto:**
```typescript
async function downloadPaymentProof(commissionId: string) {
  const response = await fetch(
    `${API_URL}/commissions/${commissionId}/payment-proof`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comprovante_${commissionId}.pdf`;
  a.click();
}
```

---

### 4. Deletar Comprovante

**Botão de exclusão (com confirmação):**
```jsx
{commission.paymentProofUrl && (
  <Button
    variant="destructive"
    onClick={() => handleDeleteProof(commission.id)}
  >
    <Trash /> Remover Comprovante
  </Button>
)}
```

**Função de exclusão:**
```typescript
async function deletePaymentProof(commissionId: string) {
  // Confirmar ação
  if (!confirm('Tem certeza que deseja remover o comprovante?')) {
    return;
  }

  const response = await fetch(
    `${API_URL}/commissions/${commissionId}/payment-proof`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao deletar comprovante');
  }

  // Atualizar lista
  await refreshCommissions();
}
```

---

## Fluxo Completo Recomendado

### Cenário 1: Marcar como Paga com Comprovante

1. Admin acessa lista de comissões pendentes
2. Clica em "Marcar como Paga" em uma comissão
3. Modal/formulário abre com campo de upload
4. Admin seleciona arquivo do comprovante
5. Sistema valida tipo e tamanho
6. Admin clica em "Confirmar"
7. Sistema faz upload via `POST /commissions/:id/payment-proof`
8. Comissão é marcada como PAID automaticamente
9. Modal fecha e lista é atualizada
10. Badge "Comprovante Anexado" aparece na comissão

### Cenário 2: Visualizar Comprovante Existente

1. Admin vê comissão com badge "Comprovante Anexado"
2. Clica em "Ver Comprovante"
3. Sistema abre comprovante em nova aba ou modal
4. Admin visualiza o PDF/imagem

### Cenário 3: Substituir Comprovante

1. Admin acessa comissão que já tem comprovante
2. Clica em "Substituir Comprovante"
3. Seleciona novo arquivo
4. Sistema faz upload (substitui automaticamente o anterior)
5. Comprovante antigo é deletado do storage

---

## Tratamento de Erros

**Erros de validação:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de arquivo não permitido. Use JPG, PNG ou PDF.';
  }
  
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Tamanho máximo: 5MB.';
  }
  
  return null; // Válido
}
```

**Erros de API:**
```typescript
try {
  await uploadPaymentProof(commissionId, file);
  toast.success('Comprovante anexado com sucesso!');
} catch (error) {
  if (error.status === 404) {
    toast.error('Comissão não encontrada');
  } else if (error.status === 403) {
    toast.error('Você não tem permissão para esta ação');
  } else if (error.status === 400) {
    toast.error(error.message || 'Arquivo inválido');
  } else {
    toast.error('Erro ao anexar comprovante. Tente novamente.');
  }
}
```

---

## Campos Adicionais no Modelo Commission

Ao buscar comissões, os seguintes campos estarão disponíveis:

```typescript
interface Commission {
  id: string;
  status: 'PENDING' | 'CALCULATED' | 'PAID' | 'CANCELLED';
  commissionValue: number;
  paidAt: string | null;
  
  // Novos campos de comprovante
  paymentProofUrl: string | null;
  paymentProofFileName: string | null;
  paymentProofUploadedAt: string | null;
  
  // ... outros campos
}
```

**Verificar se tem comprovante:**
```typescript
const hasProof = commission.paymentProofUrl !== null;
```

---

## Checklist de Implementação

- [ ] Adicionar campo de upload no formulário de "Marcar como Paga"
- [ ] Implementar validação de tipo e tamanho de arquivo
- [ ] Implementar função de upload com FormData
- [ ] Adicionar indicador visual de comprovante anexado na listagem
- [ ] Implementar botão/link para visualizar comprovante
- [ ] Implementar visualização (nova aba, modal ou download)
- [ ] Adicionar botão para deletar comprovante (opcional)
- [ ] Implementar tratamento de erros
- [ ] Adicionar feedback visual (loading, success, error)
- [ ] Testar com diferentes tipos de arquivo (JPG, PNG, PDF)
- [ ] Testar com arquivos grandes (validação de 5MB)
- [ ] Testar substituição de comprovante existente

---

## Observações Importantes

1. **Upload automático marca como paga**: Não precisa de endpoint separado para marcar como paga
2. **Substituição automática**: Se já existe comprovante, o novo substitui o antigo
3. **Autenticação**: Sempre incluir token JWT nos headers
4. **CORS**: API já está configurada para aceitar requisições do frontend
5. **Tipos de arquivo**: Validar no frontend E backend
6. **Preview**: PDFs podem ser exibidos em iframe, imagens em img tag

---

## Exemplo Completo (React + TypeScript)

```typescript
import { useState } from 'react';
import { toast } from 'react-toastify';

interface UploadProofModalProps {
  commissionId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function UploadProofModal({ commissionId, onSuccess, onClose }: UploadProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar
    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/commissions/${commissionId}/payment-proof`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Comprovante anexado e comissão marcada como paga!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao anexar comprovante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>Anexar Comprovante de Pagamento</h2>
        
        <FileInput
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileChange}
          required
        />
        
        {file && (
          <p>Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
        )}
        
        <Button type="submit" disabled={loading || !file}>
          {loading ? 'Enviando...' : 'Anexar e Marcar como Paga'}
        </Button>
      </form>
    </Modal>
  );
}

function validateFile(file: File): string | null {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const MAX_SIZE = 5 * 1024 * 1024;

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de arquivo não permitido. Use JPG, PNG ou PDF.';
  }
  
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Tamanho máximo: 5MB.';
  }
  
  return null;
}
```

---

## Suporte

Em caso de dúvidas sobre a API, consulte:
- Documentação completa: `docs/PAYMENT_PROOF_API.md`
- Guia rápido: `docs/PAYMENT_PROOF_QUICK_START.md`
