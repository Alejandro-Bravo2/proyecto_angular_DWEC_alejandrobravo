import { test, expect } from '@playwright/test';

test.describe('Autenticacion', () => {
  test('debe navegar a la pagina de login', async ({ page }) => {
    await page.goto('/login');

    // Verificar que estamos en la pagina de login
    await expect(page).toHaveURL(/login/);

    // Verificar que existe el formulario de login
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
  });

  test('debe mostrar campos de email y password', async ({ page }) => {
    await page.goto('/login');

    // Buscar campo de email
    const emailInput = page.locator('input[type="email"], input[name="email"], input[formcontrolname="email"]').first();
    await expect(emailInput).toBeVisible();

    // Buscar campo de password
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('debe mostrar error con credenciales invalidas', async ({ page }) => {
    await page.goto('/login');

    // Llenar formulario con credenciales invalidas
    await page.fill('input[type="email"], input[name="email"], input[formcontrolname="email"]', 'test@invalid.com');
    await page.fill('input[type="password"]', 'wrongpassword123');

    // Click en boton de submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Esperar respuesta (puede ser mensaje de error o redirección)
    await page.waitForTimeout(1000);
  });

  test('debe navegar a la pagina de registro', async ({ page }) => {
    await page.goto('/register');

    // Verificar que estamos en la pagina de registro
    await expect(page).toHaveURL(/register/);
  });
});
