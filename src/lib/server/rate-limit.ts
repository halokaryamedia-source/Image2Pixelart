import { env } from '$env/dynamic/private';
import { createHmac } from 'node:crypto';
import { db } from './db';
import { ApiError } from './http';

function opaque(value: string): string {
	const pepper = env.DEVICE_TOKEN_PEPPER || 'development-rate-limit';
	return createHmac('sha256', pepper).update(value).digest('hex').slice(0, 32);
}

export async function enforceRateLimit(scope: string, identity: string, limit: number, windowSeconds: number): Promise<void> {
	const nowSeconds = Math.floor(Date.now() / 1000);
	const bucketSeconds = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
	const bucket = new Date(bucketSeconds * 1000).toISOString();
	const expires = new Date((bucketSeconds + windowSeconds * 2) * 1000).toISOString();
	const key = `${scope}:${opaque(identity)}`;
	const rows = await db().query(
		`INSERT INTO rate_limit_buckets (scope_key, bucket_start, request_count, expires_at)
		 VALUES ($1, $2::timestamptz, 1, $3::timestamptz)
		 ON CONFLICT (scope_key, bucket_start) DO UPDATE
		 SET request_count = rate_limit_buckets.request_count + 1
		 WHERE rate_limit_buckets.request_count < $4
		 RETURNING request_count`,
		[key, bucket, expires, limit]
	);
	if (!rows.length) throw new ApiError(429, 'Terlalu banyak permintaan. Coba lagi nanti.');
}
