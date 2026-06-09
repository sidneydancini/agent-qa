// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

async function loginAndAddItem(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
}

async function reachStepTwo(page: any) {
  await loginAndAddItem(page);
  await page.locator('.shopping_cart_link').click();
  await page.waitForURL('**/cart.html');
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  await page.waitForURL('**/checkout-step-two.html');
}

test.describe('Checkout Navigation Flow', () => {

  test('TC-009: Overview shows accurate price breakdown', async ({ page }) => {
    await reachStepTwo(page);

    const subtotalText = await page.locator('.summary_subtotal_label').textContent();
    const taxText = await page.locator('.summary_tax_label').textContent();
    const totalText = await page.locator('.summary_total_label').textContent();

    // Using selector discovered in Step 3: subtotal="Item total: $29.99", tax="Tax: $2.40", total="Total: $32.39"
    expect(subtotalText).toContain('$29.99');
    expect(taxText).toMatch(/Tax: \$\d+\.\d{2}/);

    const subtotalVal = parseFloat(subtotalText!.replace(/[^0-9.]/g, ''));
    const taxVal = parseFloat(taxText!.replace(/[^0-9.]/g, ''));
    const totalVal = parseFloat(totalText!.replace(/[^0-9.]/g, ''));

    expect(taxVal).toBeGreaterThan(0);
    expect(Math.abs(totalVal - (subtotalVal + taxVal))).toBeLessThan(0.01);
  });

  test('TC-010: Cancel on overview returns to products with cart intact', async ({ page }) => {
    await reachStepTwo(page);

    // Using selector discovered in Step 3 exploratory testing
    await page.locator('[data-test="cancel"]').click();
    await page.waitForURL('**/inventory.html');

    // Cart badge still present
    await expect(page.locator('.shopping_cart_badge')).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('TC-016: Unauthenticated access to protected routes redirects to login', async ({ page }) => {
    // Direct URL access to checkout-step-one without session — discovered in EXPLORE-09
    await page.goto(`${BASE_URL}/checkout-step-one.html`);
    await expect(page).toHaveURL(BASE_URL + '/');

    // Direct URL access to cart without session
    await page.goto(`${BASE_URL}/cart.html`);
    await expect(page).toHaveURL(BASE_URL + '/');
  });

  test('TC-017: Cancel from checkout step one returns to cart', async ({ page }) => {
    await loginAndAddItem(page);
    await page.locator('.shopping_cart_link').click();
    await page.waitForURL('**/cart.html');
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL('**/checkout-step-one.html');

    // Cancel returns to cart — confirmed by EXPLORE-10
    await page.locator('[data-test="cancel"]').click();
    await page.waitForURL('**/cart.html');
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
  });

});
