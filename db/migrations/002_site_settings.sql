CREATE TABLE IF NOT EXISTS site_settings (
	key text PRIMARY KEY,
	value jsonb NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value)
VALUES ('canvas', '{"widthMm":2400,"heightMm":1200,"cellMm":50}'::jsonb)
ON CONFLICT (key) DO NOTHING;
