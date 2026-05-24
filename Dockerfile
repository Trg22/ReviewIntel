FROM node:18-alpine

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Explicitly expose port and set env
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["node", "server.js"]
