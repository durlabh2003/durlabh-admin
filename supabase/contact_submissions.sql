-- ═══════════════════════════════════════════════════════════════════════════
--  COMPLETE SUPABASE SETUP SCRIPT
--  Project: fbqzbshashzkebvucejg
--  Run once in: Supabase Dashboard → SQL Editor → paste all → Run
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- PART 1: Roles & Auth Infrastructure
-- ───────────────────────────────────────────────────────────────────────────

-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- User roles table (one row per user per role)
CREATE TABLE public.user_roles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL   ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────────────
-- PART 2: Private schema + has_role helper
-- (private schema keeps the helper out of the public PostgREST API)
-- ───────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role)
  TO authenticated, service_role;

-- Admin-only policies on user_roles
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING  (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));


-- ───────────────────────────────────────────────────────────────────────────
-- PART 3: updated_at trigger helper
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ───────────────────────────────────────────────────────────────────────────
-- PART 4: portfolio_content table
-- One row per section, data stored as JSONB.
-- Public visitors can read (portfolio is a public site).
-- Only admins can write.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE public.portfolio_content (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  section    text        NOT NULL UNIQUE,
  data       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_content TO authenticated;
GRANT ALL ON public.portfolio_content TO service_role;

ALTER TABLE public.portfolio_content ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Portfolio content is publicly readable"
  ON public.portfolio_content FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "Admins can insert portfolio content"
  ON public.portfolio_content FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update portfolio content"
  ON public.portfolio_content FOR UPDATE TO authenticated
  USING  (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete portfolio content"
  ON public.portfolio_content FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Auto-update updated_at on every write
CREATE TRIGGER portfolio_content_set_updated_at
  BEFORE UPDATE ON public.portfolio_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX portfolio_content_section_idx ON public.portfolio_content (section);


-- ───────────────────────────────────────────────────────────────────────────
-- PART 5: contact_submissions table
-- Public visitors can INSERT (submit the contact form).
-- Only admins can SELECT / UPDATE / DELETE.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE public.contact_submissions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text        NOT NULL,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can mark as read
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete contact submissions"
  ON public.contact_submissions FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));


-- ═══════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETE ✓
--
-- NEXT STEPS (do these after running this script):
--
-- 1. CREATE YOUR ADMIN ACCOUNT
--    Supabase Dashboard → Authentication → Users → "Add user" / "Invite user"
--    Enter your email + set a password.
--
-- 2. GRANT YOURSELF THE ADMIN ROLE
--    After signing up, find your user UUID in Authentication → Users.
--    Then run this in the SQL editor (replace the UUID):
--
--    INSERT INTO public.user_roles (user_id, role)
--    VALUES ('YOUR-USER-UUID-HERE', 'admin');
--
-- 3. OPEN THE ADMIN PANEL
--    http://localhost:5173 → sign in with your email + password.
--
-- 4. POPULATE CONTENT (later step)
--    Use the admin panel's "Edit Profile" section to add real data,
--    or run INSERT statements for each portfolio_content section.
-- ═══════════════════════════════════════════════════════════════════════════
