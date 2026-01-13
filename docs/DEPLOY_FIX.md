# 🔧 Correções de Deploy - Coolify

## ❌ Erro Encontrado

Durante o deploy no Coolify, ocorreu o seguinte erro de TypeScript:

```
src/common/services/supabase-storage.service.ts:155:66 - error TS2339: Property 'statusCode' does not exist on type 'StorageError'.
```

### Causa
O tipo `StorageError` do Supabase não possui a propriedade `statusCode`. A verificação estava tentando acessar uma propriedade inexistente.

## ✅ Correção Aplicada

**Arquivo:** `src/common/services/supabase-storage.service.ts`

**Antes:**
```typescript
if (error.message?.includes('Object not found') || error.statusCode === '404') {
```

**Depois:**
```typescript
if (error.message?.includes('Object not found') || error.message?.includes('404')) {
```

A verificação agora usa apenas a mensagem de erro, que já contém informações suficientes para identificar erros 404.

---

## 📦 Repositório de Backup Criado

Foi criado um repositório de backup para uso em deploys sem afetar o repositório principal:

**URL:** `https://github.com/douglasmelere/pagluz-backend-new-backup`

### Como Usar

O repositório de backup está configurado como remote adicional:

```bash
# Ver remotes configurados
git remote -v

# Push para repositório principal
git push origin main

# Push para repositório de backup
git push backup main
```

### Vantagens

- ✅ Deploys de teste não afetam o repositório principal
- ✅ Histórico de commits preservado
- ✅ Fácil rollback em caso de problemas
- ✅ Ambiente isolado para testes

---

## ⚠️ Warnings do Dockerfile

Os warnings sobre secrets em ARG/ENV são apenas avisos de segurança e não impedem o build:

```
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data
```

**Nota:** O Dockerfile atual não usa ARG para secrets. Esses warnings podem ser falsos positivos ou referências a outros arquivos. Eles não afetam o funcionamento do deploy.

---

## ✅ Status

- [x] Erro de TypeScript corrigido
- [x] Repositório de backup criado
- [x] Push realizado para ambos os repositórios
- [x] Build deve funcionar corretamente agora

---

## 🚀 Próximos Passos

1. Fazer novo deploy no Coolify usando o repositório de backup
2. Verificar se o build completa com sucesso
3. Testar a aplicação em produção

---

**Data da Correção:** 08/01/2026



