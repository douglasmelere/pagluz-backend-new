# 📱 Guia de Implementação — Novas Features (App do Representante)

Este guia cobre as 6 novas features disponíveis para o app do representante.

---

## 📦 Serviços de API

### `rankingService.ts`

```typescript
import api from './api';

export const rankingService = {
  // Ranking/Leaderboard
  getLeaderboard: (period?: string) =>
    api.get('/ranking/leaderboard', { params: { period } }),

  // Minhas conquistas
  getMyBadges: () => api.get('/ranking/my-badges'),

  // Verificar novas conquistas
  checkBadges: () => api.post('/ranking/check-badges'),

  // Minhas metas
  getMyGoals: () => api.get('/ranking/my-goals'),
};
```

### `advancedDashboardService.ts`

```typescript
import api from './api';

export const advancedDashboardService = {
  // Dashboard completo (todos os gráficos)
  getFull: (months = 12) =>
    api.get('/advanced-dashboard/representative/full', { params: { months } }),

  // Evolução de consumidores
  getConsumerGrowth: (months = 12) =>
    api.get('/advanced-dashboard/representative/consumer-growth', { params: { months } }),

  // Evolução de comissões
  getCommissionGrowth: (months = 12) =>
    api.get('/advanced-dashboard/representative/commission-growth', { params: { months } }),
};
```

### `activityLogService.ts`

```typescript
import api from './api';

export const activityLogService = {
  // Minha timeline
  getMyTimeline: (limit = 50) =>
    api.get('/activity-log/representative/my-timeline', { params: { limit } }),
};
```

### `pushNotificationService.ts`

```typescript
import api from './api';

export const pushNotificationService = {
  // Registrar token FCM
  register: (token: string, platform: string, deviceName?: string) =>
    api.post('/push-notifications/register', { token, platform, deviceName }),

  // Remover token
  unregister: (token: string) =>
    api.delete(`/push-notifications/unregister/${token}`),

  // Listar meus tokens
  getMyTokens: () => api.get('/push-notifications/my-tokens'),
};
```

---

## 📊 Interfaces TypeScript

```typescript
// ─── Ranking ──────────────────────────────────────────
interface RankedRepresentative {
  position: number;
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  avatarUrl: string | null;
  totalClients: number;
  convertedClients: number;
  allocatedClients: number;
  totalKwh: number;
  totalCommissions: number;
  paidCommissions: number;
  conversionRate: number;
  badgesCount: number;
  score: number;
}

// ─── Badges ───────────────────────────────────────────
interface Badge {
  id: string;
  badgeKey: string;
  badgeName: string;      // "🎯 Primeiro Cliente"
  badgeDescription: string;
  badgeIcon: string;       // Emoji
  earnedAt: string;
}

// ─── Metas ────────────────────────────────────────────
type GoalType = 'CLIENTS' | 'KWH' | 'REVENUE' | 'COMMISSION';
type GoalStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'FAILED' | 'CANCELLED';

interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
  status: GoalStatus;
  progressPercent: number; // 0-100
}

// ─── Dashboard Avançado ───────────────────────────────
interface ConsumerGrowthItem {
  month: string;      // "jan. 2026"
  total: number;
  converted: number;
  allocated: number;
}

interface CommissionGrowthItem {
  month: string;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
  totalKwh: number;
  count: number;
}

interface FullDashboard {
  consumerGrowth: ConsumerGrowthItem[];
  commissionGrowth: CommissionGrowthItem[];
  kwhEvolution: { month: string; totalKwh: number; allocatedKwh: number; consumers: number }[];
  concessionaireDistribution: { concessionaire: string; count: number; totalKwh: number }[];
  consumerTypeDistribution: { type: string; label: string; count: number; totalKwh: number }[];
  geographicDistribution: { state: string; city: string; count: number }[];
}

// ─── Activity Log ─────────────────────────────────────
interface ActivityLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  details: any;
  performedByName: string;
  performedByRole: string;
  createdAt: string;
}

// ─── Push Token ───────────────────────────────────────
interface PushToken {
  id: string;
  token: string;
  platform: string;
  deviceName: string | null;
  isActive: boolean;
  createdAt: string;
}
```

---

## 🛠️ Implementação por Feature

---

### 🏆 Feature 1: Ranking & Gamificação

#### Página de Ranking (`/ranking`)

```tsx
function RankingPage() {
  const [ranking, setRanking] = useState<RankedRepresentative[]>([]);
  const [period, setPeriod] = useState('month');
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const currentUserId = useAuth().user.id;

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const [rankRes, badgesRes, goalsRes] = await Promise.all([
      rankingService.getLeaderboard(period),
      rankingService.getMyBadges(),
      rankingService.getMyGoals(),
    ]);
    setRanking(rankRes.data);
    setMyBadges(badgesRes.data);
    setMyGoals(goalsRes.data);

    // Verificar novas conquistas automaticamente
    rankingService.checkBadges();
  };

  const myPosition = ranking.find(r => r.id === currentUserId);

  return (
    <div>
      {/* Minha posição (destaque) */}
      {myPosition && (
        <div className="my-position-card">
          <span className="position">#{myPosition.position}</span>
          <span className="score">{myPosition.score} pts</span>
          <span className="clients">{myPosition.convertedClients} clientes</span>
        </div>
      )}

      {/* Filtro de período */}
      <div className="period-filter">
        {[
          { value: 'month', label: 'Este Mês' },
          { value: 'quarter', label: 'Trimestre' },
          { value: 'year', label: 'Este Ano' },
          { value: 'all', label: 'Geral' },
        ].map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={period === p.value ? 'active' : ''}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Pódio (top 3) */}
      <div className="podium">
        {ranking.slice(0, 3).map((rep, i) => (
          <div key={rep.id} className={`podium-${i + 1}`}>
            <img src={rep.avatarUrl || '/default-avatar.png'} />
            <span className="medal">{['🥇', '🥈', '🥉'][i]}</span>
            <h4>{rep.name}</h4>
            <p>{rep.score} pts</p>
            <small>{rep.convertedClients} clientes • {rep.totalKwh} kWh</small>
          </div>
        ))}
      </div>

      {/* Lista completa */}
      <div className="ranking-list">
        {ranking.slice(3).map(rep => (
          <div key={rep.id} className={`ranking-item ${rep.id === currentUserId ? 'is-me' : ''}`}>
            <span className="pos">#{rep.position}</span>
            <img src={rep.avatarUrl || '/default-avatar.png'} />
            <div>
              <strong>{rep.name}</strong>
              <small>{rep.city}/{rep.state}</small>
            </div>
            <span className="score">{rep.score} pts</span>
          </div>
        ))}
      </div>

      {/* Minhas Conquistas */}
      <h3>🏅 Minhas Conquistas ({myBadges.length})</h3>
      <div className="badges-grid">
        {myBadges.map(badge => (
          <div key={badge.id} className="badge-card">
            <span className="icon">{badge.badgeIcon}</span>
            <strong>{badge.badgeName}</strong>
            <small>{badge.badgeDescription}</small>
            <small className="date">{new Date(badge.earnedAt).toLocaleDateString('pt-BR')}</small>
          </div>
        ))}
      </div>

      {/* Minhas Metas */}
      <h3>🎯 Minhas Metas</h3>
      {myGoals.map(goal => (
        <div key={goal.id} className="goal-card">
          <div className="goal-header">
            <strong>{goal.title}</strong>
            <GoalStatusBadge status={goal.status} />
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${goal.progressPercent}%` }} />
          </div>
          <div className="goal-footer">
            <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
            <span>{goal.progressPercent}%</span>
          </div>
          <small>Até {new Date(goal.periodEnd).toLocaleDateString('pt-BR')}</small>
        </div>
      ))}
    </div>
  );
}
```

#### Componentes auxiliares

```tsx
function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const config = {
    IN_PROGRESS: { label: 'Em andamento', color: '#3B82F6' },
    ACHIEVED: { label: 'Concluída ✅', color: '#22C55E' },
    FAILED: { label: 'Não atingida', color: '#EF4444' },
    CANCELLED: { label: 'Cancelada', color: '#6B7280' },
  };
  const c = config[status];
  return <span style={{ background: c.color, color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{c.label}</span>;
}
```

---

### 📊 Feature 2: Dashboard Avançado com Gráficos

Use uma lib de gráficos como **Recharts**, **Chart.js** ou **ApexCharts**.

#### Instalação

```bash
npm install recharts
# ou
npm install chart.js react-chartjs-2
```

#### Componente Dashboard com Gráficos

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function AdvancedDashboard() {
  const [data, setData] = useState<FullDashboard | null>(null);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    advancedDashboardService.getFull(months).then(res => setData(res.data));
  }, [months]);

  const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div>
      {/* Filtro de período */}
      <select value={months} onChange={e => setMonths(+e.target.value)}>
        <option value={6}>6 meses</option>
        <option value={12}>12 meses</option>
        <option value={24}>24 meses</option>
      </select>

      {/* Gráfico: Evolução de Clientes */}
      <h3>📈 Evolução de Clientes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.consumerGrowth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Novos Clientes" />
          <Line type="monotone" dataKey="converted" stroke="#22C55E" name="Convertidos" />
          <Line type="monotone" dataKey="allocated" stroke="#F97316" name="Alocados" />
        </LineChart>
      </ResponsiveContainer>

      {/* Gráfico: Comissões */}
      <h3>💰 Evolução de Comissões</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.commissionGrowth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="paidValue" fill="#22C55E" name="Pagas" />
          <Bar dataKey="pendingValue" fill="#F97316" name="Pendentes" />
        </BarChart>
      </ResponsiveContainer>

      {/* Gráfico: Distribuição por Tipo */}
      <h3>🍩 Distribuição por Tipo de Consumidor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data?.consumerTypeDistribution} dataKey="count" nameKey="label"
            cx="50%" cy="50%" outerRadius={100} label>
            {data?.consumerTypeDistribution.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 📅 Feature 3: Timeline de Atividades

```tsx
function MyTimeline() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    activityLogService.getMyTimeline(50).then(res => setActivities(res.data));
  }, []);

  const getActionIcon = (action: string) => {
    const icons = {
      CREATED: '🆕',
      UPDATED: '✏️',
      STATUS_CHANGED: '🔄',
      ALLOCATED: '📌',
      DELETED: '🗑️',
    };
    return icons[action] || '📋';
  };

  const getEntityLabel = (type: string) => {
    const labels = {
      Consumer: '👤 Consumidor',
      Commission: '💰 Comissão',
      Generator: '⚡ Gerador',
      ProposalRequest: '📋 Proposta',
    };
    return labels[type] || type;
  };

  return (
    <div className="timeline">
      {activities.map(act => (
        <div key={act.id} className="timeline-item">
          <div className="timeline-icon">{getActionIcon(act.action)}</div>
          <div className="timeline-content">
            <span className="entity-badge">{getEntityLabel(act.entityType)}</span>
            <p className="description">{act.description}</p>
            <small className="time">
              {new Date(act.createdAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(act.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### CSS sugerido para Timeline

```css
.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.timeline-icon {
  position: absolute;
  left: -33px;
  width: 30px;
  height: 30px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.timeline-content {
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex: 1;
}

.entity-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 4px;
}
```

---

### 📱 Feature 4: Push Notifications

#### Registro de Token ao Abrir o App

```typescript
// No AppInitializer ou useEffect principal
import { getMessaging, getToken } from 'firebase/messaging';

async function registerPushToken() {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: 'SUA_VAPID_KEY', // Chave VAPID do Firebase
    });

    if (token) {
      await pushNotificationService.register(
        token,
        detectPlatform(), // 'android', 'ios', 'web'
        navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      );
      console.log('✅ Push token registrado');
    }
  } catch (err) {
    console.log('Push notifications não suportadas:', err);
  }
}

function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'web';
}
```

#### Service Worker (`firebase-messaging-sw.js`)

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
  });
});
```

---

## 🗺️ Rotas Sugeridas

```
/ranking                     → Ranking + Metas + Conquistas
/dashboard/advanced          → Dashboard com gráficos históricos
/timeline                    → Histórico de atividades
```

---

## 🎨 Design Tips

### Podium Colors
| Posição | Cor |
|---------|-----|
| 🥇 1º | `#FFD700` (gold) |
| 🥈 2º | `#C0C0C0` (silver) |
| 🥉 3º | `#CD7F32` (bronze) |

### Goal Progress Colors
| % | Cor da Barra |
|---|-------------|
| 0-25% | `#EF4444` (vermelho) |
| 25-50% | `#F97316` (laranja) |
| 50-75% | `#EAB308` (amarelo) |
| 75-100% | `#22C55E` (verde) |

### Badge Card Gradient
```css
.badge-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.badge-card .icon { font-size: 40px; }
```

---

## ✅ Checklist de Implementação

### Ranking & Gamificação
- [ ] Página de ranking com pódio visual
- [ ] Filtro por período (mês/trimestre/ano/geral)
- [ ] Destaque da posição do usuário logado
- [ ] Grid de badges/conquistas ganhas
- [ ] Cards de metas com barra de progresso
- [ ] Verificação automática de badges no load

### Dashboard Avançado
- [ ] Instalar lib de gráficos (Recharts ou Chart.js)
- [ ] Gráfico de linha: evolução de clientes
- [ ] Gráfico de barra: evolução de comissões
- [ ] Gráfico de pizza: distribuição por tipo
- [ ] Filtro de período (6/12/24 meses)

### Timeline de Atividades
- [ ] Componente de timeline vertical
- [ ] Ícones por tipo de ação
- [ ] Labels por tipo de entidade
- [ ] Scroll infinito ou paginação

### Push Notifications
- [ ] Configurar Firebase no projeto
- [ ] Registrar token ao abrir o app
- [ ] Service worker para notificações em background
- [ ] Desregistrar token ao fazer logout
