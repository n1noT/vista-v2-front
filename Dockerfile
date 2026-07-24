FROM node:22-alpine AS base
WORKDIR /app

FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--allowed-hosts"]
