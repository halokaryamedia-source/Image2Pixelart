CREATE TABLE IF NOT EXISTS devices (
	id uuid PRIMARY KEY,
	secret_hash text NOT NULL,
	display_name varchar(80) NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
	id uuid PRIMARY KEY,
	owner_device_id uuid NOT NULL REFERENCES devices(id),
	active_editor_device_id uuid REFERENCES devices(id),
	editor_epoch bigint NOT NULL DEFAULT 1,
	name varchar(200) NOT NULL,
	schema_version smallint NOT NULL DEFAULT 3,
	document jsonb NOT NULL,
	cells bytea NOT NULL,
	revision bigint NOT NULL DEFAULT 1,
	source_asset_id uuid,
	deleted_at timestamptz,
	purge_after timestamptz,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_participants (
	project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
	joined_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (project_id, device_id)
);

CREATE TABLE IF NOT EXISTS project_assets (
	id uuid PRIMARY KEY,
	project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	r2_key text NOT NULL UNIQUE,
	file_name varchar(255) NOT NULL,
	mime_type varchar(64) NOT NULL,
	byte_size integer,
	width integer,
	height integer,
	status varchar(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
	created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_source_asset_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_source_asset_id_fkey
	FOREIGN KEY (source_asset_id) REFERENCES project_assets(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
	scope_key text NOT NULL,
	bucket_start timestamptz NOT NULL,
	request_count integer NOT NULL DEFAULT 1,
	expires_at timestamptz NOT NULL,
	PRIMARY KEY (scope_key, bucket_start)
);

CREATE INDEX IF NOT EXISTS project_participants_device_idx ON project_participants(device_id);
CREATE INDEX IF NOT EXISTS projects_purge_idx ON projects(purge_after) WHERE purge_after IS NOT NULL;
CREATE INDEX IF NOT EXISTS project_assets_project_idx ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS rate_limit_expiry_idx ON rate_limit_buckets(expires_at);
