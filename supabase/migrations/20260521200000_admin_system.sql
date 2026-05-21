-- Admin system: audit log, system config, submission admin fields, match manual override

ALTER TABLE vmt_submissions
  ADD COLUMN IF NOT EXISTS admin_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_edited_by text,
  ADD COLUMN IF NOT EXISTS admin_note text;

CREATE TABLE IF NOT EXISTS vmt_admin_log (
  id bigserial PRIMARY KEY,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_id text,
  target_name text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vmt_system_config (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

INSERT INTO vmt_system_config (key, value) VALUES
  ('global_lock', 'false'),
  ('emergency_mode', 'false'),
  ('disable_submissions', 'false'),
  ('maintenance_banner', ''),
  ('scoring_frozen', 'false')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE vmt_matches
  ADD COLUMN IF NOT EXISTS manual_result text CHECK (manual_result IN ('1','X','2')),
  ADD COLUMN IF NOT EXISTS manual_winner text,
  ADD COLUMN IF NOT EXISTS manual_override boolean NOT NULL DEFAULT false;
