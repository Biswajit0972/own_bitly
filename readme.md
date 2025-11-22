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

### POST /api/shorten

**Description:** Create a new short URL.
**Request Body:**

```json
{
  "longUrl": "https://example.com/page"
}
```

**Response:**

```json
{
  "shortUrl": "https://yourdomain.com/abc123",
  "shortCode": "abc123"
}
```

### GET /:shortCode

**Description:** Redirects to the original long URL and logs analytics.

### GET /api/analytics/:shortCode

**Description:** Returns analytics data for a specific short code.
**Response:**

```json
{
  "clicks": 42,
  "analytics": [ ... ]
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
