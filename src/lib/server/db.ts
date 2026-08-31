import { env } from '$env/dynamic/private';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | undefined;

export function db(): NeonQueryFunction<false, false> {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL belum dikonfigurasi.');
	client ??= neon(env.DATABASE_URL);
	return client;
}
