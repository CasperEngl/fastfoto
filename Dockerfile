FROM oven/bun:alpine AS base

ARG NODE_ENV
ARG APP_URL
ARG AUTH_SECRET
ARG DATABASE_URL
ARG DATABASE_URL_EXTERNAL
ARG POSTGRES_DB
ARG POSTGRES_PASSWORD
ARG POSTGRES_USER
ARG RESEND_KEY

RUN echo ${NODE_ENV}
RUN echo ${APP_URL}
RUN echo ${AUTH_SECRET}
RUN echo ${DATABASE_URL}
RUN echo ${DATABASE_URL_EXTERNAL}
RUN echo ${POSTGRES_DB}
RUN echo ${POSTGRES_PASSWORD}
RUN echo ${POSTGRES_USER}
RUN echo ${RESEND_KEY}

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
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "run", "server.js"]
