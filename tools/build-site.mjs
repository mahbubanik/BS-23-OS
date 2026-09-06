import { cp, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await cp(path.join(root, 'app'), path.join(root, 'dist', 'app'), { recursive: true });
await mkdir(path.join(root, 'dist', 'config'), { recursive: true });
await cp(path.join(root, 'config', 'icp-scoring.json'), path.join(root, 'dist', 'config', 'icp-scoring.json'));
await cp(path.join(root, 'config', 'bs23-campaign-icp.json'), path.join(root, 'dist', 'config', 'bs23-campaign-icp.json'));
console.log('Static site staged in dist/.');
