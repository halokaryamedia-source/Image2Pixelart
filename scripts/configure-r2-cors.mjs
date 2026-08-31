for (const key of ['CLOUDFLARE_API_TOKEN', 'R2_ACCOUNT_ID', 'R2_BUCKET_NAME']) if (!process.env[key]) throw new Error(`${key} wajib tersedia.`);
const origins = (process.env.R2_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((value) => value.trim()).filter(Boolean);
const accountId = encodeURIComponent(process.env.R2_ACCOUNT_ID);
const bucketName = encodeURIComponent(process.env.R2_BUCKET_NAME);
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`, {
	method: 'PUT',
	headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' },
	body: JSON.stringify({ rules: [{ id: 'mivubi-browser-upload', allowed: { origins, methods: ['GET', 'PUT', 'HEAD'], headers: ['Content-Type'] }, exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }] })
});
if (!response.ok) {
	const error = await response.text();
	throw new Error(`Cloudflare menolak konfigurasi CORS (${response.status}): ${error}`);
}
console.log(`CORS R2 aktif untuk ${origins.join(', ')}.`);
