# durlabh-admin

Admin panel for Durlabh Daryani's portfolio. Built with Vite + React + TypeScript + Supabase.

## Features

- 🔐 Supabase Auth — admin-role protected
- 📝 Edit Profile — update portfolio `profile` section live
- 📬 Contact Responses — view, read, and manage contact form submissions

## Setup

```bash
npm install
npm run dev
```

Add your Supabase credentials to `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase Migration

Run the SQL in `supabase/contact_submissions.sql` to create the contact submissions table.
