FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build
EXPOSE 3333
CMD ["pnpm", "start:prod"]