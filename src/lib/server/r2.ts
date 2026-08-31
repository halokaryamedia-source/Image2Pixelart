import { env } from '$env/dynamic/private';
import { DeleteObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

let client: S3Client | undefined;

export function r2(): S3Client {
	if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) throw new Error('Kredensial R2 belum lengkap.');
	client ??= new S3Client({
		region: env.R2_REGION || 'auto', endpoint: env.R2_ENDPOINT,
		credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }
	});
	return client;
}

export function r2Bucket(): string {
	if (!env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME belum dikonfigurasi.');
	return env.R2_BUCKET_NAME;
}

export async function headR2Object(key: string) { return r2().send(new HeadObjectCommand({ Bucket: r2Bucket(), Key: key })); }
export async function deleteR2Object(key: string) { await r2().send(new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key })); }
