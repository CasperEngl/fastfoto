FROM node:20 AS base

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV AUTH_TRUST_HOST=true

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
COPY --from=builder /app .

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
