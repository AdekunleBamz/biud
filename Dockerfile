# BiUD Dockerfile
# Container for running Clarinet checks and tests

FROM node:20-alpine

WORKDIR /app

RUN npm install -g @hirosystems/clarinet@2.7.0

COPY package*.json ./
RUN npm install

COPY . ./

CMD ["clarinet", "check"]