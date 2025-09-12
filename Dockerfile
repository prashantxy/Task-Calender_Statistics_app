
FROM node:20-bullseye AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile


COPY . .

RUN pnpm build


FROM node:20-bullseye AS runner

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "start"]
