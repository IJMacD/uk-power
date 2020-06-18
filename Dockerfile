# Frontend build step
FROM node:12 AS react-build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Server
FROM node:12-alpine
WORKDIR /app
COPY --from=react-build /app/output /app/public
COPY server.js .
EXPOSE 8000
CMD [ "node", "server.js" ]