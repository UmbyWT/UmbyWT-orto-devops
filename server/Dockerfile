# Container del backend: il server Node che tiene la chiave di Spoonacular.
# Non ha dipendenze npm, quindi basta copiare due file.
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# package.json serve solo per "type": "module" (import/export)
COPY --chown=node:node package.json ./
COPY --chown=node:node server/app.js server/index.js ./server/

# l'immagine node ha già un utente non root, "node", con uid 1000
USER 1000:1000

EXPOSE 3001

# Docker segna il container "unhealthy" se /api/health non risponde 200,
# per esempio quando manca la chiave
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-qO", "/dev/null", "http://127.0.0.1:3001/api/health"]

CMD ["node", "server/index.js"]
