# Fase 1: instalar solo dependencias de producción
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Fase 2: imagen final ligera solo con lo necesario para ejecutar
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
