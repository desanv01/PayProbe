# Build from repository root: docker build -f docs/release/deploy/Dockerfile .
# Explicit COPY paths prevent secrets/private workspace files entering layers.
FROM node:24.14.1-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24.14.1-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PAYPROBE_HOST=0.0.0.0 PAYPROBE_PORT=4310 PAYPROBE_PROVIDER=simulated PAYPROBE_DB_PATH=/data/payprobe.sqlite
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir /data && chown node:node /data
COPY --from=build /app/dist ./dist
COPY examples/download-contract.json ./examples/download-contract.json
COPY LICENSE ./LICENSE
USER node
EXPOSE 4310
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PAYPROBE_PORT+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/cli/index.js", "serve"]
