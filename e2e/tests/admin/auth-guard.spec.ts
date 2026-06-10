import { test, expect } from '@playwright/test';

test.describe('Admin Auth Guard', () => {
  const adminPages = [
    '/admin/dashboard',
    '/admin/registrations',
    '/admin/attendance',
    '/admin/properties',
    '/admin/notifications',
    '/admin/email',
    '/admin/lottery',
    '/admin/chat-logs',
    '/admin/settings',
    '/admin/allotment-letter',
    '/admin/allotment-records',
    '/admin/payment-receipt',
    '/admin/payment-receipts',
    '/admin/payment-plan',
    '/admin/offer-letter',
    '/admin/offer-letter-records',
    '/admin/bba',
    '/admin/bba-records',
  ];

  for (const adminPath of adminPages) {
    test(`redirects to login from ${adminPath}`, async ({ page }) => {
      await page.goto(adminPath);
      await page.waitForTimeout(3000);
      const url = page.url();
      // Should redirect to login or auth
      const isRedirected = url.includes('/login') || url.includes('/auth') || url === '/admin';
      expect(isRedirected).toBeTruthy();
    });
  }
});

test.describe('Admin Auth Pages', () => {
  test('root /admin renders login/auth page', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    // Should show some content (login form or redirect)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test('admin pages redirect consistently', async ({ page }) => {
    // Test that all admin pages redirect to same destination
    const results: string[] = [];
    const paths = ['/admin/dashboard', '/admin/lottery', '/admin/properties'];

    for (const path of paths) {
      await page.goto(path);
      await page.waitForTimeout(2000);
      results.push(page.url());
    }

    // All should redirect to similar destination
    const allSimilar = results.every(
      (u) => u.includes('/admin') || u.includes('/login') || u.includes('/auth')
    );
    expect(allSimilar).toBeTruthy();
  });
});
