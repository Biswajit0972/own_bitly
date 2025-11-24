# URL Shortener Project Documentation

## 1. Project Overview

A URL Shortener converts long, hard-to-share links into short and manageable URLs. When a user visits the short link, the system automatically redirects them to the original URL. This project aims to build a real-world URL shortening service with analytics, expiry logic, validation, and secure backend processing. It demonstrates clean architecture, efficient database design, and practical business logic used in modern web systems.

## 2. Features

* Shorten any valid URL into a unique short code.
* Custom short code support (optional).
* Validate URL format before saving.
* Auto-expiry for URLs after a defined period.
* Analytics tracking: total clicks, device, browser, IP, timestamp.
* Rate limiting to prevent abuse.
* API-based architecture for easy integration.
* Optional user accounts to manage personal URLs.

## 3. Tech Stack

### Frontend (optional):

* Next.js / React
* Tailwind CSS

### Backend:

* Node.js
* Express.js

### Database:

* PSQL (to store URLs & analytics)
* REDIS (for rate limiting and caching)

### Additional Tools:

* JWT (optional authentication)
* Zod (validation)
* Docker (optional)
* Vercel (deployment hosting)
* Supabase (cloud database)

## 4. Architecture

This project follows a clean, layered architecture:

* **Routes Layer** → handles incoming API requests.
* **Controller Layer** → validates input, triggers services.
* **Service Layer** → contains business logic like generating codes, redirecting, analytics tracking.
* **Database Layer** → interacts with MongoDB collections.
* **Middleware Layer** → handles validation, logging, auth, and rate limiting.

Flow:
Client → API Request → Routes → Controller → Service → MongoDB → Response

The redirect flow uses Express route matching to find the short code and immediately send an HTTP redirect to the original URL.

## 5. Database Schema

### URL Collection

* **longUrl** (String): Original full URL.
* **shortCode** (String): Unique code to identify the URL.
* **clicks** (Number): Total times the short link has been visited.
* **expiryDate** (Date): Auto-expiration date.
* **analytics** (Array): Stores device, browser, IP, timestamp.
* **createdAt** (Date)
* **updatedAt** (Date)

### User Collection (optional)

* **name** (String)
* **email** (String)
* **password** (String)
* **urls** (Array of URL references)

## 6. API Endpoints

### Base URL
All API endpoints are prefixed with the base URL. User routes use `/api/users` and URL routes use `/v1/api/urls`.

---

### User Authentication Endpoints

#### POST /api/users/register

**Description:** Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 201
}
```

---

#### POST /api/users/login

**Description:** Authenticate user and receive access/refresh tokens.

**Request Body:**
```json
{
  "identifier": "johndoe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "statusCode": 200
}
```

**Note:** Tokens are also set as HTTP-only cookies.

---

#### GET /api/users/profile

**Description:** Get authenticated user's profile information.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
   },
  "statusCode": 200
}
```

---

#### PUT /api/users/profile

**Description:** Update authenticated user's profile (fullName and/or email).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "fullName": "John Updated",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "user_id",
    "fullName": "John Updated",
    "email": "newemail@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "statusCode": 201
}
```

---

#### GET /api/users/revalidate

**Description:** Revalidate and get a new access token using refresh token.

**Authentication:** Required (Refresh token in header `x-refresh-token` or cookie)

**Response:**
```json
{
  "success": true,
  "message": "User token updated successfully",
  "data": {
    "accessToken": "new_jwt_access_token"
  },
  "statusCode": 201
}
```

---

#### POST /api/users/forget-password

**Description:** Request password reset token (sends reset token to email).

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email",
  "data": {
    "resetToken": "reset_token"
  },
  "statusCode": 200
}
```

---

#### POST /api/users/reset-password

**Description:** Reset user password using reset token.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": null,
  "statusCode": 200
}
```

---

### URL Shortener Endpoints

#### POST /v1/api/urls

**Description:** Create a new short URL.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url/path",
  "tittle": "My Short URL Title",
  "shortCode": "custom123"
}
```

**Note:** `tittle` and `shortCode` are optional. If `shortCode` is not provided, a random 6-character code will be generated.

**Response:**
```json
{
  "success": true,
  "message": "Shortcode created successfully",
  "data": {
    "id": "url_id",
    "shortCode": "custom123",
    "long_url": "https://example.com/very/long/url/path",
    "title": "My Short URL Title",
    "expirationDate": "2024-12-31T23:59:59.000Z"
  },
  "statusCode": 201
}
```

---

#### GET /v1/api/urls

**Description:** Get all short URLs for the authenticated user with pagination.

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `/v1/api/urls?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "message": "Short URLs retrieved successfully",
  "data": {
    "data": [
      {
        "id": "url_id",
        "shortCode": "abc123",
        "longUrl": "https://example.com",
        "title": "Example URL",
        "clicksCount": 42,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user_id": "user_id"
      }
    ],
    "pagination": {
      "totalItems": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  },
  "statusCode": 200
}
```

---

#### GET /v1/api/urls/:shortCode

**Description:** Redirect to the original long URL and log analytics data.

**Authentication:** Not required (public endpoint)

**Response:** HTTP 302 Redirect to the original URL

**Note:** This endpoint tracks analytics including IP address, browser, referer, and user agent.

---

#### PUT /v1/api/urls/:shortCode

**Description:** Update an existing short URL (long URL and/or title).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "url": "https://updated-example.com/new/path",
  "tittle": "Updated Title"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Short URL updated successfully",
  "data": {
    "id": "url_id",
    "shortCode": "abc123",
    "long_url": "https://updated-example.com/new/path",
    "tittle": "Updated Title"
  },
  "statusCode": 200
}
```

---

#### DELETE /v1/api/urls/:shortCode

**Description:** Delete a short URL.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "Short URL deleted successfully",
  "data": {
    "id": "url_id",
    "shortCode": "abc123",
    "long_url": "https://example.com"
  },
  "statusCode": 200
}
```

---

### Analytics Endpoints

**Note:** Analytics endpoint exists in the codebase (`getAnalytics` controller) but is not currently registered in the router. To use it, add the route to `url.route.ts`:

```typescript
GET /v1/api/urls/:shortCode/analytics
```

**Description:** Get analytics data for a specific short code.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "id": "url_id",
    "shortCode": "abc123",
    "long_url": "https://example.com",
    "clickCount": 42,
    ...
  },
  "statusCode": 200
}
```

## 7. Business Logic

* Validate URL format before shortening.
* Generate a unique short code if not provided by the user.
* Short code must not conflict with existing ones.
* Every visit to the short URL must:

    * Increase click counter.
    * Capture analytics (IP, device, time).
* Expired URLs must not redirect; instead show an error.
* Rate limit: limit number of URLs a single IP can shorten per minute.
* If custom short code is used, validate availability.

## 8. Flowcharts

### URL Shortening Flow

```
User Input → Validate URL → Generate Short Code → Save to DB → Return Short URL
```

### Redirection Flow

```
Short URL Visit → Fetch Code → Check Expiry → Log Analytics → Redirect to Original URL
```

## 9. Error Handling

* **400 Bad Request:** Invalid URL format.
* **409 Conflict:** Custom short code already exists.
* **404 Not Found:** Short code not found.
* **410 Gone:** URL expired.
* **429 Too Many Requests:** Rate limit exceeded.
* **500 Internal Server Error:** Unexpected server issues.

## 10. Deployment Plan

* Deploy backend on Railway or Render.
* Deploy frontend (if used) on Vercel.
* Use MongoDB Atlas for storage.
* Environment variables:

    * `MONGO_URI`
    * `BASE_URL`
    * `JWT_SECRET` (if auth used)
* Enable production optimizations like compression, caching, HTTPS.

All systems will be containerized optionally using Docker for consistency across environments.
