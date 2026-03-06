FROM node:20-bookworm AS builder

WORKDIR /app

# Install all deps including dev for building
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-bookworm AS prod

# Install Python and pip for Chroma server
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Install Chroma
RUN pip3 install chromadb --break-system-packages

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Copy start script from builder
COPY --from=builder /app/start.sh ./start.sh

RUN chmod +x ./start.sh || true

EXPOSE 3000 8000

# Run production start
CMD ["./start.sh"]
