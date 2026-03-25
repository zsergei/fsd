import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');
const envPath = resolve(repoRoot, '.env');

if (existsSync(envPath)) {
	config({ path: envPath, quiet: true });
}
