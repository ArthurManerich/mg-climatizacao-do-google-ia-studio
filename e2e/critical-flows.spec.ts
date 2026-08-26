import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const mockSupabase = async (page: Page) => {
  await page.route('https://e2e-project.supabase.co/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null, session: null }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
};

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('loads the public page, manifest and primary brand asset', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const manifest = await request.get('/manifest.json');
  expect(manifest.ok()).toBeTruthy();
  const icon = await request.get('/icons/icon-192.png');
  expect(icon.ok()).toBeTruthy();
  const logo = await request.get('/brand/logo-principal.jpg');
  expect(logo.ok()).toBeTruthy();
});

test('mobile navigation opens, closes and follows an anchor', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/');
  const openMenu = page.getByRole('button', { name: 'Abrir menu de navegação' });
  await openMenu.click();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Navegação mobile' }).getByRole('link', { name: 'Serviços' }).click();
  await expect(page.locator('#servicos')).toBeInViewport();
  await expect(openMenu).toBeVisible();
});

test('completes the simulator and creates a WhatsApp URL without opening external communication', async ({ page }) => {
  await page.addInitScript(() => {
    window.open = ((url?: string | URL) => {
      document.documentElement.dataset.openedUrl = String(url ?? '');
      return null;
    }) as typeof window.open;
  });
  await page.goto('/#orcamento-online');
  await page.locator('#orcamento-online').getByRole('button', { name: /Instalação/ }).click();
  await page.locator('#orcamento-online').getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Tipo ou capacidade do equipamento').selectOption('nao-sei');
  await page.getByLabel('Problema ou necessidade').fill('Preciso avaliar uma instalação.');
  await page.locator('#orcamento-online').getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Tipo de imóvel').selectOption('casa');
  await page.getByLabel('Cidade').fill('Blumenau');
  await page.getByLabel('Endereço do serviço').fill('Rua de teste, 100');
  await page.locator('#orcamento-online').getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Nome completo').fill('Cliente Teste');
  await page.locator('#orcamento-online').getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Enviar pelo WhatsApp' }).click();

  const openedUrl = await page.locator('html').getAttribute('data-opened-url');
  expect(openedUrl).toContain('https://wa.me/5547997464218');
  expect(decodeURIComponent(openedUrl ?? '')).toContain('Cliente Teste');
  expect(decodeURIComponent(openedUrl ?? '')).not.toMatch(/preço estimado|R\$\s*\d/i);
});

test('direct login and protected admin routes use the SPA fallback', async ({ page, request }) => {
  const loginResponse = await request.get('/login');
  expect(loginResponse.status()).toBe(200);
  expect(loginResponse.headers()['content-security-policy']).toContain("frame-ancestors 'none'");

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'MG Climatização' })).toBeVisible();

  const adminResponse = await request.get('/admin');
  expect(adminResponse.status()).toBe(200);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});

test('shows remote loading failures without exposing raw backend errors', async ({ page }) => {
  await page.unroute('https://e2e-project.supabase.co/**');
  await page.route('https://e2e-project.supabase.co/**', (route) => route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'mocked backend failure' }),
  }));
  await page.goto('/');
  await expect(page.getByText(/Não foi possível carregar|Erro ao carregar os dados/).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).not.toContainText('e2e-project.supabase.co');
});

test('has no serious or critical automated accessibility violations on public and login pages', async ({ page }) => {
  for (const path of ['/', '/login']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blockingViolations, `${path}: ${JSON.stringify(blockingViolations, null, 2)}`).toEqual([]);
  }
});
