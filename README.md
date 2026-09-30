# OpenJob RESTful API V2

## Prerequisites

- Node.js 20.11 or newer
- PostgreSQL
- Redis
- RabbitMQ
- SMTP credentials for the independent application-notification consumer

## Setup and run the API

```bash
npm install
cp .env.example .env
npm run db:create
npm run migrate up
npm run start
```

## Tests and lint

```bash
npm test
npm test:integration
npm run lint
npm run format:check
npm run format
```
