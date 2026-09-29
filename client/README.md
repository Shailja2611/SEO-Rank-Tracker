# Client

This is the frontend for the SEO Rank Tracker application. It is a React + Vite + TypeScript dashboard for analyzing websites, viewing SEO reports, tracking keyword positions, and monitoring historical results.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide icons
- React Hot Toast

## Features

- landing page and marketing sections
- user registration and login flow
- protected dashboard and route guards
- instant SEO analysis workflow
- report detail pages with score summaries and issue breakdowns
- keyword tracker management
- rank history charting and detail views
- historical audit list and deletion support

## Project Structure

```text
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
└── README.md
```

## Environment Variables

Create a `.env` file in this folder:

```env
VITE_BACKEND_URL=http://localhost:5000
```

This is used by the app context to send requests to the backend API.

## Installation

```bash
cd client
npm install
```

## Run Locally

```bash
npm run dev
```

The app usually runs at:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Main Routes

- `/` — landing page
- `/login` — login page
- `/register` — registration page
- `/dashboard` — authenticated overview page
- `/analyze` — URL analysis form
- `/history` — previously completed analyses
- `/report/:id` — detailed SEO report
- `/rank-tracker` — keyword tracking dashboard
- `/rank/:id` — keyword tracking history details

## Notes

- The frontend expects the backend to be running on the configured `VITE_BACKEND_URL`.
- Protected routes are enforced by the `ProtectedRoute` component and authenticated user state.
- Report status updates are handled asynchronously, so the page may poll or redirect after the initial analysis request.

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```
