# 📄 Configuração do Módulo de Geração de Contratos

## 📋 Visão Geral

Este módulo substitui o fluxo do n8n para geração automática de contratos. Ele integra com:
- Google Drive (criação de pastas e cópia de templates)
- Google Docs (atualização de documentos)
- Google Sheets (registro de contratos)
- Gmail (envio de emails com PDFs)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no seu `.env`:

```env
# Google APIs - Credenciais JSON (obtenha em https://console.cloud.google.com/)
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Gmail (opcional - para envio de emails)
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app
```

### 2. Como Obter as Credenciais do Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - Google Drive API
   - Google Sheets API
   - Google Docs API
   - Gmail API
4. Vá em "Credenciais" > "Criar credenciais" > "Conta de serviço"
5. Crie uma conta de serviço e baixe o JSON
6. Compartilhe os arquivos/pastas do Google Drive com o email da conta de serviço
7. Cole o conteúdo do JSON na variável `GOOGLE_CREDENTIALS` (como string JSON)

### 3. Configuração do Gmail (Opcional)

Para enviar emails:
1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "Senha de app" em: https://myaccount.google.com/apppasswords
3. Use essa senha na variável `GMAIL_APP_PASSWORD`

## 📝 IDs dos Templates e Pastas

Os seguintes IDs estão hardcoded no serviço e devem ser atualizados se você usar seus próprios templates:

### Templates do Google Docs:
- **Locação**: `1BjjCJGisw9baDI1ENQpiykgh7ZBUY5vPbcwuNzOU9N4`
- **Prestação**: `1qZxkafpOE4BFuRrZqdraqpAcXwUE_7GsTY0Q5bzcmdY`
- **Procuração PJ**: `1UtYkaU0Y8bq-_3Sm7V-Jsz_8leUOMDQtpRG2idcxUWk`
- **Procuração PF**: `1qtI83buiWR7TKuxNQdEZf33vsli2mGNIWgmCoGcuC_A`

### Pastas do Google Drive:
- **Locação**: `1TGmlbRGNN9QZ0ZWpcFQYIYpC1OQpSGHY`
- **Prestação**: `1jAub0cviN3TE-0JrwhtgzojtjRkIyY8p`
- **Procuração**: `1HbjCit_IYcMqHa7ZvcvaQFjQu6edu3A8`

### Planilha do Google Sheets:
- **ID**: `19DtKJnOMxw4TVbc8sbywV5oP6x6wzps7iFuuAmLshTg`
- **Abas**:
  - Locação: `Página1`
  - Prestação: `Página2`
  - Procuração PJ: `Página3`
  - Procuração PF: `Página4`

## 🚀 Uso da API

### Endpoint

```
POST /contracts/generate
Authorization: Bearer {token}
```

### Exemplo de Requisição - Contrato de Locação

```json
{
  "documentType": "locacao",
  "cidade": "Joaçaba",
  "data": "2025-09-16",
  "nomeGerador": "MAZONETTO APOIO ADM & BUSNELO SERVIÇOS LTDA",
  "cpfCnpjGerador": "45.082.539/0001-75",
  "emailGerador": "vmazonetto@gmail.com",
  "bancoGerador": "Banco Cooperativo Sicredi S.A",
  "agenciaGerador": "0258",
  "contaGerador": "45908-7",
  "tipoUsina": "solar",
  "numeroUcGerador": "3086690",
  "ruaGerador": "Rua Senador Nereu Ramos",
  "numeroGerador": "1133",
  "bairroGerador": "Centro",
  "cidadeGerador": "Xaxim",
  "ufGerador": "SC",
  "cepGerador": "89825-000",
  "tipoDocumentoGerador": "cnpj",
  "nomeConsumidor": "Rapido Sunorte LTDA",
  "cpfCnpjConsumidor": "86.048.063/0001-33",
  "emailConsumidor": "financeiro@sunorte.com.br",
  "numeroUcConsumidor": "52376459",
  "ruaConsumidor": "SC 418",
  "numeroConsumidor": "131",
  "bairroConsumidor": "Oxford",
  "cidadeConsumidor": "São Bento do Sul",
  "ufConsumidor": "SC",
  "cepConsumidor": "89285-470",
  "tipoDocumentoConsumidor": "cnpj",
  "percentualCapacidade": "25",
  "percentualDesconto": "20",
  "prazoVigencia": "12",
  "prazoMulta": "3",
  "diaPagamento": "15"
}
```

### Resposta

```json
{
  "contractId": "1736342400000",
  "documentUrl": "https://docs.google.com/document/d/..."
}
```

## 🔄 Fluxo de Processamento

1. **Recebe dados** via POST `/contracts/generate`
2. **Valida** o tipo de contrato (locação, prestação ou procuração)
3. **Prepara dados** (converte números por extenso, formata endereços)
4. **Verifica/Cria gerador** no banco de dados (apenas para locação)
5. **Adiciona linha** no Google Sheets
6. **Cria pasta** no Google Drive
7. **Copia template** do Google Docs
8. **Atualiza documento** com os dados do contrato
9. **Baixa como PDF**
10. **Envia email** com PDF anexado

## 📌 Placeholders dos Templates

Os templates do Google Docs devem conter os seguintes placeholders que serão substituídos:

### Locação:
- `{NOME DO GERADOR}`
- `{ENDEREÇO COMPLETO DO GERADOR}`
- `{CPF OU CNPJ GERADOR}`
- `{NOME DO CONSUMIDOR}`
- `{ENDEREÇO COMPLETO DO CONSUMIDOR}`
- `{CIDADE}`
- `{DATA}`
- `{NÚMERO DA UC DO GERADOR}`
- `{NÚMERO DA UC DO CONSUMIDOR}`
- `{PERCENTUAL DA CAPACIDADE}`
- `{PERCENTUAL POR EXTENSO CAPACIDADE}`
- `{PERCENTUAL DE DESCONTO}`
- `{PERCENTUAL DE DESCONTO POR EXTENSO}`
- `{NÚMERO DE MESES}`
- `{NÚMERO DE MESES POR EXTENSO}`
- `{DIA DO MÊS}`
- `{E-MAIL DO GERADOR}`
- `{E-MAIL DO CONSUMIDOR}`
- `{BANCO}`
- `{AGÊNCIA}`
- `{Nº DA CONTA}`
- `{CNPJ OU CPF DO CONSUMIDOR}`
- `{PERCENTUAL POR EXTENSO}`
- `{TIPO DA USINA}`
- `{NÚMERO DE MESES MULTA}`

### Prestação:
- `{NOME DO CONTRATANTE}`
- `{ENDEREÇO DO CONTRATANTE}`
- `{CPF/CNPJ DO CONTRATANTE}`
- `{TIPO DE ENERGIA}`
- `{NÚMERO DE MESES}`
- `{EMAIL DO CONTRATANTE}`
- `{NOME DO REPRESENTANTE DO CONTRATANTE}`
- `{CPF DO REPRESENTANTE DO CONTRATANTE}`

### Procuração PJ:
- `{RAZÃO_SOCIAL_OUTORGANTE}`
- `{CNPJ_OUTORGANTE}`
- `{ENDERECO_OUTORGANTE}`
- `{NOME_REPRESENTANTE}`
- `{CPF_REPRESENTANTE}`
- `{CARGO_REPRESENTANTE}`
- `{CIDADE}`
- `{ANO}`
- `{DIA}`
- `{MES}`

### Procuração PF:
- `{NOME_OUTORGANTE}`
- `{CPF_OUTORGANTE}`
- `{OCUPACAO_OUTORGANTE}`
- `{ENDERECO_OUTORGANTE}`
- `{ANO}`

## ⚠️ Observações Importantes

1. **Compartilhamento de Arquivos**: Certifique-se de que a conta de serviço do Google tem acesso a:
   - Todos os templates do Google Docs
   - Todas as pastas do Google Drive
   - A planilha do Google Sheets

2. **Permissões**: A conta de serviço precisa ter permissões de:
   - Editor nos templates
   - Editor na planilha
   - Editor nas pastas

3. **Formato de Data**: Use formato `YYYY-MM-DD` (ex: `2025-09-16`)

4. **Números por Extenso**: Se não fornecidos, serão calculados automaticamente usando a biblioteca `numero-por-extenso`

5. **Criação de Geradores**: Para contratos de locação, o sistema verifica se o gerador já existe no banco pelo CPF/CNPJ. Se não existir, cria automaticamente.

## 🐛 Troubleshooting

### Erro: "Google Drive não está configurado"
- Verifique se `GOOGLE_CREDENTIALS` está no `.env`
- Verifique se o JSON está válido
- Verifique se a conta de serviço tem as permissões necessárias

### Erro: "Email não enviado"
- Verifique se `GMAIL_USER` e `GMAIL_APP_PASSWORD` estão configurados
- Verifique se a senha de app está correta
- O email não é obrigatório, o contrato será gerado mesmo sem envio

### Erro: "Arquivo não encontrado"
- Verifique se os IDs dos templates estão corretos
- Verifique se a conta de serviço tem acesso aos arquivos

## 📚 Dependências

- `googleapis`: Integração com Google APIs
- `numero-por-extenso`: Conversão de números para extenso
- `nodemailer`: Envio de emails

