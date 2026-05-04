import { expect, test } from '@playwright/test';

test.describe('Critical Flow', () => {
  test('Login page loads with required form controls', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="teamName"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
