import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL wajib tersedia. Jalankan dengan env lokal atau Vercel env pull.');
const migration = await readFile(resolve('db/migrations/001_cloud_projects.sql'), 'utf8');
const sql = neon(databaseUrl);
for (const statement of migration.split(/;\s*(?:\n|$)/).map((value) => value.trim()).filter(Boolean)) {
	await sql.query(statement);
}
console.log('Migration 001_cloud_projects selesai.');
