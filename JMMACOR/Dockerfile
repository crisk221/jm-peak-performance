# Playwright image includes Chrome + fonts for server-side PDF
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /app

# Corepack + pnpm
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# App
COPY . .
RUN pnpm prisma generate
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Next.js production start
CMD ["pnpm","start","-p","3000"]
