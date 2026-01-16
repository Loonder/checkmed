import { test, expect } from '@playwright/test';

test.describe('Check-in Flow', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock Tenant Fetch using Regex
        await page.route(/.*\/rest\/v1\/tenants.*/, async route => {
            console.log('Using Regex Mock for Tenants: ' + route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'tenant-123',
                    name: 'Clínica Demo',
                    slug: 'demo-clinic',
                    status: 'active'
                })
            });
        });

        // 2. Mock Check-in Insert using Regex
        await page.route(/.*\/rest\/v1\/checkins.*/, async route => {
            console.log('Using Regex Mock for Checkins: ' + route.request().url());
            await route.fulfill({
                status: 201, // Created
                contentType: 'application/json',
                body: JSON.stringify(null)
            });
        });

    });

    test('should complete a check-in', async ({ page }) => {
        await page.goto('/check-in/demo-clinic');

        // 1. Verify Page Load
        await expect(page.getByText('Check-In Paciente')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Clínica Demo')).toBeVisible();

        // 2. Try submit empty to see validation
        await page.getByRole('button', { name: 'Confirmar Check-In' }).click();
        await expect(page.getByText('Nome é obrigatório')).toBeVisible();

        // 3. Fill Form
        await page.getByPlaceholder('Ex: João da Silva').fill('Paciente Teste');
        await page.getByPlaceholder('Descreva o que está sentindo...').fill('Dor de cabeça forte e febre.');

        // 4. Submit
        await page.getByRole('button', { name: 'Confirmar Check-In' }).click();

        // 5. Success
        await expect(page.getByText('Check-In Confirmado', { exact: false })).toBeVisible({ timeout: 10000 });
    });

});
