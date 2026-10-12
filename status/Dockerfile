FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache wget
RUN corepack enable && corepack prepare yarn@4.11.0 --activate

# Copy ทั้ง global และ backend
COPY global ./global
COPY backend/package.json backend/yarn.lock* ./backend/
WORKDIR /app/backend

# ติดตั้ง dependencies
RUN yarn install

# Copy source code ทั้งหมด
COPY backend/. .

ENV FORCE_COLOR=1
ENV TERM=xterm-256color
ENV PORT=3001
ENV HOST=0.0.0.0
EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

CMD ["yarn", "start"]
