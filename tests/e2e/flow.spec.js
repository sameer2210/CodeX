import { expect, test } from '@playwright/test';

test.describe('Critical Flow', () => {
    test('User can login and create a project', async ({ page }) => {
        // 1. Login
        await page.goto('/login');

        await page.fill('input[name="username"]', 'E2EUser');
        await page.fill('input[name="teamName"]', 'E2ETeam');
        await page.fill('input[name="password"]', 'password123'); // Assuming registration is handled or mocked, but in E2E we might need to register first if not persistent.

        // For a real E2E, we might need to seed the DB or use a register flow.
        // Let's assume we try to register first.
        await page.goto('/register');
        await page.fill('input[name="username"]', 'E2EUser_' + Date.now());
        await page.fill('input[name="teamName"]', 'E2ETeam_' + Date.now());
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/dashboard/);

        // 2. Create Project
        await page.click('text=Create Project'); // Adjust selector based on UI
        // Assuming there is a modal or a new page
        // Wait for inputs
        // await page.fill('input[name="projectName"]', 'My E2E Project');
        // await page.click('button:has-text("Create")');

        // 3. Verify Project
        // await expect(page.locator('text=My E2E Project')).toBeVisible();
    });
});
