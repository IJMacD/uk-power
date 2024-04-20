# Frontend build step
FROM node:20 AS react-build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./public/ ./public/
COPY ./src/ ./src/
COPY ./vite.config.js index.html ./
RUN yarn build

# Server
FROM node:20-alpine
WORKDIR /app
COPY --from=react-build /app/dist /app/public
COPY server.js package.json .
EXPOSE 8000
CMD [ "node", "server.js" ]