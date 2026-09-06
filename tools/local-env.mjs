import fs from 'node:fs/promises';

export async function loadLocalEnv(path = '.env') {
  try {
    const lines = (await fs.readFile(path, 'utf8')).split(/\r?\n/);
    return Object.fromEntries(lines
      .filter(line => line && !line.trimStart().startsWith('#') && line.includes('='))
      .map(line => { const split = line.indexOf('='); return [line.slice(0, split).trim(), line.slice(split + 1).trim()]; })
      .filter(([, value]) => value));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}
