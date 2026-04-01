-- ================================================================
-- SEED — Questions initiales Octalysis
-- Exécuter APRÈS schema.sql et APRÈS avoir créé un compte intervenant
-- Remplacer 'INTERVENANT_USER_ID' par l'UUID de ton compte intervenant
-- (visible dans Authentication > Users sur Supabase)
-- ================================================================

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Prend le premier intervenant disponible (ou NULL pour le seed)
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'intervenant' LIMIT 1;

  INSERT INTO public.questions (text, pillar, target_role, type, options, order_index, created_by) VALUES

  -- CD1 - Signification Épique
  ('Avez-vous le sentiment que votre travail contribue à une mission plus grande que vous-même ?', 'CD1', 'all', 'scale', NULL, 1, admin_id),
  ('L''entreprise communique-t-elle clairement sa vision et ses valeurs aux employés ?', 'CD1', 'chef_projet', 'scale', NULL, 2, admin_id),
  ('Ressentez-vous de la fierté en tant que membre de cette organisation ?', 'CD1', 'operateur', 'scale', NULL, 3, admin_id),

  -- CD2 - Développement & Accomplissement
  ('Avez-vous des objectifs clairs et mesurables dans votre poste ?', 'CD2', 'all', 'scale', NULL, 4, admin_id),
  ('Des mécanismes de progression de compétences sont-ils en place ?', 'CD2', 'chef_projet', 'multiple', ARRAY['Oui, formellement','Partiellement','Non','En cours de déploiement'], 5, admin_id),
  ('Recevez-vous un retour sur votre performance régulièrement ?', 'CD2', 'operateur', 'scale', NULL, 6, admin_id),

  -- CD3 - Autonomisation & Créativité
  ('Avez-vous la liberté de proposer et tester de nouvelles méthodes de travail ?', 'CD3', 'all', 'scale', NULL, 7, admin_id),
  ('Les processus permettent-ils aux équipes de s''auto-organiser ?', 'CD3', 'chef_projet', 'scale', NULL, 8, admin_id),
  ('Pouvez-vous signaler des problèmes ou anomalies sans crainte de répercussions ?', 'CD3', 'operateur', 'scale', NULL, 9, admin_id),

  -- CD4 - Propriété & Possession
  ('Ressentez-vous un sentiment d''appartenance envers votre outil/poste de travail ?', 'CD4', 'operateur', 'scale', NULL, 10, admin_id),
  ('Les employés sont-ils impliqués dans les décisions qui les concernent ?', 'CD4', 'chef_projet', 'scale', NULL, 11, admin_id),
  ('Y a-t-il des mécanismes de personnalisation du poste de travail ?', 'CD4', 'all', 'multiple', ARRAY['Oui, totalement','Partiellement','Non','Ne sait pas'], 12, admin_id),

  -- CD5 - Influence Sociale
  ('Le travail d''équipe est-il valorisé et encouragé dans l''usine ?', 'CD5', 'all', 'scale', NULL, 13, admin_id),
  ('Existe-t-il des rituels ou moments de cohésion entre équipes ?', 'CD5', 'chef_projet', 'scale', NULL, 14, admin_id),
  ('Avez-vous de bonnes relations avec vos collègues directs ?', 'CD5', 'operateur', 'scale', NULL, 15, admin_id),

  -- CD6 - Rareté & Impatience
  ('Les ressources nécessaires à votre travail sont-elles toujours disponibles ?', 'CD6', 'operateur', 'scale', NULL, 16, admin_id),
  ('Les délais imposés sont-ils réalistes et motivants ?', 'CD6', 'all', 'scale', NULL, 17, admin_id),
  ('Y a-t-il des accès limités à certaines formations créant une valeur perçue ?', 'CD6', 'chef_projet', 'multiple', ARRAY['Oui, stratégiquement','Oui, par contrainte','Non','En réflexion'], 18, admin_id),

  -- CD7 - Imprévisibilité & Curiosité
  ('Votre travail contient-il des éléments de découverte ou d''innovation réguliers ?', 'CD7', 'all', 'scale', NULL, 19, admin_id),
  ('L''entreprise favorise-t-elle l''expérimentation et l''apprentissage par l''erreur ?', 'CD7', 'chef_projet', 'scale', NULL, 20, admin_id),
  ('Êtes-vous curieux d''apprendre de nouvelles techniques dans votre métier ?', 'CD7', 'operateur', 'scale', NULL, 21, admin_id),

  -- CD8 - Perte & Évitement
  ('Avez-vous peur de conséquences négatives si vous commettez une erreur ?', 'CD8', 'operateur', 'scale', NULL, 22, admin_id),
  ('Les systèmes de sanction/récompense sont-ils clairement définis ?', 'CD8', 'chef_projet', 'scale', NULL, 23, admin_id),
  ('Ressentez-vous une pression excessive dans votre rôle quotidien ?', 'CD8', 'all', 'scale', NULL, 24, admin_id);

END $$;
