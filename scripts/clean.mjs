import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Vite recreates dist on every build. No user-supplied paths are accepted.
if (process.argv.length > 2) throw new Error('clean does not accept arguments.');
const buildDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
await rm(buildDirectory, { recursive: true, force: true });
process.stdout.write('Removed generated dist directory.\n');
