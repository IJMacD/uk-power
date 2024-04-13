# Frontend build step
FROM node:12 AS react-build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./public/ ./public/
COPY ./src/ ./src/
COPY ./webpack.config.js ./.babelrc ./
RUN yarn build

# Server
FROM node:12-alpine
WORKDIR /app
COPY --from=react-build /app/output /app/public
COPY server.js .
EXPOSE 8000
CMD [ "node", "server.js" ]