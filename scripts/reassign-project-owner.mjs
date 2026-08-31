import { neon } from '@neondatabase/serverless';

const [projectId, deviceId] = process.argv.slice(2);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib tersedia.');
if (!projectId || !deviceId) throw new Error('Gunakan: npm run db:reassign-owner -- <project-id> <device-id>');
const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(
	`UPDATE projects p
	 SET owner_device_id = $2::uuid, active_editor_device_id = $2::uuid,
	     editor_epoch = editor_epoch + 1, updated_at = now()
	 WHERE p.id = $1::uuid
	   AND EXISTS (SELECT 1 FROM project_participants pp WHERE pp.project_id = p.id AND pp.device_id = $2::uuid)
	 RETURNING p.id`,
	[projectId, deviceId]
);
if (!rows.length) throw new Error('Project/perangkat tidak ditemukan atau perangkat belum pernah membuka proyek.');
console.log(`Owner proyek ${projectId} dipindahkan ke perangkat ${deviceId}.`);
