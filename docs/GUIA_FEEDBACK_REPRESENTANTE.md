# 📋 Guia de Implementação — Feedbacks (App do Representante)

## Visão Geral

O módulo de Feedbacks permite que representantes enviem reclamações, sugestões, reports de bugs e elogios diretamente pelo app. Funciona como um canal de comunicação bidirecional com o admin, com sistema de thread de respostas.

---

## 🔗 Endpoints Disponíveis

Todos os endpoints requerem o token JWT do representante no header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/feedbacks/representative` | Criar novo feedback |
| `GET` | `/feedbacks/representative/my-feedbacks` | Listar todos os meus feedbacks |
| `GET` | `/feedbacks/representative/counts` | Contagem por status |
| `GET` | `/feedbacks/representative/:id` | Ver detalhes de um feedback |
| `POST` | `/feedbacks/representative/:id/respond` | Responder no thread |

---

## 📦 Tipos e Interfaces

```typescript
// Tipos de feedback
type FeedbackType = 'COMPLAINT' | 'SUGGESTION' | 'BUG' | 'PRAISE';

// Status do feedback
type FeedbackStatus = 'OPEN' | 'IN_ANALYSIS' | 'RESOLVED' | 'REJECTED';

// Prioridade (definida pelo admin)
type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Interface do Feedback
interface Feedback {
  id: string;
  representativeId: string;
  type: FeedbackType;
  subject: string;
  description: string;
  category?: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  attachmentUrl?: string;
  attachmentFileName?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  responses: FeedbackResponse[];
  _count?: { responses: number };
}

// Interface da Resposta
interface FeedbackResponse {
  id: string;
  feedbackId: string;
  message: string;
  authorType: 'ADMIN' | 'REPRESENTATIVE';
  authorId: string;
  authorName: string;
  createdAt: string;
}

// Interface de Contagem
interface FeedbackCounts {
  total: number;
  open: number;
  inAnalysis: number;
  resolved: number;
  rejected: number;
}
```

---

## 🛠️ Implementação Passo a Passo

### 1. Serviço de API (`feedbackService.ts`)

```typescript
import api from './api'; // sua instância axios configurada

export const feedbackService = {
  // Criar feedback
  create: (data: {
    type: FeedbackType;
    subject: string;
    description: string;
    category?: string;
    attachmentUrl?: string;
    attachmentFileName?: string;
  }) => api.post('/feedbacks/representative', data),

  // Listar meus feedbacks
  list: () => api.get('/feedbacks/representative/my-feedbacks'),

  // Contagem por status
  counts: () => api.get('/feedbacks/representative/counts'),

  // Detalhes de um feedback
  getById: (id: string) => api.get(`/feedbacks/representative/${id}`),

  // Responder no thread
  respond: (id: string, message: string) =>
    api.post(`/feedbacks/representative/${id}/respond`, { message }),
};
```

### 2. Página de Listagem de Feedbacks

Crie uma página `/feedbacks` que mostra todos os feedbacks do representante com:

- **Cards de contagem** no topo (Total, Abertos, Em Análise, Resolvidos)
- **Lista de feedbacks** com filtro por status
- **Badge colorido** para cada tipo:
  - 🔴 `COMPLAINT` → Vermelho
  - 💡 `SUGGESTION` → Azul
  - 🐛 `BUG` → Laranja
  - ⭐ `PRAISE` → Verde
- **Badge de status**:
  - `OPEN` → Amarelo
  - `IN_ANALYSIS` → Azul
  - `RESOLVED` → Verde
  - `REJECTED` → Cinza

```tsx
// Exemplo de componente React
function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [counts, setCounts] = useState<FeedbackCounts | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadFeedbacks();
    loadCounts();
  }, []);

  const loadFeedbacks = async () => {
    const { data } = await feedbackService.list();
    setFeedbacks(data);
  };

  const loadCounts = async () => {
    const { data } = await feedbackService.counts();
    setCounts(data);
  };

  const filtered = filter === 'ALL'
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  return (
    <div>
      {/* Cards de contagem */}
      <div className="grid grid-cols-4 gap-4">
        <CountCard label="Total" value={counts?.total} />
        <CountCard label="Abertos" value={counts?.open} color="yellow" />
        <CountCard label="Em Análise" value={counts?.inAnalysis} color="blue" />
        <CountCard label="Resolvidos" value={counts?.resolved} color="green" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mt-4">
        {['ALL', 'OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {/* Lista */}
      {filtered.map(feedback => (
        <FeedbackCard key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
}
```

### 3. Formulário de Criação

Modal ou página com formulário:

```tsx
function CreateFeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    type: 'SUGGESTION',
    subject: '',
    description: '',
    category: '',
  });

  const typeOptions = [
    { value: 'COMPLAINT', label: '🔴 Reclamação', desc: 'Algo não está funcionando como deveria' },
    { value: 'SUGGESTION', label: '💡 Sugestão', desc: 'Ideia de melhoria para o sistema' },
    { value: 'BUG', label: '🐛 Bug', desc: 'Erro ou comportamento inesperado' },
    { value: 'PRAISE', label: '⭐ Elogio', desc: 'Algo que você gostou no sistema' },
  ];

  const categoryOptions = [
    'Geral', 'Dashboard', 'Consumidores', 'Comissões',
    'Alocação', 'Propostas', 'Login/Acesso', 'Outro',
  ];

  const handleSubmit = async () => {
    await feedbackService.create(form);
    toast.success('Feedback enviado com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Seleção do Tipo (cards visuais) */}
      {/* Campo Assunto */}
      {/* Campo Descrição (textarea) */}
      {/* Categoria (select) */}
      {/* Botão de enviar */}
    </form>
  );
}
```

### 4. Tela de Detalhes com Thread

Ao clicar em um feedback, mostra os detalhes e as respostas em formato de chat:

```tsx
function FeedbackDetail({ feedbackId }: { feedbackId: string }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFeedback();
  }, [feedbackId]);

  const loadFeedback = async () => {
    const { data } = await feedbackService.getById(feedbackId);
    setFeedback(data);
  };

  const handleRespond = async () => {
    await feedbackService.respond(feedbackId, message);
    setMessage('');
    loadFeedback(); // Recarrega para mostrar nova resposta
  };

  return (
    <div>
      {/* Cabeçalho com tipo, status e data */}
      <h2>{feedback?.subject}</h2>
      <p>{feedback?.description}</p>

      {/* Thread de respostas (estilo chat) */}
      <div className="thread">
        {feedback?.responses.map(resp => (
          <div
            key={resp.id}
            className={resp.authorType === 'REPRESENTATIVE' ? 'msg-right' : 'msg-left'}
          >
            <strong>{resp.authorName}</strong>
            <span className="badge">{resp.authorType === 'ADMIN' ? '👨‍💼 Admin' : '👤 Você'}</span>
            <p>{resp.message}</p>
            <small>{new Date(resp.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {/* Campo de resposta (se feedback não encerrado) */}
      {feedback?.status !== 'RESOLVED' && feedback?.status !== 'REJECTED' && (
        <div className="reply-box">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Escreva uma resposta..."
          />
          <button onClick={handleRespond}>Enviar</button>
        </div>
      )}
    </div>
  );
}
```

### 5. Badge/Indicador no Menu

Adicione um badge no item de menu "Feedbacks" mostrando a quantidade de feedbacks abertos:

```tsx
// No componente de sidebar/menu
const { data: counts } = await feedbackService.counts();
const openCount = counts?.open || 0;

// Mostra badge se houver feedbacks abertos
<NavItem to="/feedbacks">
  Meus Feedbacks
  {openCount > 0 && <Badge>{openCount}</Badge>}
</NavItem>
```

---

## 🎨 Sugestões de Design

### Labels de Tipo (com ícones)
| Tipo | Cor | Ícone |
|------|-----|-------|
| COMPLAINT | `#EF4444` (vermelho) | 🔴 ou ⚠️ |
| SUGGESTION | `#3B82F6` (azul) | 💡 |
| BUG | `#F97316` (laranja) | 🐛 |
| PRAISE | `#22C55E` (verde) | ⭐ |

### Labels de Status
| Status | Cor | Texto PT-BR |
|--------|-----|-------------|
| OPEN | `#EAB308` (amarelo) | Aberto |
| IN_ANALYSIS | `#3B82F6` (azul) | Em Análise |
| RESOLVED | `#22C55E` (verde) | Resolvido |
| REJECTED | `#6B7280` (cinza) | Recusado |

### Labels de Prioridade
| Prioridade | Cor | Texto PT-BR |
|------------|-----|-------------|
| LOW | `#6B7280` (cinza) | Baixa |
| MEDIUM | `#EAB308` (amarelo) | Média |
| HIGH | `#F97316` (laranja) | Alta |
| CRITICAL | `#EF4444` (vermelho) | Crítica |

---

## 📱 Rota Sugerida no App

```
/feedbacks                → Lista de feedbacks
/feedbacks/new            → Formulário de criação
/feedbacks/:id            → Detalhes + Thread
```

---

## ✅ Checklist de Implementação

- [ ] Criar serviço de API (`feedbackService.ts`)
- [ ] Criar página de listagem com cards de contagem
- [ ] Criar formulário de criação (modal ou página)
- [ ] Criar tela de detalhes com thread de respostas
- [ ] Adicionar item "Feedbacks" no menu lateral com badge
- [ ] Implementar filtros por status
- [ ] Adicionar labels coloridos para tipo/status/prioridade
- [ ] Testar criação, listagem e respostas
