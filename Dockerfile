# Dockerfile para deploy alternativo

# Define um estágio de construção
FROM node:20-alpine AS build

WORKDIR /app

# Instale as dependências, incluindo as de desenvolvimento
COPY package*.json ./
RUN npm install

# Copie os arquivos e construa a aplicação
COPY . .
RUN npm run build

# Define o estágio de produção
FROM node:20-alpine AS production

WORKDIR /app

# Copie apenas o necessário de build para produção
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json ./

# Expor porta para a aplicação
EXPOSE 3000

# Comando de inicialização da aplicação
CMD ["node", "dist/main"]
