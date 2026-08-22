// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..');
const html = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
const sitemap = readFileSync(resolve(projectRoot, 'public/sitemap.xml'), 'utf8');

const jsonLdSource = html
  .split('<script type="application/ld+json">')[1]
  ?.split('</script>')[0];
const jsonLd = JSON.parse(jsonLdSource ?? '{}');

describe('SEO local', () => {
  it('mantém metadados públicos consistentes com o domínio oficial', () => {
    expect(html).toContain('<title>Ar-Condicionado em Blumenau | MG Climatização</title>');
    expect(html).toContain('<link rel="canonical" href="https://mgclimabnu.com.br/" />');
    expect(html).toContain('<meta name="robots" content="index, follow" />');
    expect(html).not.toContain('name="keywords"');
    expect(html).toContain('property="og:image:width" content="1536"');
    expect(html).toContain('property="og:image:height" content="1024"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('publica somente dados empresariais confirmados no Schema.org', () => {
    expect(jsonLd).toMatchObject({
      '@type': 'HVACBusiness',
      '@id': 'https://mgclimabnu.com.br/#empresa',
      name: 'MG Climatização',
      url: 'https://mgclimabnu.com.br/',
      telephone: '+5547997464218',
      sameAs: ['https://instagram.com/mgclimatizacao'],
    });
    expect(jsonLd.areaServed.map((area: { name: string }) => area.name)).toEqual([
      'Blumenau',
      'Gaspar',
      'Brusque',
      'Indaial',
      'Timbó',
      'Pomerode',
      'Penha',
      'Navegantes',
      'Balneário Camboriú',
    ]);
    jsonLd.areaServed.forEach((area: unknown) => {
      expect(area).toEqual(
        expect.objectContaining({
          '@type': 'City',
          containedInPlace: expect.objectContaining({
            '@type': 'State',
            name: 'Santa Catarina',
            containedInPlace: { '@type': 'Country', name: 'Brasil' },
          }),
        }),
      );
    });
    const services = jsonLd.hasOfferCatalog.itemListElement.map(
      (offer: { itemOffered: { name: string } }) => offer.itemOffered.name,
    );
    expect(services).toContain('Carga de fluido refrigerante');
    expect(JSON.stringify(jsonLd)).not.toMatch(/aggregateRating|priceRange|openingHours/);
  });

  it('mantém apenas a página pública no sitemap, sem data artificial', () => {
    expect(sitemap).toContain('<loc>https://mgclimabnu.com.br/</loc>');
    expect(sitemap).not.toMatch(/<loc>[^<]*(?:login|admin)/);
    expect(sitemap).not.toContain('<lastmod>');
  });
});
