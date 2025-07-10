# Integração do Frontend com a Energy Management API

Este documento descreve como integrar um aplicativo frontend com a Energy Management API desenvolvida em Nest.js.

## 🌐 Endpoints da API

A API está disponível em `http://localhost:3000` (em ambiente de desenvolvimento) ou na URL de deploy (EasyPanel).

A documentação interativa do Swagger está disponível em `/api` (ex: `http://localhost:3000/api`).

## 🔑 Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Todos os endpoints, exceto `/auth/login` e `/auth/create-admin`, exigem um token JWT válido no cabeçalho `Authorization`.

### Fluxo de Autenticação

1. **Login do Usuário**: Envie uma requisição `POST` para `/auth/login` com `email` e `password` no corpo da requisição.
   ```json
   {
     "email": "douglasmelere@gmail.com",
     "password": "Juninhoplay13!"
   }
   ```
   A resposta incluirá um `access_token` e os dados do usuário.

2. **Armazenar o Token**: Armazene o `access_token` de forma segura no frontend (ex: `localStorage` ou `sessionStorage`).

3. **Requisições Autenticadas**: Para todas as requisições subsequentes a endpoints protegidos, inclua o `access_token` no cabeçalho `Authorization` no formato `Bearer <token>`.
   ```
   Authorization: Bearer <seu_access_token>
   ```

### Exemplo de Requisição (JavaScript - Fetch API)

```javascript
// Exemplo de Login
async function login(email, password) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('accessToken', data.access_token);
    console.log('Login bem-sucedido:', data.user);
    return data;
  } else {
    console.error('Erro no login:', data.message);
    throw new Error(data.message);
  }
}

// Exemplo de Requisição Autenticada
async function fetchUsers() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error('Nenhum token de acesso encontrado. Faça login primeiro.');
    return;
  }

  const response = await fetch('http://localhost:3000/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (response.ok) {
    console.log('Usuários:', data);
    return data;
  } else {
    console.error('Erro ao buscar usuários:', data.message);
    throw new Error(data.message);
  }
}

// Uso
// login('douglasmelere@gmail.com', 'Juninhoplay13!')
//   .then(() => fetchUsers())
//   .catch(err => console.error(err));
```

## 📊 Dashboard

Os dados da dashboard podem ser obtidos através dos seguintes endpoints:

- `GET /dashboard`: Retorna todos os dados sumarizados, incluindo totais, novos clientes, distribuição por estado e insights.
- `GET /dashboard/generators-by-source`: Retorna a distribuição de geradores por tipo de fonte.
- `GET /dashboard/consumers-by-type`: Retorna a distribuição de consumidores por tipo.

## 👥 CRUDs (Usuários, Consumidores, Geradores)

Todos os CRUDs seguem o padrão RESTful. Consulte a documentação do Swagger (`/api`) para detalhes sobre os DTOs (Data Transfer Objects) de cada endpoint (campos obrigatórios, tipos, exemplos).

### Exemplos de Operações

- **Criar Consumidor (POST /consumers)**
  ```json
  {
    "name": "Novo Consumidor",
    "cpfCnpj": "111.222.333-44",
    "ucNumber": "98765432",
    "concessionaire": "CELESC",
    "city": "São Paulo",
    "state": "SP",
    "consumerType": "RESIDENTIAL",
    "phase": "MONOPHASIC",
    "averageMonthlyConsumption": 250,
    "discountOffered": 10
  }
  ```

- **Alocar Consumidor (POST /consumers/:id/allocate)**
  ```json
  {
    "generatorId": "<ID_DO_GERADOR>",
    "percentage": 75
  }
  ```

## ⚠️ Tratamento de Erros

A API retorna códigos de status HTTP padrão para indicar o sucesso ou falha das operações (ex: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error).

Em caso de erro, a resposta conterá um objeto JSON com `statusCode`, `message` e `error` (se aplicável).

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password should not be empty"
  ],
  "error": "Bad Request"
}
```

## ⚙️ Configuração CORS

A API está configurada para permitir requisições de qualquer origem (`app.enableCors({ origin: true })`), o que facilita o desenvolvimento frontend. Em produção, considere restringir as origens permitidas para maior segurança.

## 💡 Dicas para o Frontend

- **Bibliotecas HTTP**: Utilize bibliotecas como `axios` ou a `Fetch API` nativa para fazer as requisições HTTP.
- **Gerenciamento de Estado**: Use uma solução de gerenciamento de estado (ex: Redux, Zustand, Context API) para armazenar o token de autenticação e os dados do usuário.
- **Rotas Protegidas**: Implemente guards de rota no frontend para proteger rotas que exigem autenticação.
- **Formulários**: Utilize bibliotecas de formulário com validação (ex: Formik, React Hook Form) para facilitar a criação e validação dos dados enviados para a API.
- **Componentes Reutilizáveis**: Crie componentes reutilizáveis para exibir dados de consumidores, geradores e a dashboard.

---

