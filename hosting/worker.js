async function assetResponse(request, env) {
	if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
		return new Response('Static assets binding is unavailable.', { status: 503 });
	}
	const response = await env.ASSETS.fetch(request);
	if (response.status !== 404 || request.method !== 'GET') return response;
	const fallbackUrl = new URL('/200.html', request.url);
	return env.ASSETS.fetch(new Request(fallbackUrl, request));
}

export default {
	async fetch(request, env) {
		return assetResponse(request, env);
	}
};
