# 🛡️ Guia de Implementação — Novas Features (Painel Admin)

Este guia cobre as 6 novas features disponíveis para o painel administrativo.

---

## 📦 Serviços de API

### `reportsService.ts`

```typescript
import api from './api';

export const reportsService = {
  // Exportar relatório de comissões (retorna blob/file para download)
  exportCommissions: (params?: {
    representativeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => api.get('/reports/commissions', { params, responseType: 'blob' }),

  // Exportar relatório de consumidores
  exportConsumers: (params?: {
    representativeId?: string;
    status?: string;
    concessionaire?: string;
  }) => api.get('/reports/consumers', { params, responseType: 'blob' }),

  // Exportar relatório de representantes
  exportRepresentatives: () =>
    api.get('/reports/representatives', { responseType: 'blob' }),
};

// Helper para download
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
```

### `rankingAdminService.ts`

```typescript
import api from './api';

export const rankingAdminService = {
  // Ranking
  getLeaderboard: (period?: string) =>
    api.get('/ranking/admin/leaderboard', { params: { period } }),

  // Metas
  getAllGoals: (params?: { representativeId?: string; status?: string }) =>
    api.get('/ranking/admin/goals', { params }),

  createGoal: (data: {
    representativeId: string;
    title: string;
    type: string;
    targetValue: number;
    unit: string;
    periodStart: string;
    periodEnd: string;
  }) => api.post('/ranking/admin/goals', data),

  updateGoalProgress: (goalId: string, currentValue: number) =>
    api.patch(`/ranking/admin/goals/${goalId}/progress`, { currentValue }),

  // Badges
  checkBadges: (representativeId: string) =>
    api.post(`/ranking/admin/check-badges/${representativeId}`),
};
```

### `advancedDashboardAdminService.ts`

```typescript
import api from './api';

export const advancedDashboardAdminService = {
  getFull: (months = 12, representativeId?: string) =>
    api.get('/advanced-dashboard/admin/full', { params: { months, representativeId } }),

  getConsumerGrowth: (months = 12, representativeId?: string) =>
    api.get('/advanced-dashboard/admin/consumer-growth', { params: { months, representativeId } }),

  getCommissionGrowth: (months = 12, representativeId?: string) =>
    api.get('/advanced-dashboard/admin/commission-growth', { params: { months, representativeId } }),

  getKwhEvolution: (months = 12, representativeId?: string) =>
    api.get('/advanced-dashboard/admin/kwh-evolution', { params: { months, representativeId } }),

  getConcessionaireDistribution: (representativeId?: string) =>
    api.get('/advanced-dashboard/admin/concessionaire-distribution', { params: { representativeId } }),

  getConsumerTypeDistribution: (representativeId?: string) =>
    api.get('/advanced-dashboard/admin/consumer-type-distribution', { params: { representativeId } }),

  getGeographicDistribution: (representativeId?: string) =>
    api.get('/advanced-dashboard/admin/geographic-distribution', { params: { representativeId } }),
};
```

### `activityLogAdminService.ts`

```typescript
import api from './api';

export const activityLogAdminService = {
  getGlobal: (params?: {
    entityType?: string;
    action?: string;
    representativeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => api.get('/activity-log/admin', { params }),

  getEntityTimeline: (entityType: string, entityId: string) =>
    api.get(`/activity-log/admin/entity/${entityType}/${entityId}`),

  getStats: (days = 30) =>
    api.get('/activity-log/admin/stats', { params: { days } }),
};
```

### `pushAdminService.ts`

```typescript
import api from './api';

export const pushAdminService = {
  sendToOne: (representativeId: string, title: string, body: string, data?: Record<string, string>) =>
    api.post(`/push-notifications/admin/send/${representativeId}`, { title, body, data }),

  sendToAll: (title: string, body: string, data?: Record<string, string>) =>
    api.post('/push-notifications/admin/send-all', { title, body, data }),

  getStats: () => api.get('/push-notifications/admin/stats'),
};
```

### `kwhPriceService.ts`

```typescript
import api from './api';

export const kwhPriceService = {
  create: (data: {
    concessionaire: string;
    pricePerKwh: number;
    effectiveFrom: string;
    effectiveUntil?: string;
    source?: string;
    notes?: string;
  }) => api.post('/kwh-prices', data),

  getCurrentPrices: () => api.get('/kwh-prices/current'),
  getConcessionaires: () => api.get('/kwh-prices/concessionaires'),
  getComparison: () => api.get('/kwh-prices/comparison'),
  getHistory: (concessionaire: string) =>
    api.get(`/kwh-prices/history/${encodeURIComponent(concessionaire)}`),
  getPriceAtDate: (concessionaire: string, date: string) =>
    api.get('/kwh-prices/at-date', { params: { concessionaire, date } }),
  update: (id: string, data: any) => api.patch(`/kwh-prices/${id}`, data),
  remove: (id: string) => api.delete(`/kwh-prices/${id}`),
};
```

---

## 🛠️ Implementação por Feature

---

### 📊 1. Relatórios Exportáveis (Excel)

#### Botões de Export na Dashboard ou Página Dedicada

```tsx
function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    representativeId: '',
    startDate: '',
    endDate: '',
    status: '',
    concessionaire: '',
  });

  const exportReport = async (type: 'commissions' | 'consumers' | 'representatives') => {
    setLoading(type);
    try {
      let res;
      switch (type) {
        case 'commissions':
          res = await reportsService.exportCommissions(filters);
          downloadFile(res.data, `relatorio_comissoes_${Date.now()}.xlsx`);
          break;
        case 'consumers':
          res = await reportsService.exportConsumers(filters);
          downloadFile(res.data, `relatorio_consumidores_${Date.now()}.xlsx`);
          break;
        case 'representatives':
          res = await reportsService.exportRepresentatives();
          downloadFile(res.data, `relatorio_representantes_${Date.now()}.xlsx`);
          break;
      }
      toast.success('Relatório exportado!');
    } catch (err) {
      toast.error('Erro ao exportar relatório');
    }
    setLoading(null);
  };

  return (
    <div>
      <h2>📊 Relatórios</h2>

      {/* Filtros */}
      <div className="filters-grid">
        <div>
          <label>Representante</label>
          <RepresentativeSelect value={filters.representativeId}
            onChange={v => setFilters({ ...filters, representativeId: v })} />
        </div>
        <div>
          <label>Data Início</label>
          <input type="date" value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div>
          <label>Data Fim</label>
          <input type="date" value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
      </div>

      {/* Botões de Export */}
      <div className="export-cards">
        <ExportCard
          icon="💰" title="Comissões" description="Todos os valores, status e detalhes"
          loading={loading === 'commissions'}
          onClick={() => exportReport('commissions')}
        />
        <ExportCard
          icon="👥" title="Consumidores" description="Dados completos com alocação e status"
          loading={loading === 'consumers'}
          onClick={() => exportReport('consumers')}
        />
        <ExportCard
          icon="🏆" title="Performance" description="Ranking e métricas de representantes"
          loading={loading === 'representatives'}
          onClick={() => exportReport('representatives')}
        />
      </div>
    </div>
  );
}

function ExportCard({ icon, title, description, loading, onClick }) {
  return (
    <div className="export-card" onClick={loading ? undefined : onClick}>
      <span className="icon">{icon}</span>
      <h4>{title}</h4>
      <p>{description}</p>
      <button disabled={loading}>
        {loading ? '⏳ Gerando...' : '📥 Baixar Excel'}
      </button>
    </div>
  );
}
```

---

### 🏆 2. Ranking & Metas (Admin)

#### Ranking com Metas

```tsx
function AdminRankingPage() {
  const [ranking, setRanking] = useState<RankedRepresentative[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [period, setPeriod] = useState('month');
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const [rankRes, goalsRes] = await Promise.all([
      rankingAdminService.getLeaderboard(period),
      rankingAdminService.getAllGoals(),
    ]);
    setRanking(rankRes.data);
    setGoals(goalsRes.data);
  };

  return (
    <div>
      {/* Tabela de Ranking */}
      <h2>🏆 Ranking de Representantes</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Representante</th>
            <th>Clientes</th>
            <th>Convertidos</th>
            <th>kWh Total</th>
            <th>Comissões (R$)</th>
            <th>Conversão</th>
            <th>Score</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map(rep => (
            <tr key={rep.id}>
              <td className={rep.position <= 3 ? 'top-3' : ''}>
                {rep.position <= 3 ? ['🥇', '🥈', '🥉'][rep.position - 1] : `#${rep.position}`}
              </td>
              <td>
                <div className="rep-info">
                  <img src={rep.avatarUrl || '/default.png'} width={32} />
                  <div>
                    <strong>{rep.name}</strong>
                    <small>{rep.city}/{rep.state}</small>
                  </div>
                </div>
              </td>
              <td>{rep.totalClients}</td>
              <td>{rep.convertedClients}</td>
              <td>{rep.totalKwh.toLocaleString()}</td>
              <td>R$ {rep.totalCommissions.toLocaleString()}</td>
              <td>{rep.conversionRate}%</td>
              <td><strong>{rep.score}</strong></td>
              <td>
                <button onClick={() => openGoalForm(rep.id)}>🎯 Meta</button>
                <button onClick={() => rankingAdminService.checkBadges(rep.id)}>🏅 Badges</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal: Criar Meta */}
      {showGoalModal && <CreateGoalModal onClose={() => setShowGoalModal(false)} onSuccess={loadData} />}
    </div>
  );
}
```

#### Modal de Criar Meta

```tsx
function CreateGoalModal({ representativeId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    representativeId,
    title: '',
    type: 'CLIENTS',
    targetValue: 0,
    unit: 'clientes',
    periodStart: '',
    periodEnd: '',
  });

  const typeOptions = [
    { value: 'CLIENTS', label: '👥 Clientes', unit: 'clientes' },
    { value: 'KWH', label: '⚡ kWh', unit: 'kWh' },
    { value: 'REVENUE', label: '💵 Faturamento', unit: 'R$' },
    { value: 'COMMISSION', label: '💰 Comissão', unit: 'R$' },
  ];

  const handleSubmit = async () => {
    await rankingAdminService.createGoal(form);
    toast.success('Meta criada!');
    onSuccess();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>🎯 Nova Meta</h3>
      <input placeholder="Título (ex: Meta Q1 2026)" value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })} />
      <select value={form.type} onChange={e => {
        const type = typeOptions.find(t => t.value === e.target.value);
        setForm({ ...form, type: e.target.value, unit: type?.unit || '' });
      }}>
        {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input type="number" placeholder="Valor alvo" value={form.targetValue}
        onChange={e => setForm({ ...form, targetValue: +e.target.value })} />
      <input type="date" value={form.periodStart}
        onChange={e => setForm({ ...form, periodStart: e.target.value })} />
      <input type="date" value={form.periodEnd}
        onChange={e => setForm({ ...form, periodEnd: e.target.value })} />
      <button onClick={handleSubmit}>Criar Meta</button>
    </Modal>
  );
}
```

---

### 📅 3. Timeline de Atividades (Admin)

```tsx
function AdminTimeline() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    entityType: '', action: '', representativeId: '', limit: 100,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    const [acts, statsRes] = await Promise.all([
      activityLogAdminService.getGlobal(filters),
      activityLogAdminService.getStats(),
    ]);
    setActivities(acts.data);
    setStats(statsRes.data);
  };

  return (
    <div>
      {/* Stats cards */}
      <div className="stats-grid">
        <StatCard label="Atividades (30d)" value={stats?.totalActivities} />
        {stats?.byEntityType.map(t => (
          <StatCard key={t.type} label={t.type} value={t.count} />
        ))}
      </div>

      {/* Filtros */}
      <div className="filters">
        <select value={filters.entityType}
          onChange={e => setFilters({ ...filters, entityType: e.target.value })}>
          <option value="">Todas as entidades</option>
          <option value="Consumer">Consumidores</option>
          <option value="Commission">Comissões</option>
          <option value="Generator">Geradores</option>
          <option value="Representative">Representantes</option>
        </select>
        <select value={filters.action}
          onChange={e => setFilters({ ...filters, action: e.target.value })}>
          <option value="">Todas as ações</option>
          <option value="CREATED">Criado</option>
          <option value="UPDATED">Atualizado</option>
          <option value="STATUS_CHANGED">Mudou Status</option>
          <option value="DELETED">Excluído</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {activities.map(act => (
          <div key={act.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-card">
              <div className="header">
                <span className="entity">{act.entityType}</span>
                <span className="action">{act.action}</span>
                <span className="role">{act.performedByRole === 'ADMIN' ? '👨‍💼' : '👤'} {act.performedByName}</span>
              </div>
              <p>{act.description}</p>
              <small>{new Date(act.createdAt).toLocaleString('pt-BR')}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 📱 4. Push Notifications (Admin)

```tsx
function PushNotificationsAdmin() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', representativeId: '' });

  useEffect(() => {
    pushAdminService.getStats().then(res => setStats(res.data));
  }, []);

  const sendToOne = async () => {
    await pushAdminService.sendToOne(form.representativeId, form.title, form.body);
    toast.success('Notificação enviada!');
  };

  const sendToAll = async () => {
    if (!confirm('Enviar para TODOS os representantes?')) return;
    await pushAdminService.sendToAll(form.title, form.body);
    toast.success('Notificação enviada para todos!');
  };

  return (
    <div>
      <h2>📱 Push Notifications</h2>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Tokens Ativos" value={stats?.active} icon="📱" />
        <StatCard label="Total" value={stats?.total} icon="📊" />
        {stats?.byPlatform.map(p => (
          <StatCard key={p.platform} label={p.platform} value={p.count}
            icon={p.platform === 'android' ? '🤖' : p.platform === 'ios' ? '🍎' : '🌐'} />
        ))}
      </div>

      {/* Form de envio */}
      <div className="send-form">
        <input placeholder="Título da notificação" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Mensagem" value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })} rows={3} />

        <div className="actions">
          <div>
            <RepresentativeSelect value={form.representativeId}
              onChange={v => setForm({ ...form, representativeId: v })} />
            <button onClick={sendToOne} disabled={!form.representativeId || !form.title}>
              📤 Enviar para 1
            </button>
          </div>
          <button className="btn-danger" onClick={sendToAll} disabled={!form.title}>
            📢 Enviar para Todos
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 📊 5. Dashboard Avançado com Gráficos (Admin)

```tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminAdvancedDashboard() {
  const [data, setData] = useState<FullDashboard | null>(null);
  const [months, setMonths] = useState(12);
  const [repId, setRepId] = useState('');

  useEffect(() => {
    advancedDashboardAdminService.getFull(months, repId || undefined)
      .then(res => setData(res.data));
  }, [months, repId]);

  const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div>
      {/* Filtros */}
      <div className="dashboard-filters">
        <select value={months} onChange={e => setMonths(+e.target.value)}>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
          <option value={24}>24 meses</option>
        </select>
        <RepresentativeSelect value={repId} onChange={setRepId}
          placeholder="Todos os representantes" />
      </div>

      <div className="charts-grid">
        {/* Evolução de Clientes (área) */}
        <div className="chart-card">
          <h3>📈 Evolução de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.consumerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F680" name="Novos" />
              <Area type="monotone" dataKey="converted" stroke="#22C55E" fill="#22C55E80" name="Convertidos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução de Comissões (barras) */}
        <div className="chart-card">
          <h3>💰 Comissões por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.commissionGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="paidValue" fill="#22C55E" name="Pagas" stackId="a" />
              <Bar dataKey="pendingValue" fill="#F97316" name="Pendentes" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução kWh (linha) */}
        <div className="chart-card">
          <h3>⚡ Evolução kWh Alocado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.kwhEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalKwh" stroke="#3B82F6" name="Total kWh" strokeWidth={2} />
              <Line type="monotone" dataKey="allocatedKwh" stroke="#22C55E" name="Alocado kWh" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Concessionária (pizza) */}
        <div className="chart-card">
          <h3>🏢 Por Concessionária</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data?.concessionaireDistribution} dataKey="count"
                nameKey="concessionaire" cx="50%" cy="50%" outerRadius={100} label>
                {data?.concessionaireDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Tipo (barras horizontais) */}
        <div className="chart-card">
          <h3>📊 Por Tipo de Consumidor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.consumerTypeDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mapa geográfico (tabela simples) */}
        <div className="chart-card">
          <h3>📍 Distribuição Geográfica</h3>
          <table>
            <thead><tr><th>Cidade</th><th>Estado</th><th>Consumidores</th></tr></thead>
            <tbody>
              {data?.geographicDistribution.slice(0, 15).map((g, i) => (
                <tr key={i}><td>{g.city}</td><td>{g.state}</td><td>{g.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

### 💰 6. Versionamento de Preços/Tarifas

```tsx
function KwhPricesPage() {
  const [prices, setPrices] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedConc, setSelectedConc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    concessionaire: '', pricePerKwh: 0, effectiveFrom: '', source: '', notes: '',
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    const res = await kwhPriceService.getCurrentPrices();
    setPrices(res.data);
  };

  const loadHistory = async (conc: string) => {
    setSelectedConc(conc);
    const res = await kwhPriceService.getHistory(conc);
    setHistory(res.data);
  };

  const handleCreate = async () => {
    await kwhPriceService.create(form);
    toast.success('Preço cadastrado! O anterior foi encerrado automaticamente.');
    loadPrices();
    if (selectedConc === form.concessionaire) loadHistory(selectedConc);
    setShowForm(false);
  };

  return (
    <div>
      <div className="header-row">
        <h2>💰 Tarifas kWh por Concessionária</h2>
        <button onClick={() => setShowForm(true)}>➕ Novo Preço</button>
      </div>

      {/* Tabela de preços vigentes */}
      <table>
        <thead>
          <tr>
            <th>Concessionária</th>
            <th>Preço/kWh (R$)</th>
            <th>Vigente desde</th>
            <th>Fonte</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {prices.map(p => (
            <tr key={p.id}>
              <td><strong>{p.concessionaire}</strong></td>
              <td className="price">R$ {p.pricePerKwh.toFixed(4)}</td>
              <td>{new Date(p.effectiveFrom).toLocaleDateString('pt-BR')}</td>
              <td>{p.source || '-'}</td>
              <td>
                <button onClick={() => loadHistory(p.concessionaire)}>📜 Histórico</button>
                <button onClick={() => kwhPriceService.remove(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Histórico */}
      {selectedConc && (
        <div className="history-section">
          <h3>📜 Histórico: {selectedConc}</h3>
          <table>
            <thead>
              <tr>
                <th>Preço/kWh</th>
                <th>De</th>
                <th>Até</th>
                <th>Fonte</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className={!h.effectiveUntil ? 'current' : ''}>
                  <td>R$ {h.pricePerKwh.toFixed(4)}</td>
                  <td>{new Date(h.effectiveFrom).toLocaleDateString('pt-BR')}</td>
                  <td>{h.effectiveUntil ? new Date(h.effectiveUntil).toLocaleDateString('pt-BR') : '🟢 Vigente'}</td>
                  <td>{h.source || '-'}</td>
                  <td>{h.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Novo preço */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3>➕ Cadastrar Novo Preço</h3>
          <p className="info">⚠️ O preço vigente anterior será encerrado automaticamente.</p>
          <input placeholder="Concessionária (ex: CEMIG, CPFL)" value={form.concessionaire}
            onChange={e => setForm({ ...form, concessionaire: e.target.value })} />
          <input type="number" step="0.0001" placeholder="Preço por kWh (R$)"
            value={form.pricePerKwh}
            onChange={e => setForm({ ...form, pricePerKwh: +e.target.value })} />
          <input type="date" value={form.effectiveFrom}
            onChange={e => setForm({ ...form, effectiveFrom: e.target.value })} />
          <input placeholder="Fonte (ex: ANEEL, manual)" value={form.source}
            onChange={e => setForm({ ...form, source: e.target.value })} />
          <textarea placeholder="Observações" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={handleCreate}>💾 Salvar</button>
        </Modal>
      )}
    </div>
  );
}
```

---

## 🗺️ Rotas Sugeridas (Admin)

```
/admin/reports                → Página de exportação de relatórios
/admin/ranking                → Ranking + gestão de metas
/admin/timeline               → Timeline global de atividades
/admin/push-notifications     → Envio de push + estatísticas
/admin/dashboard/advanced     → Dashboard com todos os gráficos
/admin/kwh-prices             → Gestão de tarifas por concessionária
```

---

## 🎨 Design Tips

### Cards de Export
```css
.export-card {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}
.export-card:hover { transform: translateY(-4px); }
.export-card .icon { font-size: 40px; }
```

### Chart Cards
```css
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.chart-card h3 { margin-bottom: 16px; font-size: 16px; }
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
```

### Vigente Highlight
```css
tr.current { background: #f0fdf4; }
tr.current td { font-weight: 600; }
```

---

## ✅ Checklist de Implementação

### 📊 Relatórios
- [ ] Página de relatórios com 3 botões de export
- [ ] Filtros por representante, datas, status
- [ ] Download automático do .xlsx
- [ ] Loading state durante geração

### 🏆 Ranking & Metas
- [ ] Tabela de ranking com todas as métricas
- [ ] Filtro por período
- [ ] Modal de criar meta para representante
- [ ] Botão de verificar badges
- [ ] Atualização de progresso de metas

### 📅 Timeline
- [ ] Timeline global com filtros (entidade, ação, representante)
- [ ] Cards de estatísticas de atividade
- [ ] Timeline por entidade (ao clicar em consumidor/comissão)

### 📱 Push Notifications
- [ ] Formulário de envio (para 1 ou para todos)
- [ ] Cards de estatísticas de tokens
- [ ] Seletor de representante

### 📊 Dashboard Avançado
- [ ] Instalar Recharts ou Chart.js
- [ ] 6 gráficos: área, barra, linha, pizza, horizontal, tabela
- [ ] Filtro por período e representante
- [ ] Layout em grid 2x3

### 💰 Tarifas kWh
- [ ] Tabela de preços vigentes
- [ ] Histórico por concessionária
- [ ] Modal de cadastrar novo preço
- [ ] Indicador visual do preço vigente
- [ ] Botão de excluir (Manager+)
