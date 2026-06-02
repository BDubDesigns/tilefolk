FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.base.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "apps/server"]
