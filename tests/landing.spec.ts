import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/CheckMed/);
});

test('has login link', async ({ page }) => {
    await page.goto('/');

    // Check if there is a link to login
    // Assuming there is a "Entrar" or "Login" button/link
    const loginLink = page.getByRole('link', { name: /Entrar/i });
    // Or maybe valid text on the page
    await expect(page.getByText('CheckMed')).toBeVisible();
});
