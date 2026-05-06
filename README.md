# Contacts API

A RESTful API for managing contacts, built with Express.js and MongoDB.

## Prerequisites

- Node.js 18+
- MongoDB
- Redis (for token blacklisting)

## Setup

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
CONNECTION_STRING=mongodb://localhost:27017/contacts-api
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
VERIFY_TOKEN_SECRET=your-verify-token-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

Base URL: `/api/v1`

### Health

```
GET /api/v1/health
```

### Authentication

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
```

### Contacts (protected)

```
GET    /api/v1/contact
POST   /api/v1/contact
GET    /api/v1/contact/:id
PUT    /api/v1/contact/:id
DELETE /api/v1/contact/:id
```

### User Profile (protected)

```
GET    /api/v1/user/profile
PUT    /api/v1/user/profile
PATCH  /api/v1/user/profile/password
DELETE /api/v1/user/profile
GET    /api/v1/user/profile/preferences
PUT    /api/v1/user/profile/preferences
POST   /api/v1/user/profile/avatar
GET    /api/v1/user/profile/notifications
PUT    /api/v1/user/profile/notifications/settings
```

## Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "...",
  "error": "..."
}
```

## Rate Limiting

- Auth endpoints (register, login): 20 requests per 15 minutes
- Password reset endpoints: 5 requests per 15 minutes
