# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Argumento de construcción para la URL de la API
ARG REACT_APP_API
ENV REACT_APP_API=$REACT_APP_API

# Copiar package files primero (mejor caching)
COPY package*.json ./

# Instalar dependencias con ci para builds reproducibles
RUN npm ci --prefer-offline --no-audit

# Copiar código fuente
COPY . .

# Build de la aplicación con optimizaciones
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 2: Production con Nginx
FROM nginx:alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de React
COPY --from=build /app/build /usr/share/nginx/html

# Crear usuario nginx si no existe y ajustar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check mejorado
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
