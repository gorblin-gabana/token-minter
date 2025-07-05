# Use official Node.js LTS image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm for runtime (if needed for start script)
RUN npm install -g pnpm

# Copy only necessary files for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/lib ./lib

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"]
