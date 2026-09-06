import { cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await cp(path.join(root, 'app'), path.join(root, 'dist', 'app'), { recursive: true });
await cp(path.join(root, 'config'), path.join(root, 'dist', 'config'), { recursive: true });
console.log('Static site staged in dist/.');
