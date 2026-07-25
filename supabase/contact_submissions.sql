-- ─────────────────────────────────────────────────────────────────────────
-- Admin Supabase Migration
-- Run this in your Admin Supabase SQL Editor (project: fbqzbshashzkebvucejg)
-- ─────────────────────────────────────────────────────────────────────────

-- ─── 1. contact_submissions table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  message     text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Any visitor (anon) can submit the contact form
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Any authenticated user (i.e., you, the admin) can view submissions
CREATE POLICY "Authenticated users can read submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user can mark as read / update
CREATE POLICY "Authenticated users can update submissions"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (true);

-- Any authenticated user can delete submissions
CREATE POLICY "Authenticated users can delete submissions"
  ON public.contact_submissions FOR DELETE
  TO authenticated
  USING (true);
