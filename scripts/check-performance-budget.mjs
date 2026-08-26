import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const limits = [
  { directory: 'dist/assets', extension: '.js', maxBytes: 250 * 1024, label: 'JavaScript chunk' },
  { directory: 'dist/assets', extension: '.css', maxBytes: 80 * 1024, label: 'CSS asset' },
];

const failures = [];

for (const limit of limits) {
  const files = await readdir(resolve(limit.directory));
  for (const file of files.filter((name) => name.endsWith(limit.extension))) {
    const size = (await stat(resolve(limit.directory, file))).size;
    if (size > limit.maxBytes) {
      failures.push(`${limit.label} ${file}: ${size} bytes (limit ${limit.maxBytes})`);
    }
  }
}

const heroPath = resolve('dist/brand/referencias/camisa-uniforme-mg-v2.webp');
const heroSize = (await stat(heroPath)).size;
if (heroSize > 100 * 1024) {
  failures.push(`Hero image: ${heroSize} bytes (limit ${100 * 1024})`);
}

if (failures.length) {
  process.stderr.write(`Performance budget exceeded:\n${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Performance budget passed.\n');
}
