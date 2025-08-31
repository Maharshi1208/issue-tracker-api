# --- Build stage ---
FROM node:18-bullseye AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev deps for smaller runtime image
RUN npm prune --omit=dev

# --- Runtime stage (dev-friendly: run as root to avoid WSL perms) ---
FROM node:18-bullseye-slim AS runtime
WORKDIR /app

# Ensure data dir exists for SQLite
RUN mkdir -p /app/data

# Copy runtime deps and compiled code
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/data.sqlite

EXPOSE 3000
CMD ["node", "dist/index.js"]
