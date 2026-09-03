// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(resolve(__dirname, '../supabase_schema.sql'), 'utf8');

describe('schema local do Supabase', () => {
  it('não inclui seeds comerciais de serviços, FAQ ou preços', () => {
    expect(schema).not.toMatch(/INSERT\s+INTO\s+public\.services\b/i);
    expect(schema).not.toMatch(/INSERT\s+INTO\s+public\.faq\b/i);
    expect(schema).not.toMatch(/budget_prices/i);
  });

  it('impede a reintrodução de alegações comerciais não confirmadas', () => {
    expect(schema).not.toMatch(/bactericida|elimina(?:ção|r) de fungos|R-410A|R-32|capacitores e placas|garantia de 1 ano|redução (?:garantida )?do consumo/i);
  });
});
