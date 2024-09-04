FROM node:22.7.0-alpine

WORKDIR /app

ARG PORT

ENV PATH /app/node_modules/.bin:$PATH

COPY app/frontend/.env /app/.env
COPY app/frontend/package.json /app/package.json
COPY app/frontend/package-lock.json /app/package-lock.json
COPY app/frontend/tsconfig.json /app/tsconfig.json

RUN npm cache clean --force && npm install -g npm@10.8.3 && npm install --legacy-peer-deps

COPY . /app

EXPOSE $PORT
CMD ["npm", "run", "start:dev"]