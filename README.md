# OpenJob API

OpenJob is a RESTful job-board API built with Node.js, Express, and PostgreSQL. It provides endpoints for user authentication, companies, job categories, job listings, applications, bookmarks, and user profiles.

## Features

- User registration and login with bcrypt-hashed passwords.
- Short-lived access tokens and database-backed refresh tokens.
- Public job browsing, including title and company-name search.
- Company and category management, job posting, job applications, and bookmarks.
- Ownership-based authorization for protected operations.
- Request validation and consistent JSON success and error responses.

## Requirements

- Node.js 20.11.0 or later
- PostgreSQL
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

   Update the PostgreSQL credentials and database name in `.env`. Set `ACCESS_TOKEN_KEY` and `REFRESH_TOKEN_KEY` to strong, private secrets. Do not commit `.env`.

3. Create and initialize the database:

   ```bash
   npm run db:create
   npm run migrate up
   ```

   **Warning:** `npm run db:create` creates the database if it does not exist, but if it already exists, the script drops every table in its `public` schema. Use it only with a fresh or disposable development database; do not run it against a database containing data you need to keep. To migrate an existing database without dropping its tables, run only `npm run migrate up`.

4. Start the API:

   ```bash
   npm run start:dev
   ```

   For a regular start, use `npm start`. The server listens at the configured `HOST` and `PORT` (by default, `http://localhost:3000`).

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `HOST` | Host logged by the server | `localhost` |
| `PORT` | HTTP port | `3000` |
| `PGUSER` | PostgreSQL user | `postgres` |
| `PGPASSWORD` | PostgreSQL password | `postgres` |
| `PGDATABASE` | Database name | `openjob` |
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `ACCESS_TOKEN_KEY` | Secret used to sign access tokens | Set your own secret |
| `REFRESH_TOKEN_KEY` | Secret used to sign refresh tokens | Set your own secret |
| `BCRYPT_SALT_ROUNDS` | bcrypt password-hashing cost | `10` |

Access tokens expire after three hours. Refresh tokens are stored in the database and can be revoked by logging out.

## API

All routes are mounted at the server root; there is no `/api` prefix. Send JSON request bodies with `Content-Type: application/json`. Protected routes require:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

| Resource | Endpoints | Access |
| --- | --- | --- |
| Users | `POST /users`, `GET /users/:id` | Public |
| Authentication | `POST /authentications` (login), `PUT /authentications` (refresh), `DELETE /authentications` (logout) | Login and refresh are public; logout requires authentication |
| Profile | `GET /profile`, `GET /profile/applications`, `GET /profile/bookmarks` | Authenticated |
| Companies | `GET /companies`, `GET /companies/:id`, `POST /companies`, `PUT /companies/:id`, `DELETE /companies/:id` | Reads are public; writes require authentication |
| Categories | `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` | Reads are public; writes require authentication |
| Jobs | `GET /jobs`, `GET /jobs/:id`, `GET /jobs/company/:companyId`, `GET /jobs/category/:categoryId`, `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id` | Reads are public; writes require authentication |
| Applications | `GET /applications`, `GET /applications/:id`, `GET /applications/user/:userId`, `GET /applications/job/:jobId`, `POST /applications`, `PUT /applications/:id`, `DELETE /applications/:id` | Authenticated |
| Bookmarks | `GET /bookmarks`, `POST /jobs/:jobId/bookmark`, `GET /jobs/:jobId/bookmark/:id`, `DELETE /jobs/:jobId/bookmark` | Authenticated |

`GET /jobs` supports `title` and `company-name` query parameters, for example:

```text
GET /jobs?title=engineer&company-name=OpenJob
```

To log in, send an email and password to `POST /authentications`:

```json
{
  "email": "person@example.com",
  "password": "your-password"
}
```

The response contains `data.accessToken` and `data.refreshToken`. Use the access token for protected routes. When it expires, send `PUT /authentications` with `{"refreshToken":"YOUR_REFRESH_TOKEN"}` to obtain a new access token. To log out and revoke the refresh token, send `DELETE /authentications` with the same JSON body and include the access token in the authorization header.

Job types are `full-time`, `part-time`, `internship`, `contract`, and `freelance`; experience levels are `junior`, `mid`, `senior`, and `lead`; location types are `remote`, `onsite`, and `hybrid`. Application statuses are `pending`, `reviewed`, `accepted`, and `rejected`.

Successful responses use a JSON object with `status: "success"` and may include `data` and/or `message`. Errors use `status: "failed"` and a `message`.

## Database

The migrations create users, authentications, companies, categories, jobs, applications, and bookmarks. Applications and bookmarks each enforce one record per user and job. The database schema diagram is available in [ERD-OpenJob-versi-1.png](./ERD-OpenJob-versi-1.png).

## Tests and linting

Run the unit and validation tests with:

```bash
npm test
```

Run the PostgreSQL integration test separately (requires a configured and migrated database):

```bash
npm run test:integration
```

Check code style with:

```bash
npm run lint
```

## Postman

The `postman-collection/` directory contains an API collection and environment file that can be imported into Postman for manual API testing.
