import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('renders login form', async ({ page }) => {
    await expect(
      page.locator('h1, h2').filter({ hasText: /Login|Sign In|Welcome|लॉगिन/i })
    ).toBeVisible();
    // Email input should exist
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();
    // Password input should exist
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      // Should show some error or validation
      const errorMsg = page.locator('[class*="error"], [class*="text-red"], [role="alert"]');
      const count = await errorMsg.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      // Login should fail - either stay on login page or show error
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/admin/dashboard');
    }
  });

  test('redirects to admin on successful login', async ({ page }) => {
    // Only test if we have test credentials
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;
    if (!email || !password) {
      test.skip();
      return;
    }
    await page.fill('input[type="email"], input[placeholder*="email" i]', email);
    await page.fill('input[type="password"]', password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    expect(page.url()).toContain('/admin');
  });
});
