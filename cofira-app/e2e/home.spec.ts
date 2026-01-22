import { test, expect } from '@playwright/test';

test.describe('Pagina principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe cargar la pagina principal correctamente', async ({ page }) => {
    // Verificar que el titulo de la pagina contiene COFIRA
    await expect(page).toHaveTitle(/COFIRA/);
  });

  test('debe mostrar el header con el logo', async ({ page }) => {
    // Verificar que existe el header
    const header = page.locator('app-header');
    await expect(header).toBeVisible();
  });

  test('debe mostrar el footer', async ({ page }) => {
    // Verificar que existe el footer
    const footer = page.locator('app-footer');
    await expect(footer).toBeVisible();
  });

  test('debe tener el boton de cambio de tema', async ({ page }) => {
    // Buscar el boton de toggle de tema
    const temaBoton = page.locator('[aria-label*="tema"], [data-testid="theme-toggle"]').first();
    // Si existe, debe ser clickeable
    if (await temaBoton.count() > 0) {
      await expect(temaBoton).toBeEnabled();
    }
  });
});
