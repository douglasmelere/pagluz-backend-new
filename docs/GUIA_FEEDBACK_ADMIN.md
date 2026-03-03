# 🛡️ Guia de Implementação — Feedbacks (Painel Admin)

## Visão Geral

O painel admin permite gerenciar todos os feedbacks enviados pelos representantes. Inclui listagem com filtros, detalhes com thread de respostas, alteração de status/prioridade, métricas globais e exclusão.

---

## 🔗 Endpoints Disponíveis

Todos os endpoints requerem o token JWT do admin no header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/feedbacks/admin` | Listar todos (com filtros via query params) |
| `GET` | `/feedbacks/admin/metrics` | Métricas globais |
| `GET` | `/feedbacks/admin/:id` | Detalhes de um feedback |
| `PATCH` | `/feedbacks/admin/:id/status` | Atualizar status/prioridade |
| `POST` | `/feedbacks/admin/:id/respond` | Responder feedback |
| `DELETE` | `/feedbacks/admin/:id` | Excluir feedback (Manager+) |

### Query Params para Listagem (`GET /feedbacks/admin`)

| Param | Tipo | Valores |
|-------|------|---------|
| `status` | string | `OPEN`, `IN_ANALYSIS`, `RESOLVED`, `REJECTED` |
| `type` | string | `COMPLAINT`, `SUGGESTION`, `BUG`, `PRAISE` |
| `priority` | string | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `representativeId` | string | ID do representante |

---

## 📦 Tipos e Interfaces

```typescript
type FeedbackType = 'COMPLAINT' | 'SUGGESTION' | 'BUG' | 'PRAISE';
type FeedbackStatus = 'OPEN' | 'IN_ANALYSIS' | 'RESOLVED' | 'REJECTED';
type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Feedback {
  id: string;
  representativeId: string;
  representative: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
  };
  type: FeedbackType;
  subject: string;
  description: string;
  category?: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  attachmentUrl?: string;
  attachmentFileName?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  responses: FeedbackResponse[];
  _count?: { responses: number };
}

interface FeedbackResponse {
  id: string;
  feedbackId: string;
  message: string;
  authorType: 'ADMIN' | 'REPRESENTATIVE';
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface FeedbackMetrics {
  total: number;
  open: number;
  inAnalysis: number;
  resolved: number;
  rejected: number;
  byType: { type: FeedbackType; count: number }[];
  byPriority: { priority: FeedbackPriority; count: number }[];
  avgResolutionHours: number;
}
```

---

## 🛠️ Implementação Passo a Passo

### 1. Serviço de API (`feedbackAdminService.ts`)

```typescript
import api from './api'; // sua instância axios configurada

export const feedbackAdminService = {
  // Listar todos com filtros
  list: (params?: {
    status?: string;
    type?: string;
    priority?: string;
    representativeId?: string;
  }) => api.get('/feedbacks/admin', { params }),

  // Métricas globais
  metrics: () => api.get('/feedbacks/admin/metrics'),

  // Detalhes
  getById: (id: string) => api.get(`/feedbacks/admin/${id}`),

  // Atualizar status/prioridade
  updateStatus: (id: string, data: {
    status: FeedbackStatus;
    priority?: FeedbackPriority;
  }) => api.patch(`/feedbacks/admin/${id}/status`, data),

  // Responder
  respond: (id: string, message: string) =>
    api.post(`/feedbacks/admin/${id}/respond`, { message }),

  // Excluir
  remove: (id: string) => api.delete(`/feedbacks/admin/${id}`),
};
```

### 2. Dashboard de Métricas (Parte Superior da Página)

```tsx
function FeedbackMetrics() {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);

  useEffect(() => {
    feedbackAdminService.metrics().then(({ data }) => setMetrics(data));
  }, []);

  return (
    <div>
      {/* Cards principais */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Total" value={metrics?.total} icon="📋" />
        <MetricCard label="Abertos" value={metrics?.open} icon="🟡" color="warning" />
        <MetricCard label="Em Análise" value={metrics?.inAnalysis} icon="🔵" color="info" />
        <MetricCard label="Resolvidos" value={metrics?.resolved} icon="🟢" color="success" />
        <MetricCard label="Recusados" value={metrics?.rejected} icon="⚪" color="default" />
      </div>

      {/* Tempo médio de resolução */}
      <div className="mt-4">
        <p>⏱️ Tempo médio de resolução: <strong>{metrics?.avgResolutionHours}h</strong></p>
      </div>

      {/* Mini-gráficos por tipo e prioridade */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4>Por Tipo</h4>
          {metrics?.byType.map(t => (
            <div key={t.type}>
              {getTypeLabel(t.type)}: {t.count}
            </div>
          ))}
        </div>
        <div>
          <h4>Por Prioridade</h4>
          {metrics?.byPriority.map(p => (
            <div key={p.priority}>
              {getPriorityLabel(p.priority)}: {p.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Tabela de Feedbacks com Filtros

```tsx
function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
  });

  useEffect(() => {
    loadFeedbacks();
  }, [filters]);

  const loadFeedbacks = async () => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    const { data } = await feedbackAdminService.list(params);
    setFeedbacks(data);
  };

  return (
    <div>
      {/* Barra de filtros */}
      <div className="filters flex gap-4">
        <select onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Todos os Status</option>
          <option value="OPEN">🟡 Aberto</option>
          <option value="IN_ANALYSIS">🔵 Em Análise</option>
          <option value="RESOLVED">🟢 Resolvido</option>
          <option value="REJECTED">⚪ Recusado</option>
        </select>

        <select onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Todos os Tipos</option>
          <option value="COMPLAINT">🔴 Reclamação</option>
          <option value="SUGGESTION">💡 Sugestão</option>
          <option value="BUG">🐛 Bug</option>
          <option value="PRAISE">⭐ Elogio</option>
        </select>

        <select onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">Todas as Prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">🔴 Crítica</option>
        </select>
      </div>

      {/* Tabela */}
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Assunto</th>
            <th>Representante</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Respostas</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map(fb => (
            <tr key={fb.id}>
              <td><TypeBadge type={fb.type} /></td>
              <td>{fb.subject}</td>
              <td>{fb.representative.name}</td>
              <td><StatusBadge status={fb.status} /></td>
              <td><PriorityBadge priority={fb.priority} /></td>
              <td>{fb._count?.responses || 0}</td>
              <td>{new Date(fb.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => openDetail(fb.id)}>👁️</button>
                <button onClick={() => openStatusModal(fb)}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Tela de Detalhes com Ações do Admin

```tsx
function FeedbackAdminDetail({ feedbackId }: { feedbackId: string }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFeedback();
  }, [feedbackId]);

  const loadFeedback = async () => {
    const { data } = await feedbackAdminService.getById(feedbackId);
    setFeedback(data);
  };

  const handleUpdateStatus = async (status: FeedbackStatus, priority?: FeedbackPriority) => {
    await feedbackAdminService.updateStatus(feedbackId, { status, priority });
    loadFeedback();
    toast.success('Status atualizado!');
  };

  const handleRespond = async () => {
    await feedbackAdminService.respond(feedbackId, message);
    setMessage('');
    loadFeedback();
    toast.success('Resposta enviada!');
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este feedback?')) {
      await feedbackAdminService.remove(feedbackId);
      navigate('/admin/feedbacks');
    }
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="header">
        <TypeBadge type={feedback?.type} />
        <h2>{feedback?.subject}</h2>
        <StatusBadge status={feedback?.status} />
        <PriorityBadge priority={feedback?.priority} />
      </div>

      {/* Dados do representante */}
      <div className="representative-info">
        <p>👤 {feedback?.representative.name}</p>
        <p>📧 {feedback?.representative.email}</p>
        <p>📱 {feedback?.representative.phone}</p>
        <p>📍 {feedback?.representative.city} - {feedback?.representative.state}</p>
      </div>

      {/* Descrição */}
      <div className="description">
        <h3>Descrição</h3>
        <p>{feedback?.description}</p>
        {feedback?.category && <span>Categoria: {feedback.category}</span>}
        {feedback?.attachmentUrl && (
          <a href={feedback.attachmentUrl} target="_blank">📎 {feedback.attachmentFileName}</a>
        )}
      </div>

      {/* Botões de ação de status */}
      <div className="actions">
        <h3>Alterar Status</h3>
        <button onClick={() => handleUpdateStatus('IN_ANALYSIS')}>🔵 Colocar em Análise</button>
        <button onClick={() => handleUpdateStatus('RESOLVED')}>🟢 Marcar como Resolvido</button>
        <button onClick={() => handleUpdateStatus('REJECTED')}>⚪ Recusar</button>
        <button onClick={() => handleUpdateStatus('OPEN')}>🟡 Reabrir</button>
      </div>

      {/* Alterar prioridade */}
      <div className="priority">
        <h3>Prioridade</h3>
        <select
          value={feedback?.priority}
          onChange={e => handleUpdateStatus(feedback!.status, e.target.value as FeedbackPriority)}
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
      </div>

      {/* Thread de respostas */}
      <div className="thread">
        <h3>Conversa ({feedback?.responses.length || 0} respostas)</h3>
        {feedback?.responses.map(resp => (
          <div
            key={resp.id}
            className={`message ${resp.authorType === 'ADMIN' ? 'admin' : 'rep'}`}
          >
            <div className="message-header">
              <strong>{resp.authorName}</strong>
              <span className="badge">
                {resp.authorType === 'ADMIN' ? '👨‍💼 Admin' : '👤 Representante'}
              </span>
              <small>{new Date(resp.createdAt).toLocaleString()}</small>
            </div>
            <p>{resp.message}</p>
          </div>
        ))}
      </div>

      {/* Campo de resposta */}
      <div className="reply-box">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Escreva sua resposta ao representante..."
          rows={4}
        />
        <button onClick={handleRespond} disabled={!message.trim()}>
          📤 Enviar Resposta
        </button>
      </div>

      {/* Botão de excluir (apenas Manager+) */}
      <div className="danger-zone">
        <button className="danger" onClick={handleDelete}>
          🗑️ Excluir Feedback
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 Sugestões de Design

### Labels de Tipo
| Tipo | Label PT-BR | Cor | Ícone |
|------|------------|-----|-------|
| COMPLAINT | Reclamação | `#EF4444` (vermelho) | 🔴 |
| SUGGESTION | Sugestão | `#3B82F6` (azul) | 💡 |
| BUG | Bug | `#F97316` (laranja) | 🐛 |
| PRAISE | Elogio | `#22C55E` (verde) | ⭐ |

### Labels de Status
| Status | Label PT-BR | Cor |
|--------|------------|-----|
| OPEN | Aberto | `#EAB308` |
| IN_ANALYSIS | Em Análise | `#3B82F6` |
| RESOLVED | Resolvido | `#22C55E` |
| REJECTED | Recusado | `#6B7280` |

### Labels de Prioridade
| Prioridade | Label PT-BR | Cor |
|------------|------------|-----|
| LOW | Baixa | `#6B7280` |
| MEDIUM | Média | `#EAB308` |
| HIGH | Alta | `#F97316` |
| CRITICAL | Crítica | `#EF4444` |

---

## 📱 Rotas Sugeridas no Admin

```
/admin/feedbacks              → Lista com métricas + tabela com filtros
/admin/feedbacks/:id          → Detalhes + Thread + Ações
```

---

## 🔔 Integração com Notificações (Opcional)

Você pode adicionar um badge no menu do admin mostrando a quantidade de feedbacks abertos:

```typescript
// No componente de sidebar/header
const { data: metrics } = await feedbackAdminService.metrics();
const pendingCount = metrics.open + metrics.inAnalysis;

<NavItem to="/admin/feedbacks">
  Feedbacks
  {pendingCount > 0 && <Badge variant="warning">{pendingCount}</Badge>}
</NavItem>
```

---

## ✅ Checklist de Implementação

- [ ] Criar serviço de API (`feedbackAdminService.ts`)
- [ ] Criar componente de métricas (cards de contagem + tempo médio)
- [ ] Criar tabela de feedbacks com filtros por status/tipo/prioridade
- [ ] Criar tela de detalhes com:
  - [ ] Info do representante
  - [ ] Thread de respostas (estilo chat)
  - [ ] Botões de alterar status
  - [ ] Seletor de prioridade
  - [ ] Campo de resposta
  - [ ] Botão de excluir (com confirmação)
- [ ] Adicionar item "Feedbacks" no menu lateral com badge
- [ ] Adicionar badges de tipo/status/prioridade reutilizáveis
- [ ] Testar fluxo completo: receber → analisar → responder → resolver
