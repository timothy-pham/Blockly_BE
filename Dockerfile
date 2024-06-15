# syntax=docker/dockerfile:1

FROM node:18.16.1-alpine
WORKDIR /
COPY . .
RUN npm install
CMD ["node", "index.js"]