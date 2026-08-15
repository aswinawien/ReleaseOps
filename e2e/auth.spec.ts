import { test, expect } from '@playwright/test';

test('login page is reachable and labeled', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible();
});

test('signup page explains workspace creation', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create a workspace' })).toBeVisible();
});
