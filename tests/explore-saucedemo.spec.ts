import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.saucedemo.com';
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';
const SS_DIR = path.join(__dirname, '../test-results/screenshots');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

async function login(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(USERNAME);
  await page.locator('[data-test="password"]').fill(PASSWORD);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
}

test.use({ headless: true });

test('EXPLORE-01: Login page selectors', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.screenshot({ path: `${SS_DIR}/01-login-page.png` });

  const username = page.locator('[data-test="username"]');
  const password = page.locator('[data-test="password"]');
  const loginBtn = page.locator('[data-test="login-button"]');

  await expect(username).toBeVisible();
  await expect(password).toBeVisible();
  await expect(loginBtn).toBeVisible();

  console.log('LOGIN SELECTORS:');
  console.log('  username: [data-test="username"]');
  console.log('  password: [data-test="password"]');
  console.log('  login-button: [data-test="login-button"]');
});

test('EXPLORE-02: Login success + inventory page selectors', async ({ page }) => {
  await login(page);
  await page.screenshot({ path: `${SS_DIR}/02-inventory-page.png` });

  const cartLink = page.locator('.shopping_cart_link');
  const items = page.locator('.inventory_item');
  const addToCartBtns = page.locator('[data-test^="add-to-cart"]');

  await expect(cartLink).toBeVisible();
  const itemCount = await items.count();
  const btnCount = await addToCartBtns.count();

  const firstItemName = await page.locator('.inventory_item_name').first().textContent();
  const firstItemPrice = await page.locator('.inventory_item_price').first().textContent();
  const firstItemAddBtn = await addToCartBtns.first().getAttribute('data-test');

  console.log('INVENTORY SELECTORS:');
  console.log(`  cart link: .shopping_cart_link`);
  console.log(`  inventory items: .inventory_item (count=${itemCount})`);
  console.log(`  add-to-cart buttons: [data-test^="add-to-cart"] (count=${btnCount})`);
  console.log(`  first item name: "${firstItemName}" | selector: .inventory_item_name`);
  console.log(`  first item price: "${firstItemPrice}" | selector: .inventory_item_price`);
  console.log(`  first add-to-cart data-test: "${firstItemAddBtn}"`);
});

test('EXPLORE-03: Add item and cart badge', async ({ page }) => {
  await login(page);

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  const badge = page.locator('.shopping_cart_badge');
  await expect(badge).toBeVisible();
  const badgeText = await badge.textContent();

  await page.screenshot({ path: `${SS_DIR}/03-cart-badge.png` });
  console.log(`CART BADGE SELECTOR: .shopping_cart_badge | value="${badgeText}"`);
});

test('EXPLORE-04: Cart page selectors', async ({ page }) => {
  await login(page);

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.waitForURL('**/cart.html');
  await page.screenshot({ path: `${SS_DIR}/04-cart-page.png` });

  const cartItems = page.locator('.cart_item');
  const itemName = page.locator('.inventory_item_name').first();
  const itemDesc = page.locator('.inventory_item_desc').first();
  const itemPrice = page.locator('.inventory_item_price').first();
  const checkoutBtn = page.locator('[data-test="checkout"]');
  const continueShoppingBtn = page.locator('[data-test="continue-shopping"]');

  const count = await cartItems.count();
  const name = await itemName.textContent();
  const price = await itemPrice.textContent();

  await expect(checkoutBtn).toBeVisible();
  await expect(continueShoppingBtn).toBeVisible();

  console.log('CART PAGE SELECTORS:');
  console.log(`  cart items: .cart_item (count=${count})`);
  console.log(`  item name: .inventory_item_name | value="${name}"`);
  console.log(`  item price: .inventory_item_price | value="${price}"`);
  console.log(`  checkout btn: [data-test="checkout"]`);
  console.log(`  continue-shopping btn: [data-test="continue-shopping"]`);
});

test('EXPLORE-05: Checkout step one selectors', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');
  await page.screenshot({ path: `${SS_DIR}/05-checkout-step-one.png` });

  const firstName = page.locator('[data-test="firstName"]');
  const lastName = page.locator('[data-test="lastName"]');
  const postalCode = page.locator('[data-test="postalCode"]');
  const continueBtn = page.locator('[data-test="continue"]');
  const cancelBtn = page.locator('[data-test="cancel"]');

  await expect(firstName).toBeVisible();
  await expect(lastName).toBeVisible();
  await expect(postalCode).toBeVisible();
  await expect(continueBtn).toBeVisible();
  await expect(cancelBtn).toBeVisible();

  console.log('CHECKOUT STEP ONE SELECTORS:');
  console.log('  firstName: [data-test="firstName"]');
  console.log('  lastName: [data-test="lastName"]');
  console.log('  postalCode: [data-test="postalCode"]');
  console.log('  continue btn: [data-test="continue"]');
  console.log('  cancel btn: [data-test="cancel"]');
});

test('EXPLORE-06: Checkout step one error messages', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');

  // Empty submit
  await page.locator('[data-test="continue"]').click();
  const errorEl = page.locator('[data-test="error"]');
  await expect(errorEl).toBeVisible();
  const emptyError = await errorEl.textContent();
  await page.screenshot({ path: `${SS_DIR}/06a-error-firstname-empty.png` });

  // Fill first name only
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="continue"]').click();
  const lastNameError = await errorEl.textContent();
  await page.screenshot({ path: `${SS_DIR}/06b-error-lastname-empty.png` });

  // Fill first and last, leave zip empty
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="continue"]').click();
  const zipError = await errorEl.textContent();
  await page.screenshot({ path: `${SS_DIR}/06c-error-zip-empty.png` });

  console.log('ERROR MESSAGES:');
  console.log(`  all empty: "${emptyError}"`);
  console.log(`  missing last name: "${lastNameError}"`);
  console.log(`  missing zip: "${zipError}"`);
  console.log('  error selector: [data-test="error"]');
});

test('EXPLORE-07: Checkout step two selectors', async ({ page }) => {
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
  await page.screenshot({ path: `${SS_DIR}/07-checkout-step-two.png` });

  const finishBtn = page.locator('[data-test="finish"]');
  const cancelBtn = page.locator('[data-test="cancel"]');
  const subtotal = page.locator('.summary_subtotal_label');
  const tax = page.locator('.summary_tax_label');
  const total = page.locator('.summary_total_label');
  const cartItem = page.locator('.cart_item');

  await expect(finishBtn).toBeVisible();
  await expect(cancelBtn).toBeVisible();
  await expect(subtotal).toBeVisible();
  await expect(tax).toBeVisible();
  await expect(total).toBeVisible();

  const subtotalText = await subtotal.textContent();
  const taxText = await tax.textContent();
  const totalText = await total.textContent();
  const itemsCount = await cartItem.count();

  console.log('CHECKOUT STEP TWO SELECTORS:');
  console.log('  finish btn: [data-test="finish"]');
  console.log('  cancel btn: [data-test="cancel"]');
  console.log('  subtotal: .summary_subtotal_label | value=', subtotalText);
  console.log('  tax: .summary_tax_label | value=', taxText);
  console.log('  total: .summary_total_label | value=', totalText);
  console.log(`  cart items in overview: .cart_item (count=${itemsCount})`);
});

test('EXPLORE-08: Checkout complete selectors', async ({ page }) => {
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
  await page.screenshot({ path: `${SS_DIR}/08-checkout-complete.png` });

  const header = page.locator('.complete-header');
  const backHomeBtn = page.locator('[data-test="back-to-products"]');
  const cartBadge = page.locator('.shopping_cart_badge');

  await expect(header).toBeVisible();
  await expect(backHomeBtn).toBeVisible();
  await expect(cartBadge).not.toBeVisible();

  const headerText = await header.textContent();

  console.log('CHECKOUT COMPLETE SELECTORS:');
  console.log(`  success header: .complete-header | text="${headerText}"`);
  console.log('  back-to-products btn: [data-test="back-to-products"]');
  console.log('  cart badge gone: .shopping_cart_badge (not visible)');
});

test('EXPLORE-09: Unauthenticated access protection', async ({ page }) => {
  await page.goto(`${BASE_URL}/checkout-step-one.html`);
  await page.screenshot({ path: `${SS_DIR}/09-unauth-checkout.png` });
  const url = page.url();
  console.log(`UNAUTH CHECKOUT STEP ONE redirected to: ${url}`);

  await page.goto(`${BASE_URL}/cart.html`);
  const url2 = page.url();
  console.log(`UNAUTH CART redirected to: ${url2}`);
});

test('EXPLORE-10: Cancel from step one returns to cart', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');
  await page.locator('[data-test="cancel"]').click();

  await page.screenshot({ path: `${SS_DIR}/10-cancel-step-one.png` });
  const url = page.url();
  console.log(`CANCEL FROM STEP ONE → URL: ${url}`);
  await expect(page.locator('.shopping_cart_badge')).toBeVisible();
});
