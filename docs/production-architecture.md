# Arquitetura de Produção – Energy Management API

Este documento descreve todas as melhorias de **CI/CD, Docker, observabilidade, healthchecks, zero downtime e preview environments** implementadas no projeto.

---

## 1. Modelo de CI/CD com Coolify

### O que foi feito

- GitHub Actions utilizado **apenas como CI**
- Coolify responsável por **build, deploy, rollback e restart**

### Por que é necessário

- Evita deploy duplicado
- Reduz falhas humanas
- Coolify já resolve CD melhor que pipelines customizados

### Como funciona

1. Push ou PR dispara o CI
2. CI executa lint, testes e build
3. Apenas código válido chega ao Coolify
4. Coolify faz o deploy automaticamente

---

## 2. Pipeline de CI (GitHub Actions)

Arquivo:

- `.github/workflows/ci.yml`

Executa:

- Instala dependências
- Lint
- Testes
- Build

Garante que **nenhum código quebrado** seja deployado.

---

## 3. Dockerfile Production-Grade

### O que foi feito

- Build multi-stage
- Uso de `npm ci`
- Remoção de dependências de desenvolvimento
- Container non-root
- Healthcheck nativo

### Por que é necessário

- Imagem menor
- Build mais rápido
- Segurança contra exploits

### Como funciona

- Primeiro estágio compila o projeto
- Segundo estágio executa apenas o código final
- Coolify utiliza o healthcheck para zero downtime

---

## 4. Healthchecks (Deploy Seguro)

### Endpoints disponíveis

- `/health` → verificação geral + banco
- `/health/ready` → readiness probe
- `/health/live` → liveness probe

### Por que é necessário

- Evita receber tráfego antes da aplicação estar pronta
- Garante rollback automático

### Integração com Coolify

- Coolify só finaliza o deploy se `/health/ready` retornar sucesso

---

## 5. Zero Downtime Deploy

### Como funciona

1. Coolify sobe novo container
2. Aguarda healthcheck passar
3. Redireciona tráfego
4. Derruba container antigo

Resultado:

- Sem indisponibilidade
- Deploys seguros

---

## 6. Preview Environments (Pull Requests)

### O que é

- Cada PR cria um ambiente isolado

### Benefícios

- Testes reais antes do merge
- Zero risco em produção

### Funcionamento

- PR aberta → ambiente criado
- PR fechada → ambiente destruído

---

## 7. Banco de Dados Isolado por Preview

### Estratégia

- Cada PR usa um banco diferente

Exemplo:

```env
DATABASE_URL=postgresql://user:pass@host:5432/app_pr_${PR_NUMBER}
```

Benefícios:

- Nenhum impacto em produção
- Testes completos

---

## 8. Observabilidade (Métricas)

### O que foi feito

- Endpoint `/metrics` usando `prom-client`

### Para que serve

- Integração com Prometheus
- Dashboards no Grafana
- Monitoramento de performance

---

## 9. Segurança

- Container non-root
- Sem SSH em pipelines
- Variáveis de ambiente protegidas

---

## Conclusão

Este projeto agora segue **padrões modernos de produção**, compatíveis com startups e empresas de grande porte:

- CI confiável
- CD automatizado
- Zero downtime
- Observabilidade
- Segurança
- Escalabilidade
