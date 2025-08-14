# Multi-stage build to reduce memory usage
# Stage 1: Build stage
FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS builder

WORKDIR /app

# Set Node.js memory limits to prevent OOM
ENV NODE_OPTIONS="--max-old-space-size=4096"

    # Install and pin specific pnpm version for reproducible builds
    COPY package.json pnpm-lock.yaml ./
    RUN npm install -g pnpm@9.12.2
    # Install dependencies with reduced memory footprint
    RUN pnpm install --frozen-lockfile --reporter=silent
COPY . .
RUN pnpm run prisma:generate
# Build with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm build

# Stage 2: Production stage
FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS production

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@9.12.2

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --reporter=silent

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for production
RUN pnpm run prisma:generate

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Next.js production start
CMD ["pnpm","start","-p","3000"]
