# Prompt: Visualização de Comprovantes de Pagamento - Sistema Representantes

## Contexto

Preciso implementar a funcionalidade de visualização de comprovantes de pagamento no sistema de representantes comerciais. Os representantes devem poder visualizar os comprovantes das comissões que foram pagas a eles, para terem certeza de que o pagamento foi realizado.

## Objetivo

Adicionar interface para que representantes possam:
1. Ver quais comissões têm comprovante de pagamento anexado
2. Visualizar/baixar os comprovantes de suas próprias comissões

## ⚡ Método Simplificado (Novo!)

A API agora suporta **token na query string**, permitindo visualização de comprovantes de forma muito mais simples:

```typescript
// Método MAIS SIMPLES - Recomendado!
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  window.open(url, '_blank'); // Pronto! 🎉
}
```

Não precisa mais de fetch, blob, ou manipulação complexa. Apenas construa a URL com o token e abra em nova aba!

---

## Especificações da API

### Base URL
```
http://localhost:3000
```
ou a URL de produção configurada.

### Autenticação
Todos os endpoints requerem token JWT de Representante no header:
```
Authorization: Bearer <representative_token>
```

### Endpoint Disponível

#### Visualizar Comprovante da Comissão
**Endpoint:** `GET /commissions/representative/:id/payment-proof`

**Headers:**
```
Authorization: Bearer <representative_token>
```

**Parâmetros:**
- `:id` - ID da comissão (deve pertencer ao representante logado)

**Query Parameters (opcional):**
- `token` - Token JWT (alternativa ao header Authorization, útil para abrir em nova aba)

**Resposta de Sucesso (200):**
- Retorna o arquivo diretamente (stream)
- Content-Type: `image/jpeg`, `image/png`, ou `application/pdf`
- Content-Disposition: `inline; filename="comprovante_xxx.pdf"`

**Erros Possíveis:**
- `404`: Comissão não encontrada ou comprovante não existe
- `401`: Token inválido ou expirado
- `403`: Comissão não pertence ao representante logado
- `500`: Erro no servidor

**Segurança:**
- Representantes só podem visualizar comprovantes de suas próprias comissões
- Se tentar acessar comissão de outro representante, retorna 403
- Token pode ser enviado no header Authorization OU como query parameter `?token=`

---

## Endpoints Auxiliares (já existentes)

### Listar Minhas Comissões
**Endpoint:** `GET /commissions/representative/my-commissions`

**Headers:**
```
Authorization: Bearer <representative_token>
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "clx123abc",
    "status": "PAID",
    "commissionValue": 150.00,
    "calculatedAt": "2024-01-10T10:00:00.000Z",
    "paidAt": "2024-01-15T10:30:00.000Z",
    
    // Campos de comprovante
    "paymentProofUrl": "https://supabase.pagluz.com.br/storage/v1/object/public/comprovantes-pagamento/...",
    "paymentProofFileName": "clx123abc/comprovante_1234567890.pdf",
    "paymentProofUploadedAt": "2024-01-15T10:30:00.000Z",
    
    "consumer": {
      "id": "cons123",
      "name": "Maria Santos",
      "cpfCnpj": "12345678900",
      "city": "São Paulo",
      "state": "SP"
    }
  },
  {
    "id": "clx456def",
    "status": "CALCULATED",
    "commissionValue": 200.00,
    "calculatedAt": "2024-01-12T14:00:00.000Z",
    "paidAt": null,
    
    // Sem comprovante
    "paymentProofUrl": null,
    "paymentProofFileName": null,
    "paymentProofUploadedAt": null,
    
    "consumer": {
      "id": "cons456",
      "name": "João Oliveira",
      "cpfCnpj": "98765432100",
      "city": "Rio de Janeiro",
      "state": "RJ"
    }
  }
]
```

### Obter Detalhes de uma Comissão
**Endpoint:** `GET /commissions/representative/:id`

**Headers:**
```
Authorization: Bearer <representative_token>
```

**Resposta de Sucesso (200):**
```json
{
  "id": "clx123abc",
  "status": "PAID",
  "commissionValue": 150.00,
  "kwhConsumption": 800,
  "kwhPrice": 0.625,
  "calculatedAt": "2024-01-10T10:00:00.000Z",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "notes": null,
  
  // Campos de comprovante
  "paymentProofUrl": "https://supabase.pagluz.com.br/storage/v1/object/public/comprovantes-pagamento/...",
  "paymentProofFileName": "clx123abc/comprovante_1234567890.pdf",
  "paymentProofUploadedAt": "2024-01-15T10:30:00.000Z",
  
  "representative": {
    "id": "rep123",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321"
  },
  "consumer": {
    "id": "cons123",
    "name": "Maria Santos",
    "cpfCnpj": "12345678900",
    "averageMonthlyConsumption": 800,
    "city": "São Paulo",
    "state": "SP",
    "approvalStatus": "APPROVED",
    "approvedAt": "2024-01-08T09:00:00.000Z"
  }
}
```

---

## Requisitos de UI/UX

### 1. Tela de Listagem de Comissões

**Adicionar indicadores visuais:**

```jsx
// Badge de status com comprovante
function CommissionStatusBadge({ commission }) {
  if (commission.status === 'PAID' && commission.paymentProofUrl) {
    return (
      <Badge color="green">
        <CheckCircle /> Paga - Comprovante Disponível
      </Badge>
    );
  }
  
  if (commission.status === 'PAID' && !commission.paymentProofUrl) {
    return (
      <Badge color="yellow">
        <Clock /> Paga - Aguardando Comprovante
      </Badge>
    );
  }
  
  if (commission.status === 'CALCULATED') {
    return (
      <Badge color="blue">
        <Clock /> Pendente de Pagamento
      </Badge>
    );
  }
  
  return <Badge color="gray">{commission.status}</Badge>;
}
```

**Coluna/Card com ação de visualizar:**

```jsx
// Em uma tabela
<Table>
  <TableRow>
    <TableCell>{commission.consumer.name}</TableCell>
    <TableCell>R$ {commission.commissionValue.toFixed(2)}</TableCell>
    <TableCell>
      <CommissionStatusBadge commission={commission} />
    </TableCell>
    <TableCell>
      {commission.paymentProofUrl && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => viewPaymentProof(commission.id)}
        >
          <FileText /> Ver Comprovante
        </Button>
      )}
    </TableCell>
  </TableRow>
</Table>

// Ou em cards (mobile-friendly)
<Card>
  <CardHeader>
    <h3>{commission.consumer.name}</h3>
    <CommissionStatusBadge commission={commission} />
  </CardHeader>
  <CardBody>
    <p>Valor: R$ {commission.commissionValue.toFixed(2)}</p>
    <p>Data: {formatDate(commission.paidAt || commission.calculatedAt)}</p>
  </CardBody>
  <CardFooter>
    {commission.paymentProofUrl && (
      <Button onClick={() => viewPaymentProof(commission.id)}>
        <Eye /> Ver Comprovante
      </Button>
    )}
  </CardFooter>
</Card>
```

---

### 2. Visualização de Comprovante

**Opção A - Abrir em Nova Aba (Recomendado - Mais Simples):**

```typescript
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  
  // Abre diretamente em nova aba
  window.open(url, '_blank');
}
```

**Opção B - Abrir em Nova Aba com Fetch (se precisar validar antes):**

```typescript
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof`;
  
  // Criar link temporário com autenticação
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar comprovante');
      }
      return response.blob();
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Limpar URL após alguns segundos
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    })
    .catch(error => {
      toast.error('Erro ao carregar comprovante');
      console.error(error);
    });
}
```

**Opção C - Modal com Preview:**

```typescript
import { useState } from 'react';

function CommissionsList() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | null>(null);

  const viewPaymentProof = async (commissionId: string) => {
    const token = localStorage.getItem('representative_token');
    const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar comprovante');
      }

      const contentType = response.headers.get('Content-Type');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setPreviewUrl(blobUrl);
      setPreviewType(contentType?.includes('pdf') ? 'pdf' : 'image');
    } catch (error) {
      toast.error('Erro ao carregar comprovante');
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewType(null);
  };

  return (
    <>
      {/* Lista de comissões */}
      
      {/* Modal de preview */}
      {previewUrl && (
        <Modal onClose={closePreview} size="large">
          <ModalHeader>
            <h2>Comprovante de Pagamento</h2>
          </ModalHeader>
          <ModalBody>
            {previewType === 'pdf' ? (
              <iframe
                src={previewUrl}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="Comprovante de Pagamento"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Comprovante de Pagamento"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => downloadProof(previewUrl)}>
              <Download /> Baixar
            </Button>
            <Button variant="outline" onClick={closePreview}>
              Fechar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
```

**Opção D - Download Direto:**

```typescript
async function downloadPaymentProof(commissionId: string, consumerName: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao baixar comprovante');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // Criar link de download
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `comprovante_${consumerName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Limpar
    URL.revokeObjectURL(blobUrl);
    
    toast.success('Comprovante baixado com sucesso!');
  } catch (error) {
    toast.error('Erro ao baixar comprovante');
    console.error(error);
  }
}
```

**💡 Recomendação:** Use a **Opção A** (mais simples) para a maioria dos casos. É a forma mais direta e funciona perfeitamente!

---

### 3. Tela de Detalhes da Comissão

**Adicionar seção de comprovante:**

```jsx
function CommissionDetails({ commissionId }) {
  const [commission, setCommission] = useState(null);

  useEffect(() => {
    fetchCommissionDetails(commissionId);
  }, [commissionId]);

  return (
    <div>
      <h1>Detalhes da Comissão</h1>
      
      {/* Informações básicas */}
      <Section>
        <h2>Informações</h2>
        <p>Consumidor: {commission?.consumer.name}</p>
        <p>Valor: R$ {commission?.commissionValue.toFixed(2)}</p>
        <p>Status: {commission?.status}</p>
      </Section>

      {/* Seção de comprovante */}
      {commission?.status === 'PAID' && (
        <Section>
          <h2>Comprovante de Pagamento</h2>
          
          {commission.paymentProofUrl ? (
            <div>
              <Alert type="success">
                <CheckCircle /> Comprovante anexado em {formatDate(commission.paymentProofUploadedAt)}
              </Alert>
              
              <ButtonGroup>
                <Button onClick={() => viewPaymentProof(commission.id)}>
                  <Eye /> Visualizar Comprovante
                </Button>
                <Button variant="outline" onClick={() => downloadPaymentProof(commission.id, commission.consumer.name)}>
                  <Download /> Baixar Comprovante
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <Alert type="warning">
              <Clock /> Comprovante ainda não foi anexado. Aguarde o processamento do pagamento.
            </Alert>
          )}
        </Section>
      )}
    </div>
  );
}
```

---

## Tratamento de Erros

```typescript
async function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status === 404) {
      toast.error('Comprovante não encontrado. Entre em contato com o suporte.');
      return;
    }

    if (response.status === 403) {
      toast.error('Você não tem permissão para visualizar este comprovante.');
      return;
    }

    if (response.status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      // Redirecionar para login
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error('Erro ao carregar comprovante');
    }

    // Processar arquivo
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    
  } catch (error) {
    console.error('Erro ao visualizar comprovante:', error);
    toast.error('Erro ao carregar comprovante. Tente novamente mais tarde.');
  }
}
```

---

## Campos Disponíveis no Modelo Commission

```typescript
interface Commission {
  id: string;
  status: 'PENDING' | 'CALCULATED' | 'PAID' | 'CANCELLED';
  commissionValue: number;
  kwhConsumption: number;
  kwhPrice: number;
  calculatedAt: string;
  paidAt: string | null;
  notes: string | null;
  
  // Campos de comprovante
  paymentProofUrl: string | null;
  paymentProofFileName: string | null;
  paymentProofUploadedAt: string | null;
  
  consumer: {
    id: string;
    name: string;
    cpfCnpj: string;
    city: string;
    state: string;
    averageMonthlyConsumption: number;
    approvalStatus: string;
    approvedAt: string;
  };
  
  representative: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}
```

**Verificações úteis:**

```typescript
// Tem comprovante?
const hasProof = commission.paymentProofUrl !== null;

// Foi paga?
const isPaid = commission.status === 'PAID';

// Paga mas sem comprovante?
const paidWithoutProof = isPaid && !hasProof;

// Paga com comprovante?
const paidWithProof = isPaid && hasProof;
```

---

## Fluxo de Uso Típico

### Cenário 1: Verificar Comissões Pagas

1. Representante acessa "Minhas Comissões"
2. Sistema lista todas as comissões
3. Representante vê badges indicando status:
   - 🟢 "Paga - Comprovante Disponível"
   - 🟡 "Paga - Aguardando Comprovante"
   - 🔵 "Pendente de Pagamento"
4. Representante filtra/ordena por status

### Cenário 2: Visualizar Comprovante

1. Representante vê comissão com status "Paga - Comprovante Disponível"
2. Clica em "Ver Comprovante"
3. Sistema abre comprovante em nova aba ou modal
4. Representante visualiza PDF ou imagem do comprovante
5. Representante pode baixar o comprovante se desejar

### Cenário 3: Comissão Paga sem Comprovante

1. Representante vê comissão com status "Paga - Aguardando Comprovante"
2. Sistema exibe mensagem: "Comprovante ainda não foi anexado"
3. Representante aguarda ou entra em contato com suporte

---

## Funcionalidades Adicionais Recomendadas

### 1. Filtros

```jsx
<FilterBar>
  <Select
    label="Status"
    options={[
      { value: 'all', label: 'Todas' },
      { value: 'paid_with_proof', label: 'Pagas com Comprovante' },
      { value: 'paid_without_proof', label: 'Pagas sem Comprovante' },
      { value: 'pending', label: 'Pendentes' },
    ]}
    onChange={handleFilterChange}
  />
</FilterBar>
```

### 2. Estatísticas

```jsx
<StatsCards>
  <StatCard
    title="Comissões Pagas"
    value={`R$ ${totalPaid.toFixed(2)}`}
    icon={<DollarSign />}
  />
  <StatCard
    title="Com Comprovante"
    value={commissionsWithProof}
    icon={<FileCheck />}
  />
  <StatCard
    title="Aguardando Comprovante"
    value={commissionsWithoutProof}
    icon={<Clock />}
  />
</StatsCards>
```

### 3. Notificações

```jsx
// Quando novo comprovante for anexado
useEffect(() => {
  // Polling ou WebSocket para verificar novos comprovantes
  const interval = setInterval(() => {
    checkForNewProofs();
  }, 60000); // A cada 1 minuto

  return () => clearInterval(interval);
}, []);

function checkForNewProofs() {
  // Buscar comissões e verificar se há novos comprovantes
  // Se houver, mostrar notificação
  if (hasNewProofs) {
    toast.info('Novo comprovante de pagamento disponível!');
  }
}
```

---

## Checklist de Implementação

- [ ] Adicionar badge de status na listagem de comissões
- [ ] Diferenciar visualmente comissões com/sem comprovante
- [ ] Implementar botão "Ver Comprovante" (apenas se existir)
- [ ] Implementar função de visualização de comprovante
- [ ] Escolher método de exibição (nova aba, modal ou download)
- [ ] Implementar tratamento de erros (404, 403, 401)
- [ ] Adicionar feedback visual (loading, success, error)
- [ ] Testar com diferentes tipos de arquivo (PDF e imagens)
- [ ] Testar erro quando comprovante não existe
- [ ] Testar erro quando tentar acessar comissão de outro representante
- [ ] Adicionar filtros por status (opcional)
- [ ] Adicionar estatísticas de comprovantes (opcional)
- [ ] Testar em mobile (responsividade)

---

## Exemplo Completo (React + TypeScript)

```typescript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Commission {
  id: string;
  status: string;
  commissionValue: number;
  paidAt: string | null;
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  consumer: {
    name: string;
    city: string;
    state: string;
  };
}

export function MyCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/commissions/representative/my-commissions`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('representative_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erro ao carregar comissões');

      const data = await response.json();
      setCommissions(data);
    } catch (error) {
      toast.error('Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentProof = async (commissionId: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('representative_token')}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Comprovante não encontrado');
        } else {
          throw new Error('Erro ao carregar comprovante');
        }
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    } catch (error) {
      toast.error('Erro ao carregar comprovante');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Minhas Comissões</h1>

      <table>
        <thead>
          <tr>
            <th>Consumidor</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map(commission => (
            <tr key={commission.id}>
              <td>{commission.consumer.name}</td>
              <td>R$ {commission.commissionValue.toFixed(2)}</td>
              <td>
                {commission.status === 'PAID' && commission.paymentProofUrl ? (
                  <span className="badge badge-success">
                    ✓ Paga - Comprovante Disponível
                  </span>
                ) : commission.status === 'PAID' ? (
                  <span className="badge badge-warning">
                    ⏳ Paga - Aguardando Comprovante
                  </span>
                ) : (
                  <span className="badge badge-info">
                    ⏳ Pendente
                  </span>
                )}
              </td>
              <td>
                {commission.paymentProofUrl && (
                  <button
                    onClick={() => viewPaymentProof(commission.id)}
                    className="btn btn-sm btn-outline"
                  >
                    Ver Comprovante
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de preview */}
      {previewUrl && (
        <div className="modal">
          <div className="modal-content">
            <h2>Comprovante de Pagamento</h2>
            <iframe src={previewUrl} style={{ width: '100%', height: '600px' }} />
            <button onClick={() => {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Observações Importantes

1. **Somente leitura**: Representantes NÃO podem fazer upload ou deletar comprovantes
2. **Segurança**: API valida que a comissão pertence ao representante logado
3. **Tipos de arquivo**: Comprovantes podem ser PDF ou imagens (JPG, PNG)
4. **Autenticação**: Sempre incluir token JWT nos headers
5. **Preview**: Use iframe para PDFs e img tag para imagens
6. **Mobile**: Considere usar download direto em dispositivos móveis

---

## Suporte

Em caso de dúvidas sobre a API, consulte:
- Documentação completa: `docs/PAYMENT_PROOF_API.md`
- Guia rápido: `docs/PAYMENT_PROOF_QUICK_START.md`
