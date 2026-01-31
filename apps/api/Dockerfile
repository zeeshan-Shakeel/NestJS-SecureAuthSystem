# Step 1: Base image
FROM oven/bun:1.1 as base
WORKDIR /app

# Step 2: Install dependencies
COPY package.json bun.lockb ./
COPY apps/api/package.json ./apps/api/
RUN bun install --frozen-lockfile

# Step 3: Build the NestJS app
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared 
WORKDIR /app/apps/api
RUN bunx prisma generate
RUN bun run build

# Step 4: Production runner
FROM oven/bun:1.1-slim
WORKDIR /app
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/node_modules ./node_modules
COPY --from=base /app/apps/api/package.json ./package.json

EXPOSE 4000
CMD ["bun", "run", "dist/main.js"]