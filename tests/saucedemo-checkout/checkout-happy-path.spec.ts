// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

async function login(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(USERNAME);
  await page.locator('[data-test="password"]').fill(PASSWORD);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
}

test.describe('Happy Path — Checkout End-to-End', () => {

  test('TC-001: Complete checkout end-to-end', async ({ page }) => {
    await login(page);

    // Add Sauce Labs Backpack to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Navigate to cart
    await page.locator('.shopping_cart_link').click();
    await page.waitForURL('**/cart.html');
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_item_price')).toHaveText('$29.99');

    // Proceed to checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL('**/checkout-step-one.html');

    // Fill checkout information
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.waitForURL('**/checkout-step-two.html');

    // Verify overview page
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.summary_subtotal_label')).toContainText('$29.99');
    await expect(page.locator('.summary_tax_label')).toContainText('$');
    await expect(page.locator('.summary_total_label')).toContainText('$');

    // Complete the order
    await page.locator('[data-test="finish"]').click();
    await page.waitForURL('**/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');

    // Back Home — cart should be cleared
    await page.locator('[data-test="back-to-products"]').click();
    await page.waitForURL('**/inventory.html');
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('TC-002: Cart displays multiple items correctly', async ({ page }) => {
    await login(page);

    // Add two items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Navigate to cart and verify both items
    await page.locator('.shopping_cart_link').click();
    await page.waitForURL('**/cart.html');

    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    const itemNames = page.locator('.cart_item .inventory_item_name');
    const names = await itemNames.allTextContents();
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');
  });

  test('TC-003: Continue Shopping preserves cart contents', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.waitForURL('**/cart.html');

    // Click Continue Shopping
    await page.locator('[data-test="continue-shopping"]').click();
    await page.waitForURL('**/inventory.html');

    // Badge still shows 1
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('TC-011: Overview item summary matches cart', async ({ page }) => {
    await login(page);

    // Add two specific items
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Go to cart then checkout
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL('**/checkout-step-one.html');
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('90210');
    await page.locator('[data-test="continue"]').click();
    await page.waitForURL('**/checkout-step-two.html');

    // Both items must appear in overview
    const overviewItems = page.locator('.cart_item .inventory_item_name');
    const names = await overviewItems.allTextContents();
    expect(names).toContain('Sauce Labs Fleece Jacket');
    expect(names).toContain('Sauce Labs Bolt T-Shirt');
  });

  test('TC-012: Order completion shows success message', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL('**/checkout-step-one.html');
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.waitForURL('**/checkout-step-two.html');
    await page.locator('[data-test="finish"]').click();
    await page.waitForURL('**/checkout-complete.html');

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('TC-013: Cart cleared after order completion', async ({ page }) => {
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL('**/checkout-step-one.html');
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.waitForURL('**/checkout-step-two.html');
    await page.locator('[data-test="finish"]').click();
    await page.waitForURL('**/checkout-complete.html');

    await page.locator('[data-test="back-to-products"]').click();
    await page.waitForURL('**/inventory.html');

    // Cart badge should not be visible
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();

    // Navigating to cart shows empty cart
    await page.goto(`${BASE_URL}/cart.html`);
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });

});
