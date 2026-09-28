import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

test('production demo bundle has no external Unsplash image dependency', () => {
  const assetsDir = path.join(repoRoot, 'dist', 'assets');
  const bundle = fs.readdirSync(assetsDir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8'))
    .join('\n');

  assert.equal(bundle.includes('images.unsplash.com'), false);
});

test('offline demo images are packaged in the public directory', () => {
  for (const image of ['scene-greenhouse.jpg', 'scene-home.jpg', 'scene-farm.jpg', 'ai-answers/mqtt-smart-greenhouse.png']) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'public', 'images', image)), true, image);
  }
});
