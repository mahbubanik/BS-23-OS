import { cp, rm, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await cp(path.join(root, 'app'), path.join(root, 'dist', 'app'), { recursive: true });
await mkdir(path.join(root, 'dist', 'config'), { recursive: true });
await cp(path.join(root, 'config', 'icp-scoring.json'), path.join(root, 'dist', 'config', 'icp-scoring.json'));
await cp(path.join(root, 'config', 'bs23-campaign-icp.json'), path.join(root, 'dist', 'config', 'bs23-campaign-icp.json'));

const rootRedirect = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=app/">
  <title>BS23 Sales OS</title>
</head>
<body>
  <p>Loading BS23 Sales OS... <a href="app/">Click here if not redirected</a>.</p>
</body>
</html>`;
await writeFile(path.join(root, 'dist', 'index.html'), rootRedirect, 'utf8');
console.log('Static site staged in dist/.');
