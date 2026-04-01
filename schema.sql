-- ================================================================
-- OCTALYSIS FACTORY — Supabase Schema
-- Exécuter dans l'éditeur SQL de ton projet Supabase
-- ================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUM: rôles utilisateurs ─────────────────────────────────────
CREATE TYPE user_role AS ENUM ('intervenant', 'chef_projet', 'operateur');
CREATE TYPE question_type AS ENUM ('scale', 'multiple', 'text');
CREATE TYPE target_role AS ENUM ('all', 'chef_projet', 'operateur');

-- ── TABLE: profiles (étend auth.users) ───────────────────────────
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'operateur',
  usine       TEXT DEFAULT 'Usine École',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLE: questions ─────────────────────────────────────────────
CREATE TABLE public.questions (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text         TEXT NOT NULL,
  pillar       TEXT NOT NULL CHECK (pillar IN ('CD1','CD2','CD3','CD4','CD5','CD6','CD7','CD8')),
  target_role  target_role NOT NULL DEFAULT 'all',
  type         question_type NOT NULL DEFAULT 'scale',
  options      TEXT[] DEFAULT NULL,           -- pour les QCM
  order_index  INTEGER DEFAULT 0,
  active       BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLE: responses ─────────────────────────────────────────────
CREATE TABLE public.responses (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id  UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value_num    NUMERIC,                        -- pour les échelles 1-5
  value_text   TEXT,                           -- pour QCM ou texte libre
  comment      TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (question_id, user_id)               -- 1 réponse par user par question
);

-- ── TABLE: remarks (remarques générales) ─────────────────────────
CREATE TABLE public.remarks (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  pillar      TEXT CHECK (pillar IN ('CD1','CD2','CD3','CD4','CD5','CD6','CD7','CD8')),
  visible_to  user_role[] DEFAULT ARRAY['intervenant','chef_projet']::user_role[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRIGGER: auto-create profile on signup ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'operateur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── TRIGGER: updated_at auto-update ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_questions_updated_at  BEFORE UPDATE ON public.questions  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_responses_updated_at  BEFORE UPDATE ON public.responses  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks   ENABLE ROW LEVEL SECURITY;

-- Helper: récupère le rôle du user courant
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── PROFILES policies ─────────────────────────────────────────────
CREATE POLICY "Chacun voit son profil"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Intervenant voit tous les profils"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('intervenant', 'chef_projet'));

CREATE POLICY "Chacun modifie son profil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── QUESTIONS policies ────────────────────────────────────────────
CREATE POLICY "Tous peuvent lire les questions actives"
  ON public.questions FOR SELECT USING (active = TRUE);

CREATE POLICY "Seul l'intervenant peut créer/modifier/supprimer"
  ON public.questions FOR INSERT
  WITH CHECK (public.get_my_role() = 'intervenant');

CREATE POLICY "Intervenant modifie les questions"
  ON public.questions FOR UPDATE
  USING (public.get_my_role() = 'intervenant');

CREATE POLICY "Intervenant supprime les questions"
  ON public.questions FOR DELETE
  USING (public.get_my_role() = 'intervenant');

-- ── RESPONSES policies ────────────────────────────────────────────
CREATE POLICY "Chacun voit ses propres réponses"
  ON public.responses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Chef projet voit les réponses des opérateurs"
  ON public.responses FOR SELECT
  USING (
    public.get_my_role() = 'chef_projet' AND
    (SELECT role FROM public.profiles WHERE id = user_id) = 'operateur'
  );

CREATE POLICY "Intervenant voit toutes les réponses"
  ON public.responses FOR SELECT
  USING (public.get_my_role() = 'intervenant');

CREATE POLICY "Chacun insère ses propres réponses"
  ON public.responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Chacun modifie ses propres réponses"
  ON public.responses FOR UPDATE USING (auth.uid() = user_id);

-- ── REMARKS policies ──────────────────────────────────────────────
CREATE POLICY "Chacun voit ses remarques"
  ON public.remarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Intervenant et chef voient les remarques"
  ON public.remarks FOR SELECT
  USING (public.get_my_role() = ANY(visible_to));

CREATE POLICY "Chacun insère ses remarques"
  ON public.remarks FOR INSERT WITH CHECK (auth.uid() = user_id);
