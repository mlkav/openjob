# OpenJob

OpenJob is a job marketplace platform backend built with Node.js, Express, PostgreSQL, Redis, and RabbitMQ. It exposes RESTful APIs for managing users, companies, categories, jobs, applications, bookmarks, authentication, profiles, and uploaded documents. The project also includes a background consumer service that sends application notification emails asynchronously.

## Overview

This repository contains two main components:

- `api/` – the main REST API for the platform
- `consumer/` – an async RabbitMQ consumer that processes application events and sends email notifications

The API is organized around a typical job portal workflow:

- Employers create and manage companies and job listings
- Applicants browse jobs and submit applications
- Users can bookmark jobs and manage personal profiles
- Application events are published to RabbitMQ and processed by the consumer
- Redis is used for caching and PostgreSQL stores the primary application data

## Features

- User registration, login, refresh-token flow, and logout
- JWT-based authentication and protected routes
- Company management and ownership-aware access control
- Category and job listing management
- Job search and filtering by company or category
- Application creation, updates, and retrieval
- Bookmark creation and deletion for jobs
- Profile and document management
- PostgreSQL migrations for schema versioning
- Redis cache integration for frequently accessed data
- RabbitMQ-based asynchronous application notification processing
- SMTP email delivery for application status and recruiter notifications

## Project structure

```text
openjob/
├── api/
│   ├── src/
│   ├── migrations/
│   ├── test/
│   ├── script/
│   ├── .env.example
│   ├── package.json
│   └── eslint.config.js
├── consumer/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── postman-collection/
├── ERD-OpenJob-versi-2.png
└── README.md
```

## Tech stack

- Node.js 20.11+
- Express.js
- PostgreSQL
- Redis
- RabbitMQ
- PostgreSQL migrations (`node-pg-migrate`)
- JWT (`jsonwebtoken`)
- BCrypt (`bcrypt`)
- Joi validation
- Nodemailer for email delivery
- Multer for document uploads

## Prerequisites

Before running the project, ensure the following services are available:

- Node.js 20.11 or newer
- PostgreSQL
- Redis
- RabbitMQ
- SMTP credentials for the consumer email service

## API setup

1. Change into the API directory:

```bash
cd api
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update the values in `.env` with your local database, Redis, JWT, and RabbitMQ configuration.

5. Create the PostgreSQL database:

```bash
npm run db:create
```

6. Run database migrations:

```bash
npm run migrate up
```

7. Start the API:

```bash
npm run start
```

For development mode with automatic restarts on file changes:

```bash
npm run start:dev
```

## Consumer setup

The consumer is a separate process responsible for processing application notifications from RabbitMQ and sending email notifications.

1. Change into the consumer directory:

```bash
cd consumer
```

2. Install dependencies:

```bash
npm install
```

3. Create the environment file:

```bash
cp .env.example .env
```

4. Configure PostgreSQL, RabbitMQ, and SMTP credentials in the consumer `.env` file.

5. Start the consumer:

```bash
npm run start
```

## Environment variables

The API `.env.example` includes the following categories:

- Application host and port
- PostgreSQL connection settings
- JWT secrets
- BCrypt salt rounds
- Redis host settings
- RabbitMQ connection settings

The consumer `.env.example` includes:

- PostgreSQL settings
- RabbitMQ settings
- SMTP settings
- Retry / DLQ configuration for failed email processing

## Main API resources

The API implements the following resource groups, matching the project structure:

- `/authentications` – login, refresh-token, and logout flows
- `/users` – user data management
- `/companies` – company resources
- `/categories` – job categories
- `/jobs` – job listing CRUD and bookmark endpoints
- `/applications` – application submission and status management
- `/bookmarks` – bookmark operations
- `/profile` – authenticated user profile operations
- `/documents` – document upload and retrieval

## Database and messaging flow

The backend relies on PostgreSQL as the system of record and uses Redis for cache-backed queries. When a user applies for a job, the API publishes an application event to RabbitMQ. The consumer then reads the message, fetches the relevant application metadata from PostgreSQL, and sends an email notification via SMTP.

This asynchronous pattern decouples application processing from the main HTTP request flow and improves reliability during high-volume events.

## Testing and quality checks

From the `api` directory:

```bash
npm test
npm test:integration
npm run lint
npm run format:check
npm run format
```

You can run the consumer lint/format checks from the `consumer` directory:

```bash
npm run lint
npm run format:check
```

## API collection and ERD

- Postman collection: `postman-collection/`
- ER diagram: [ERD-OpenJob-versi-2.png](./ERD-OpenJob-versi-2.png)

These assets provide a practical reference for request payloads and the database model used by the application.

## Notes

- The API and consumer are intentionally split so the main platform remains responsive while notification delivery is handled asynchronously.
- The application uses environment-based configuration instead of hardcoded credentials.
- Database changes are managed through migration files under `api/migrations`.
