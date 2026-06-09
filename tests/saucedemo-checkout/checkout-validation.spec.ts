// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

async function loginAndReachCheckoutStepOne(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.waitForURL('**/cart.html');
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');
}

test.describe('Checkout Form Validation', () => {

  test('TC-005: Checkout info form fields and buttons are visible', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
    await expect(page.locator('[data-test="continue"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
  });

  test('TC-006: Empty First Name shows required error', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    // Using selector discovered in Step 3 exploratory testing
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('TC-007: Empty Last Name shows required error', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('TC-008: Empty Postal Code shows required error', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('TC-004: Valid checkout information proceeds to overview', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('90210');
    await page.locator('[data-test="continue"]').click();

    await page.waitForURL('**/checkout-step-two.html');
    await expect(page.locator('.inventory_item_name')).toBeVisible();
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toBeVisible();
  });

  test('TC-014: Special characters in name fields — no crash', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await page.locator('[data-test="firstName"]').fill('J@ne<>');
    await page.locator('[data-test="lastName"]').fill('D"oe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // Accept gracefully or show validation — no crash or uncaught error
    const url = page.url();
    const onStepOne = url.includes('checkout-step-one');
    const onStepTwo = url.includes('checkout-step-two');
    expect(onStepOne || onStepTwo).toBeTruthy();

    if (onStepTwo) {
      // If it proceeded, verify no script injection
      const content = await page.content();
      expect(content).not.toContain('<script>alert');
    }
  });

  test('TC-015: Numeric-only values in name fields — handled gracefully', async ({ page }) => {
    await loginAndReachCheckoutStepOne(page);

    await page.locator('[data-test="firstName"]').fill('12345');
    await page.locator('[data-test="lastName"]').fill('67890');
    await page.locator('[data-test="postalCode"]').fill('00000');
    await page.locator('[data-test="continue"]').click();

    // Should either proceed or show an error — no crash
    const url = page.url();
    expect(url.includes('checkout-step-one') || url.includes('checkout-step-two')).toBeTruthy();
  });

});
