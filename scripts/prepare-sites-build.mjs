import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(resolve(dist, 'client'), { recursive: true });
mkdirSync(resolve(dist, 'server'), { recursive: true });
cpSync(resolve(root, 'build'), resolve(dist, 'client'), { recursive: true });
cpSync(resolve(root, 'hosting/worker.js'), resolve(dist, 'server/index.js'));
