# Container del frontend: build di Vite, poi i file statici serviti da nginx.
# Due stadi: Node e node_modules servono solo per la build e non finiscono
# nell'immagine finale, che pesa pochi MB.

# ---- 1. build ----
FROM node:22-alpine AS build
WORKDIR /app

# prima solo i file delle dipendenze: se il codice cambia ma le dipendenze
# no, Docker riusa il layer di npm ci e la build è molto più veloce
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Variabili lette da Vite durante la build. Finiscono nel JavaScript
# pubblico, quindi qui vanno solo valori non segreti (il DSN di Sentry
# lo è per costruzione). La chiave di Spoonacular non passa di qui.
ARG VITE_SENTRY_DSN=""
ARG VITE_APP_ENV="development"
ARG VITE_APP_RELEASE="locale"
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_RELEASE=$VITE_APP_RELEASE

RUN npm run build

# ---- 2. runtime ----
# nginx-unprivileged gira come utente non root sulla porta 8080
FROM nginxinc/nginx-unprivileged:1.29-alpine

# indirizzo del backend; nel docker-compose è il servizio "api"
ENV API_UPSTREAM=http://api:3001 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/"]
