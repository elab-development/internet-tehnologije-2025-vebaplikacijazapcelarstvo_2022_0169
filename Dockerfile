FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN useradd -m nodeuser
USER nodeuser

COPY --from=builder /app ./

EXPOSE 3000
<<<<<<< HEAD
CMD ["npm","run","start"]
=======
CMD ["sh","-c","npm run db:migrate && npm run db:seed && npm run start"]
>>>>>>> 72c2120229922405b5721d0cb121ed00f8f44766
