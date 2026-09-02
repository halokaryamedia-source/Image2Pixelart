import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

let password = process.argv[2] || process.env.ADMIN_PASSWORD || '';
if (!password) {
	const prompt = createInterface({ input: process.stdin, output: process.stdout });
	password = await prompt.question('Password Admin: ');
	prompt.close();
}

if (password.length < 10) {
	console.error('Password Admin minimal 10 karakter.');
	process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`);
