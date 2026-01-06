## Revisão de Consumidores (Front Interno - Admin/Operador)

### Objetivo
Permitir que administradores/operadores revisem cadastros de consumidores enviados por representantes, aprovando ou rejeitando com controle e rastreabilidade.

### Endpoints a utilizar
- GET `/consumers/pending?state=&city=&representativeId=&startDate=&endDate=&page=&limit=`
- POST `/consumers/:id/approve`
- POST `/consumers/:id/reject` body `{ reason?: string }`

Regras:
- Todas as requisições devem enviar `Authorization: Bearer <token>`
- Apenas usuários com hierarquia OPERATOR+ devem ver/usar estas telas

### Navegação e rotas sugeridas
- Nova aba/menu: “Pendentes de aprovação”
  - Lista: `/admin/consumers/pending`
  - Detalhes (opcional): `/admin/consumers/pending/:id`

### Página “Pendentes de aprovação”
1) Cabeçalho e filtros
- Filtros:
  - `state` (UF) [select]
  - `city` (texto – contém, case-insensitive)
  - `representativeId` (select/autocomplete por nome/email)
  - `startDate` e `endDate` (date pickers, formato ISO YYYY-MM-DD)
  - `page`, `limit` (paginações)
- Ações:
  - “Buscar” e “Limpar filtros”
- UX:
  - Persistir filtros na query string (compartilhar/atualizar página sem perder estado)
  - Estado de loading durante requisições

2) Tabela de pendentes
- Colunas sugeridas:
  - Nome, CPF/CNPJ, Cidade, Estado, Tipo (consumerType), Criado em, Representante (nome/email), Status de aprovação
- Ações por linha:
  - “Aprovar”
  - “Rejeitar” (abre modal com campo de motivo opcional)
  - “Ver detalhes” (opcional)
- Paginação:
  - `page` padrão 1 e `limit` 20; exibir total, páginas e navegação

3) Modais
- Rejeição:
  - Textarea “Motivo (opcional)”
  - Botões: Cancelar, Confirmar rejeição
  - Ao confirmar: POST `/consumers/:id/reject`
- Aprovação:
  - Mensagem de confirmação
  - Ao confirmar: POST `/consumers/:id/approve`

### Integração com API (exemplos)
Serviço/API client:

```ts
async function getPendingConsumers(params: {
  state?: string;
  city?: string;
  representativeId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return request(`/consumers/pending${qs.toString() ? `?${qs.toString()}` : ''}`);
}

async function approveConsumer(id: string) {
  return request(`/consumers/${id}/approve`, { method: 'POST' });
}

async function rejectConsumer(id: string, reason?: string) {
  return request(`/consumers/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
}
```

Estados recomendados:
- `filters`: filtros atuais
- `data`: `{ consumers: Consumer[], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`
- `loading`: boolean
- `error`: string | null

Fluxo de dados:
- Ao montar, ler filtros da URL e carregar
- Ao aplicar filtros/mudar página/limit, atualizar URL e refazer fetch

Tratamento de erros:
- 401: redirecionar para login
- 403: exibir “Permissão insuficiente”
- 200 OK: após aprovar/rejeitar, mostrar toast e recarregar mantendo filtros/página
- 4xx/5xx: exibir toast/alert com `message` da resposta

### Permissões no front
- Ocultar “Pendentes de aprovação” para usuários sem OPERATOR+
- (Opcional) Guard de rota para checar papel do usuário antes do render

### UX para produtividade
- Autocomplete de representantes por nome/email
- Enter dispara busca nos filtros
- Persistência de filtros na query string
- (Opcional) Aprovação em massa: seleção múltipla + ação “Aprovar selecionados”
- Indicadores úteis:
  - Total pendentes
  - Chips de filtro rápido por estado/cidade

### Testes recomendados
- Consumidor pendente aparece na lista; aprovar remove da lista (ou permanece conforme filtros)
- Rejeição com motivo funciona e persiste
- Filtros (`state`, `city`, `representativeId`, `startDate`, `endDate`) filtram corretamente
- Paginação e mudança de `limit` funcionam
- Permissões: usuários sem OPERATOR+ não acessam a aba/rota
- Erros 401/403/5xx tratados com feedback adequado

### Convenções de UI
- Labels de aprovação:
  - PENDING: “Aguardando aprovação” (amarelo)
  - APPROVED: “Aprovado” (verde)
  - REJECTED: “Rejeitado” (vermelho)
- Datas: exibir `createdAt` com locale pt-BR
- Acessibilidade: botões e modais com rótulos claros e foco adequado

### Roadmap (opcional)
- Filtros salvos por usuário
- Ações em lote
- Histórico de auditoria por item (exibir logs)
- Exportação CSV da lista de pendentes


