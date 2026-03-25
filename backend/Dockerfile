FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

RUN npx camoufox-js fetch
RUN npx playwright install-deps firefox

COPY src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
