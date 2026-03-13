# Report Tracker

An internal web app for tracking monthly report submissions from area officers. Officers submit their own report statuses, everyone views a live dashboard, and coordinators manage the system through an admin panel.

## Features

- **Dashboard** with live submission status, summary cards, search, and CSV export
- **Submission page** for officers to mark reports as submitted or pending
- **Admin panel** to manage officers, report types, and manually override statuses
- Report types are fully dynamic and editable (never hardcoded)
- Mobile responsive design

## Tech Stack

React, Vite, Tailwind CSS, Supabase, React Router, react-hot-toast, lucide-react

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project and note down your **Project URL** and **anon public key** (found in Settings > API)

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and run it
3. Then copy the contents of `supabase-seed.sql` and run it

This creates the three tables (officers, report_types, report_submissions) with indexes, RLS policies, and seed data.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 6. Run Tests

```bash
npm test
```

---

## Deployment to Vercel

### Option A: Via Vercel Dashboard

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. In the project settings, add these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vercel will auto-detect Vite and deploy

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add the environment variables when asked.

### Important: Add a Vercel Rewrite

For React Router to work on Vercel, create a `vercel.json` in the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This is already included in the project.

---

## Project Structure

```
report-tracker/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  vercel.json
  .env.example
  supabase-schema.sql
  supabase-seed.sql
  src/
    main.jsx
    App.jsx
    index.css
    lib/
      supabase.js          # Supabase client
      api.js               # All database operations
    hooks/
      useReportData.js     # Central data fetching hook
    utils/
      helpers.js           # Month utilities, CSV export
    components/
      AppLayout.jsx        # Shell with Navbar + Outlet
      Navbar.jsx           # Top navigation bar
      MonthSelector.jsx    # Month dropdown
      SearchBar.jsx        # Search input
      SummaryCards.jsx     # Dashboard stat cards
      ReportTable.jsx      # Dynamic submission table
      ReportStatusPill.jsx # Green/red status badge
      LoadingSpinner.jsx   # Loading state
      ConfirmDialog.jsx    # Delete confirmation modal
      OfficerManager.jsx   # CRUD for officers
      ReportTypeManager.jsx # CRUD for report types
    pages/
      DashboardPage.jsx    # /dashboard
      SubmissionPage.jsx   # /submit
      AdminPage.jsx        # /admin
    __tests__/
      helpers.test.js
      dashboard-logic.test.js
```
