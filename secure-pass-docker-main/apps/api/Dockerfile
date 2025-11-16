FROM node:16-alpine
ARG PORT=8000
ENV PORT=$PORT
WORKDIR /backend
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
EXPOSE $PORT
RUN npm run build
CMD ["npm","start"]