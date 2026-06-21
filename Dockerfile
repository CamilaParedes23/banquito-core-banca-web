FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist
COPY public/env.template.js ./dist/env.template.js
COPY docker-entrypoint.js /usr/local/bin/docker-entrypoint.js

EXPOSE 3000

ENTRYPOINT ["node", "/usr/local/bin/docker-entrypoint.js"]
