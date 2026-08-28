// @vitest-environment node
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..');
const html = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(projectRoot, 'public/manifest.json'), 'utf8'));

const expectedAssets = [
  { src: '/icons/icon-192.png', width: 192, height: 192, purpose: 'any' },
  { src: '/icons/icon-512.png', width: 512, height: 512, purpose: 'any' },
  { src: '/icons/icon-maskable-512.png', width: 512, height: 512, purpose: 'maskable' },
] as const;

describe('PWA e compartilhamento social', () => {
  it('usa a imagem social PNG dedicada em Open Graph e Twitter', async () => {
    expect(html).toContain('property="og:image" content="https://mgclimabnu.com.br/og-image.png"');
    expect(html).toContain('property="og:image:type" content="image/png"');
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
    expect(html).toContain('name="twitter:image" content="https://mgclimabnu.com.br/og-image.png"');
    expect(html).not.toMatch(/(?:og:image|twitter:image)[^>]+identidade-visual-principal\.jpg/);

    const socialImage = resolve(projectRoot, 'public/og-image.png');
    const metadata = await sharp(socialImage).metadata();
    expect(metadata).toMatchObject({ format: 'png', width: 1200, height: 630 });
    expect(statSync(socialImage).size).toBeLessThan(500_000);
  });

  it('usa o favicon e o Apple Touch Icon dedicados', () => {
    expect(html).toContain('rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png"');
    expect(html).toContain('rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"');
    expect(html).not.toMatch(/apple-touch-icon[^>]+brand\/logo-192\.webp/);
  });

  it('declara ícones PWA existentes, PNG e nas dimensões corretas', async () => {
    expect(manifest.icons).toEqual(expectedAssets.map(({ src, width, height, purpose }) => ({
      src,
      sizes: `${width}x${height}`,
      type: 'image/png',
      purpose,
    })));

    for (const asset of expectedAssets) {
      const assetPath = resolve(projectRoot, `public${asset.src}`);
      const metadata = await sharp(assetPath).metadata();
      expect(metadata).toMatchObject({ format: 'png', width: asset.width, height: asset.height });
      expect(statSync(assetPath).size).toBeGreaterThan(0);
      expect(statSync(assetPath).size).toBeLessThan(500_000);
    }

    const appleIcon = resolve(projectRoot, 'public/icons/apple-touch-icon.png');
    expect(await sharp(appleIcon).metadata()).toMatchObject({ format: 'png', width: 180, height: 180 });
  });
});
