# 🎯 PROMPT PARA O SISTEMA DE REPRESENTANTES - COPIE TUDO ABAIXO

---

# Visualização de Comprovantes de Pagamento - Sistema Representantes

## Contexto

Preciso implementar a funcionalidade de visualização de comprovantes de pagamento no sistema de representantes comerciais. Os representantes devem poder visualizar os comprovantes das comissões que foram pagas a eles.

## ⚡ Método Simplificado (IMPORTANTE!)

A API suporta **token na query string**, tornando a implementação muito simples:

```typescript
// Método RECOMENDADO - Mais Simples!
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  window.open(url, '_blank'); // Pronto! 🎉
}
```

**Não precisa** de fetch, blob, ou manipulação complexa!

---

## Endpoint Principal

### Visualizar Comprovante da Comissão
**Endpoint:** `GET /commissions/representative/:id/payment-proof`

**Autenticação:** 
- Header: `Authorization: Bearer <token>` OU
- Query string: `?token=<token>` (recomendado para abrir em nova aba)

**Parâmetros:**
- `:id` - ID da comissão

**Resposta (200):**
- Retorna o arquivo diretamente (PDF ou imagem)
- Content-Type: `image/jpeg`, `image/png`, ou `application/pdf`

**Erros:**
- `404`: Comprovante não encontrado
- `401`: Token inválido
- `403`: Comissão não pertence ao representante

**Segurança:**
- Representantes só veem comprovantes de suas próprias comissões

---

## Implementação Recomendada

### 1. Listagem de Comissões com Badge

```tsx
function CommissionsList() {
  const [commissions, setCommissions] = useState([]);

  // Badge de status
  function StatusBadge({ commission }) {
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
    
    return <Badge color="blue">Pendente</Badge>;
  }

  return (
    <div>
      {commissions.map(commission => (
        <Card key={commission.id}>
          <CardHeader>
            <h3>{commission.consumer.name}</h3>
            <StatusBadge commission={commission} />
          </CardHeader>
          <CardBody>
            <p>Valor: R$ {commission.commissionValue.toFixed(2)}</p>
          </CardBody>
          <CardFooter>
            {commission.paymentProofUrl && (
              <Button onClick={() => viewPaymentProof(commission.id)}>
                <Eye /> Ver Comprovante
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Função de Visualização (SIMPLES!)

```typescript
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  
  window.open(url, '_blank');
}
```

### 3. Tela de Detalhes com Comprovante

```tsx
function CommissionDetails({ commissionId }) {
  const [commission, setCommission] = useState(null);

  return (
    <div>
      <h1>Detalhes da Comissão</h1>
      
      {/* Informações básicas */}
      <Section>
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
              
              <Button onClick={() => viewPaymentProof(commission.id)}>
                <Eye /> Visualizar Comprovante
              </Button>
            </div>
          ) : (
            <Alert type="warning">
              <Clock /> Comprovante ainda não foi anexado.
            </Alert>
          )}
        </Section>
      )}
    </div>
  );
}
```

---

## Endpoint Auxiliar (já existe)

### Listar Minhas Comissões
**Endpoint:** `GET /commissions/representative/my-commissions`

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
[
  {
    "id": "clx123abc",
    "status": "PAID",
    "commissionValue": 150.00,
    "paidAt": "2024-01-15T10:30:00.000Z",
    "paymentProofUrl": "https://...",
    "paymentProofFileName": "...",
    "paymentProofUploadedAt": "2024-01-15T10:30:00.000Z",
    "consumer": {
      "name": "Maria Santos",
      "cpfCnpj": "12345678900"
    }
  }
]
```

---

## Campos do Modelo Commission

```typescript
interface Commission {
  id: string;
  status: 'PENDING' | 'CALCULATED' | 'PAID' | 'CANCELLED';
  commissionValue: number;
  paidAt: string | null;
  
  // Campos de comprovante
  paymentProofUrl: string | null;
  paymentProofFileName: string | null;
  paymentProofUploadedAt: string | null;
  
  consumer: {
    name: string;
    cpfCnpj: string;
  };
}
```

**Verificações úteis:**
```typescript
const hasProof = commission.paymentProofUrl !== null;
const isPaid = commission.status === 'PAID';
const paidWithProof = isPaid && hasProof;
```

---

## Tratamento de Erros

```typescript
function viewPaymentProof(commissionId: string) {
  const token = localStorage.getItem('representative_token');
  
  if (!token) {
    toast.error('Sessão expirada. Faça login novamente.');
    window.location.href = '/login';
    return;
  }
  
  const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
  
  // Abrir em nova aba
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow) {
    toast.error('Pop-up bloqueado. Permita pop-ups para visualizar comprovantes.');
  }
}
```

---

## Funcionalidades Adicionais (Opcional)

### 1. Filtros

```tsx
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

```tsx
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
</StatsCards>
```

---

## Checklist de Implementação

- [ ] Adicionar badge de status na listagem
- [ ] Implementar função `viewPaymentProof` (método simples)
- [ ] Adicionar botão "Ver Comprovante" (apenas se existir)
- [ ] Testar abertura em nova aba
- [ ] Implementar tratamento de erro (pop-up bloqueado)
- [ ] Testar com PDF e imagens
- [ ] Testar erro quando comprovante não existe
- [ ] Adicionar filtros (opcional)
- [ ] Testar em mobile

---

## Exemplo Completo

```typescript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function MyCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

      if (!response.ok) throw new Error('Erro ao carregar');

      const data = await response.json();
      setCommissions(data);
    } catch (error) {
      toast.error('Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentProof = (commissionId: string) => {
    const token = localStorage.getItem('representative_token');
    const url = `${process.env.REACT_APP_API_URL}/commissions/representative/${commissionId}/payment-proof?token=${token}`;
    window.open(url, '_blank');
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
                    ⏳ Paga - Aguardando
                  </span>
                ) : (
                  <span className="badge badge-info">Pendente</span>
                )}
              </td>
              <td>
                {commission.paymentProofUrl && (
                  <button
                    onClick={() => viewPaymentProof(commission.id)}
                    className="btn btn-sm"
                  >
                    Ver Comprovante
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Observações Importantes

1. **Método Simples**: Use `window.open()` com token na URL - é o mais fácil!
2. **Somente Leitura**: Representantes NÃO podem fazer upload ou deletar
3. **Segurança**: API valida que a comissão pertence ao representante
4. **Tipos**: Comprovantes podem ser PDF ou imagens (JPG, PNG)
5. **Mobile**: Funciona perfeitamente em dispositivos móveis

---

## Testando

URL de teste (substitua os valores):
```
http://localhost:3000/commissions/representative/COMMISSION_ID/payment-proof?token=SEU_TOKEN
```

---

**Pronto para implementar! 🚀**
