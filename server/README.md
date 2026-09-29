# Server

This is the backend for SEO Rank Tracker. It exposes authenticated APIs for SEO analysis, user authentication, and keyword ranking workflows.

## Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- Google Gemini for SEO analysis
- Playwright + Browserbase for page scraping
- node-cron for scheduled rank checks

## Project Structure

```text
server/
├── config/
│   └── db.js
├── controllers/
│   ├── analysisController.js
│   ├── authController.js
│   └── rankController.js
├── cron/
│   └── rankTrackingCron.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Analysis.js
│   ├── keywordTracking.js
│   └── user.js
├── routes/
│   ├── analysisRoutes.js
│   ├── authRoutes.js
│   └── rankRoute.js
├── services/
│   ├── geminiService.js
│   ├── keywordtrackingService.js
│   ├── rankTrackerService.js
│   └── scraperService.js
├── .env
├── package.json
├── README.md
├── server.js
└── package-lock.json
```

## Environment Variables

Create a `.env` file in this directory:

```env
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/seo-rank-tracker
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your_gemini_api_key
BROWSERBASE_API_KEY=your_browserbase_api_key
```

## Installation

```bash
cd server
npm install
```

## Start the Server

### Development

```bash
npm run server
```

### Production

```bash
npm start
```

## Authentication

The API uses JWT tokens.

- `POST /api/auth/register` — create a new user account
- `POST /api/auth/login` — login and receive a JWT
- `GET /api/auth/user` — get the authenticated user profile

Protected routes require the `Authorization: Bearer <token>` header.

## API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/user
```

### Analysis

```http
POST /api/analysis/analyze
GET /api/analysis/list
GET /api/analysis/:id
DELETE /api/analysis/:id
```

### Rank Tracking

```http
POST /api/rank/add
GET /api/rank/list
GET /api/rank/:id
PUT /api/rank/:id/refresh
PUT /api/rank/:id/toggle
DELETE /api/rank/:id
```

## Core Features

### SEO Audit Pipeline

The analysis workflow is:
1. receive a URL from the client
2. validate the incoming URL
3. create a stored analysis record for the user
4. scrape the page with Browserbase + Playwright
5. send structured page data to Gemini for SEO evaluation
6. store overall score, categories, issues, keywords, and metadata

### Rank Tracking Pipeline

The keyword workflow is:
1. store a keyword + domain for a user
2. query search results for the keyword
3. determine current position and page
4. update rank history and competitor snapshots
5. schedule recurring checks with `node-cron`

## Database Models

### User
- name
- email
- password
- plan
- analysisCount
- lastAnalysisDate

### Analysis
Stores:
- userId
- url
- overallScore
- seo/performance/accessibility/bestPractices category scores
- metaData
- headings
- links
- images
- keywords
- issues
- page metrics
- status

### KeywordTracking
Stores:
- userId
- keyword
- url
- domain
- currentPosition
- currentPage
- bestPosition
- positionChange
- rankHistory
- competitors
- active status
- lastChecked

## Cron Jobs

The server starts a scheduled task to re-run active keyword checks daily.

This is configured in `cron/rankTrackingCron.js`.

## Notes

- The server must be running before the frontend can authenticate or fetch data.
- External services such as Gemini and Browserbase are required for full functionality.
- If the page is blocked by Google anti-bot detection, rank tracking may fail or skip retries.

## Scripts

```json
{
  "start": "node server.js",
  "server": "nodemon server.js"
}
```
