# DevPulse — Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

[https://assignment-2-internal-tech-issue-fe.vercel.app](https://assignment-2-internal-tech-issue-fe.vercel.app)

## GitHub Repository

[https://github.com/nshakib/Assignment-2-Internal-Tech-Issue-Feature-Tracker](https://github.com/nshakib/Assignment-2-Internal-Tech-Issue-Feature-Tracker)

## Author

Md. Nazmus Shakib

---

## Features

- User registration and authentication with JWT
- Role-based access control (contributor, maintainer)
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Input validation and error handling
- Secure password hashing with bcrypt

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| TypeScript | Type safety |
| Express.js | Web framework |
| PostgreSQL | Relational database |
| pg | Native PostgreSQL driver |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |
| Vercel | Deployment |
| NeonDB | Cloud PostgreSQL |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/nshakib/Assignment-2-Internal-Tech-Issue-Feature-Tracker.git
cd Assignment-2-Internal-Tech-Issue-Feature-Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_jwt_secret
CLIENT_URL=http://localhost:3000
PORT=5002
```

### 4. Run the development server

```bash
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for GET /api/issues

| Param | Values | Default |
|---|---|---|
| sort | newest, oldest | newest |
| type | bug, feature_request | none |
| status | open, in_progress, resolved | none |

---

## Database Schema

### users

| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(255) UNIQUE | Login email |
| password | TEXT | Hashed password |
| role | VARCHAR(20) | contributor or maintainer |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

### issues

| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| title | VARCHAR(150) | Issue title |
| description | TEXT | Issue description |
| type | VARCHAR(20) | bug or feature_request |
| status | VARCHAR(20) | open, in_progress, resolved |
| reporter_id | INTEGER | ID of the user who created the issue |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: <your_jwt_token>
```

---

## User Roles

| Role | Permissions |
|---|---|
| contributor | Register, login, create issues, view issues, update own open issues |
| maintainer | All contributor permissions, update any issue, delete any issue, change issue status |