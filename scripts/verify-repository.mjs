#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const fail = (message) => errors.push(message);
const repoPath = (rel) => resolve(ROOT, rel);
const read = (rel) => readFileSync(repoPath(rel), 'utf8');

const REQUIRED_PATHS = [
	'AGENTS.md', 'GITHUB_RULES.md', 'CONTEXT.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'README.md',
	'.editorconfig', '.gitattributes', '.gitignore', '.env.example',
	'.github/CODEOWNERS', '.github/PULL_REQUEST_TEMPLATE.md',
	'.github/workflows/repository-verify.yml', '.github/workflows/application-verify.yml',
	'docs/README.md', 'docs/foundation/README.md', 'docs/foundation/00-product-boundaries.md',
	'docs/foundation/01-system-architecture.md', 'docs/foundation/02-image-grid-contract.md',
	'docs/foundation/03-cloud-collaboration-contract.md', 'docs/foundation/04-deployment-operations.md',
	'docs/knowledge/README.md', 'docs/knowledge/next-action.md', 'docs/knowledge/ownership.md',
	'docs/knowledge/implementation-map.md', 'docs/knowledge/current-validation.md',
	'docs/knowledge/decisions/README.md', 'docs/knowledge/decisions/recording-policy.md',
	'docs/knowledge/operations/cloud-smoke.md', 'package.json', 'package-lock.json',
	'realtime/.dev.vars.example', 'realtime/wrangler.jsonc', 'scripts/verify-repository.mjs'
];

const CANONICAL_SKILLS = [
	'browser-runtime-validation', 'cloud-development-validation', 'development-brief',
	'svelte-development-validation', 'web-accessibility-validation', 'web-ui-design-development'
];

const REQUIRED_AGENT_HEADINGS = [
	'## Branch policy boundary', '### Observe / recover context', '## Execution context', '## Work modes',
	'## Execution channel', '## Product boundaries', '## Completion'
];

const REQUIRED_PACKAGE_SCRIPTS = ['verify:repository', 'check', 'check:realtime', 'test', 'build', 'verify:application'];
const BUILTIN_ENV = new Set(['NODE_ENV']);

function walk(root, predicate = () => true) {
	if (!existsSync(root)) return [];
	const results = [];
	for (const entry of readdirSync(root)) {
		const current = resolve(root, entry);
		const stats = statSync(current);
		if (stats.isDirectory()) results.push(...walk(current, predicate));
		else if (predicate(current)) results.push(current);
	}
	return results;
}

function checkRequiredPaths() {
	for (const rel of REQUIRED_PATHS) if (!existsSync(repoPath(rel))) fail(`missing required repository owner: ${rel}`);
	for (const skill of CANONICAL_SKILLS) {
		if (!existsSync(repoPath(`.agents/skills/${skill}/SKILL.md`))) fail(`missing canonical skill: ${skill}`);
	}
}

function checkSkillSet() {
	const root = repoPath('.agents/skills');
	if (!existsSync(root)) return;
	const actual = readdirSync(root).filter((name) => statSync(resolve(root, name)).isDirectory() && !name.startsWith('.')).sort();
	const expected = [...CANONICAL_SKILLS].sort();
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		fail(`canonical skill set drift: expected ${expected.join(', ')}, got ${actual.join(', ')}`);
	}
}

function checkAgentContract() {
	if (!existsSync(repoPath('AGENTS.md'))) return;
	const text = read('AGENTS.md');
	for (const heading of REQUIRED_AGENT_HEADINGS) if (!text.includes(heading)) fail(`AGENTS.md missing required section: ${heading}`);
}

function checkNextAction() {
	if (!existsSync(repoPath('docs/knowledge/next-action.md'))) return;
	const text = read('docs/knowledge/next-action.md');
	if ((text.match(/^## Next Step$/gm) || []).length !== 1) fail("next-action.md must contain exactly one '## Next Step'");
	for (const heading of ['## Current Status', '## Active Boundary']) if (!text.includes(heading)) fail(`next-action.md missing '${heading}'`);
}

function trackedFiles() {
	try {
		return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
	} catch {
		fail('git ls-files unavailable; repository verifier requires a Git worktree');
		return [];
	}
}

function checkTrackedHygiene() {
	for (const file of trackedFiles()) {
		if (file === '.env.example' || file === '.env.test' || file === 'realtime/.dev.vars.example') continue;
		if (/(^|\/)\.env($|\.)/.test(file)) fail(`forbidden private env path is tracked: ${file}`);
		if (/(^|\/)\.dev\.vars$/.test(file)) fail(`forbidden Worker secret file is tracked: ${file}`);
		if (/(^|\/)(node_modules|\.svelte-kit|\.vercel|\.wrangler|build|dist|output|coverage|tmp)(\/|$)/.test(file)) fail(`forbidden generated path is tracked: ${file}`);
	}
}

function parseEnvExample(rel) {
	if (!existsSync(repoPath(rel))) return new Set();
	const keys = new Set();
	for (const raw of read(rel).split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const match = /^([A-Z][A-Z0-9_]*)=/.exec(line);
		if (match) keys.add(match[1]);
	}
	return keys;
}

function usedRootEnvKeys() {
	const keys = new Set();
	for (const relRoot of ['src', 'scripts']) {
		for (const file of walk(repoPath(relRoot), (item) => /\.(?:ts|js|mjs|svelte)$/.test(item))) {
			const text = readFileSync(file, 'utf8');
			for (const match of text.matchAll(/\bprocess\.env\.([A-Z][A-Z0-9_]*)/g)) keys.add(match[1]);
			if (text.includes('$env/dynamic/private')) {
				for (const match of text.matchAll(/\benv\.([A-Z][A-Z0-9_]*)/g)) keys.add(match[1]);
			}
		}
	}
	for (const key of BUILTIN_ENV) keys.delete(key);
	return keys;
}

function checkEnvironmentContract() {
	const documented = parseEnvExample('.env.example');
	for (const key of usedRootEnvKeys()) if (!documented.has(key)) fail(`environment variable used by source/scripts but missing from .env.example: ${key}`);

	const workerExample = parseEnvExample('realtime/.dev.vars.example');
	for (const key of ['REALTIME_TOKEN_SECRET', 'REALTIME_INTERNAL_SECRET']) {
		if (!workerExample.has(key)) fail(`Worker secret missing from realtime/.dev.vars.example: ${key}`);
	}

	if (existsSync(repoPath('realtime/wrangler.jsonc'))) {
		const wrangler = read('realtime/wrangler.jsonc');
		for (const marker of ['PROJECT_ROOMS', 'ALLOWED_ORIGINS']) if (!wrangler.includes(marker)) fail(`realtime/wrangler.jsonc missing required Worker binding/config: ${marker}`);
	}

	const gitignore = read('.gitignore');
	if (!gitignore.includes('!.env.example')) fail('.gitignore must allow .env.example');
	if (/^\s*\.env\*\s*$/m.test(gitignore)) fail(".gitignore contains broad '.env*' that can re-ignore .env.example");
}

function checkPackageContract() {
	let pkg;
	try { pkg = JSON.parse(read('package.json')); }
	catch (error) { fail(`package.json is invalid JSON: ${error.message}`); return; }
	if (pkg.engines?.node !== '>=22.12.0') fail("package.json engines.node must remain '>=22.12.0' unless intentionally changed with repository docs");
	for (const script of REQUIRED_PACKAGE_SCRIPTS) if (!pkg.scripts?.[script]) fail(`package.json missing required script: ${script}`);
	if (!existsSync(repoPath('package-lock.json'))) fail('package-lock.json is required for locked npm installs');
}

function checkPublicSecretNames() {
	for (const relRoot of ['src', 'scripts', 'realtime']) {
		for (const file of walk(repoPath(relRoot), (item) => /\.(?:ts|js|mjs|svelte|json|jsonc)$/.test(item))) {
			const text = readFileSync(file, 'utf8');
			const match = text.match(/\bPUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE|ACCESS_KEY|DATABASE)[A-Z0-9_]*/);
			if (match) fail(`potential secret-designated PUBLIC_* variable in ${relative(ROOT, file)}: ${match[0]}`);
		}
	}
}

const LINK_RE = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;

function markdownFiles() {
	const direct = ['README.md', 'AGENTS.md', 'GITHUB_RULES.md', 'CONTEXT.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md'];
	const result = direct.filter((rel) => existsSync(repoPath(rel))).map((rel) => repoPath(rel));
	for (const root of ['.agents/skills', 'docs/foundation', 'docs/knowledge']) result.push(...walk(repoPath(root), (item) => item.endsWith('.md')));
	return [...new Set(result)];
}

function checkMarkdownLinks() {
	for (const file of markdownFiles()) {
		const text = readFileSync(file, 'utf8');
		for (const match of text.matchAll(LINK_RE)) {
			let target = match[1].trim().replace(/^<|>$/g, '');
			if (!target || target.startsWith('#') || /^[a-z]+:/i.test(target) || target.includes('://')) continue;
			target = decodeURIComponent(target.split('#', 1)[0].split('?', 1)[0]).trim();
			if (!target) continue;
			const resolved = target.startsWith('/') ? repoPath(target.slice(1)) : resolve(dirname(file), target);
			if (!existsSync(resolved)) fail(`broken relative Markdown link in ${relative(ROOT, file)}: ${match[1]}`);
		}
	}
}

function main() {
	checkRequiredPaths();
	checkSkillSet();
	checkAgentContract();
	checkNextAction();
	checkTrackedHygiene();
	checkEnvironmentContract();
	checkPackageContract();
	checkPublicSecretNames();
	checkMarkdownLinks();

	if (errors.length) {
		console.error('REPOSITORY VERIFY FAILED');
		for (const error of errors) console.error(`- ${error}`);
		process.exitCode = 1;
		return;
	}

	console.log('REPOSITORY VERIFY PASSED');
	console.log(`- required owners: ${REQUIRED_PATHS.length}`);
	console.log(`- canonical skills: ${CANONICAL_SKILLS.join(', ')}`);
	console.log('- branch lifecycle/rulesets: intentionally external/deferred');
	console.log('- tracked generated/private paths: clean');
	console.log('- env source/template contract: aligned');
	console.log('- root agent contract: present');
	console.log('- package scripts/Node contract: aligned');
	console.log('- relative governance links: valid');
}

main();
