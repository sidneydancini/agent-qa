# Test Plan — SCRUM-101: E-commerce Checkout Process
**Application:** https://www.saucedemo.com  
**Credentials:** standard_user / secret_sauce  
**Playwright Version:** 1.60.0  
**Browsers:** Chromium, Firefox, WebKit  
**Date:** 2026-06-08  
**Author:** playwright-test-planner (QA Agent)

---

## Coverage Matrix

| Acceptance Criterion | Test Cases |
|---|---|
| AC1 — Cart Review | TC-001, TC-002, TC-003 |
| AC2 — Checkout Information Entry | TC-004, TC-005, TC-006, TC-007, TC-008 |
| AC3 — Order Overview | TC-009, TC-010, TC-011 |
| AC4 — Order Completion | TC-012, TC-013 |
| AC5 — Error Handling | TC-006, TC-007, TC-008, TC-014, TC-015 |
| Navigation / Session | TC-016, TC-017 |

---

## Test Cases

---

### TC-001: Happy Path — Complete Checkout End-to-End
- **Priority:** Critical
- **AC:** AC1, AC2, AC3, AC4
- **Preconditions:** User is not logged in; browser has no session.
- **Test Data:** Username: `standard_user` | Password: `secret_sauce` | First Name: `John` | Last Name: `Doe` | Zip: `12345`
- **Steps:**
  1. Navigate to https://www.saucedemo.com
  2. Enter username `standard_user` and password `secret_sauce`; click Login
  3. Click "Add to cart" on "Sauce Labs Backpack"
  4. Verify cart badge shows `1`
  5. Click the shopping cart icon
  6. Verify cart page shows "Sauce Labs Backpack" with correct name and price
  7. Click "Checkout"
  8. Fill First Name: `John`, Last Name: `Doe`, Zip: `12345`; click "Continue"
  9. Verify overview page shows the item, subtotal, tax, and total
  10. Click "Finish"
  11. Verify confirmation page shows "Thank you for your order!"
  12. Click "Back Home"
  13. Verify redirect to products page and cart badge is gone
- **Expected Result:** User completes checkout; order confirmed; cart cleared; redirect to products page.

---

### TC-002: Cart Review — Multiple Items
- **Priority:** High
- **AC:** AC1
- **Preconditions:** Logged in as standard_user; cart is empty.
- **Test Data:** Add "Sauce Labs Backpack" and "Sauce Labs Bike Light"
- **Steps:**
  1. Login and navigate to inventory
  2. Add "Sauce Labs Backpack" to cart
  3. Add "Sauce Labs Bike Light" to cart
  4. Verify cart badge shows `2`
  5. Navigate to cart
  6. Verify both items appear with name, description, and price
  7. Verify each item shows quantity `1`
- **Expected Result:** Cart displays 2 items; badge = 2; each item shows name, description, price, quantity.

---

### TC-003: Cart Review — Continue Shopping Navigation
- **Priority:** Medium
- **AC:** AC1
- **Preconditions:** Logged in; at least one item in cart.
- **Test Data:** Any one product added to cart
- **Steps:**
  1. Login and add one item to cart
  2. Navigate to cart page
  3. Click "Continue Shopping"
  4. Verify redirect to inventory/products page
  5. Verify the previously added item is still in the cart (badge still shows count)
- **Expected Result:** Redirect to products page; cart contents preserved.

---

### TC-004: Checkout Info — All Fields Valid
- **Priority:** Critical
- **AC:** AC2, AC3
- **Preconditions:** Logged in; one item in cart; on cart page.
- **Test Data:** First Name: `Jane` | Last Name: `Smith` | Zip: `90210`
- **Steps:**
  1. Login, add item, go to cart
  2. Click "Checkout"
  3. Verify URL contains `checkout-step-one`
  4. Fill First Name: `Jane`, Last Name: `Smith`, Zip: `90210`
  5. Click "Continue"
  6. Verify redirect to checkout-step-two (overview)
  7. Verify item is listed in overview
  8. Verify subtotal, tax, and total labels are present and non-empty
- **Expected Result:** Form accepts valid data; proceed to overview with correct item and price breakdown.

---

### TC-005: Checkout Info — Form Fields Visible and Labelled
- **Priority:** High
- **AC:** AC2
- **Preconditions:** Logged in; one item in cart.
- **Steps:**
  1. Login, add item, go to cart, click "Checkout"
  2. Verify page contains input for First Name
  3. Verify page contains input for Last Name
  4. Verify page contains input for Zip/Postal Code
  5. Verify "Continue" and "Cancel" buttons are visible
- **Expected Result:** All three form fields and both buttons are visible on the checkout information page.

---

### TC-006: Checkout Info — Empty First Name
- **Priority:** Critical
- **AC:** AC2, AC5
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Test Data:** First Name: `` (empty) | Last Name: `Doe` | Zip: `12345`
- **Steps:**
  1. Login, add item, go to cart, click "Checkout"
  2. Leave First Name blank; fill Last Name: `Doe`; fill Zip: `12345`
  3. Click "Continue"
  4. Verify an error message is displayed
  5. Verify error message contains "First Name is required"
  6. Verify user remains on checkout-step-one
- **Expected Result:** Error shown: "Error: First Name is required"; no navigation.

---

### TC-007: Checkout Info — Empty Last Name
- **Priority:** Critical
- **AC:** AC2, AC5
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Test Data:** First Name: `John` | Last Name: `` (empty) | Zip: `12345`
- **Steps:**
  1. Login, add item, go to cart, click "Checkout"
  2. Fill First Name: `John`; leave Last Name blank; fill Zip: `12345`
  3. Click "Continue"
  4. Verify error message contains "Last Name is required"
  5. Verify user remains on checkout-step-one
- **Expected Result:** Error shown: "Error: Last Name is required"; no navigation.

---

### TC-008: Checkout Info — Empty Postal Code
- **Priority:** Critical
- **AC:** AC2, AC5
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Test Data:** First Name: `John` | Last Name: `Doe` | Zip: `` (empty)
- **Steps:**
  1. Login, add item, go to cart, click "Checkout"
  2. Fill First Name: `John`; Last Name: `Doe`; leave Zip blank
  3. Click "Continue"
  4. Verify error message contains "Postal Code is required"
  5. Verify user remains on checkout-step-one
- **Expected Result:** Error shown: "Error: Postal Code is required"; no navigation.

---

### TC-009: Order Overview — Price Breakdown Accuracy
- **Priority:** High
- **AC:** AC3
- **Preconditions:** Logged in; one item (Sauce Labs Backpack, $29.99) in cart; valid checkout info entered.
- **Test Data:** First Name: `John` | Last Name: `Doe` | Zip: `12345`
- **Steps:**
  1. Login, add "Sauce Labs Backpack" to cart, proceed through checkout info
  2. On overview page, read the "Item total" value
  3. Verify it shows `$29.99`
  4. Read the "Tax" value
  5. Verify it is a positive numeric dollar amount
  6. Read the "Total" value
  7. Verify Total = Item total + Tax
- **Expected Result:** Subtotal = $29.99; Tax > $0; Total = Subtotal + Tax.

---

### TC-010: Order Overview — Cancel Returns to Products
- **Priority:** High
- **AC:** AC3
- **Preconditions:** Logged in; one item in cart; on checkout-step-two.
- **Steps:**
  1. Navigate to checkout-step-two
  2. Click "Cancel"
  3. Verify redirect to inventory/products page
  4. Verify item is still in cart (badge visible)
- **Expected Result:** Redirect to products page; cart contents preserved.

---

### TC-011: Order Overview — Item Summary Matches Cart
- **Priority:** High
- **AC:** AC3
- **Preconditions:** Logged in; "Sauce Labs Fleece Jacket" and "Sauce Labs Bolt T-Shirt" added to cart.
- **Steps:**
  1. Add two specific items to cart
  2. Proceed through checkout to step-two
  3. Verify both items appear in the overview list
  4. Verify item names and prices match what was in cart
- **Expected Result:** Overview shows exact same items and prices as the cart.

---

### TC-012: Order Completion — Success Message Shown
- **Priority:** Critical
- **AC:** AC4
- **Preconditions:** On checkout-step-two with one item.
- **Steps:**
  1. Complete checkout to step-two
  2. Click "Finish"
  3. Verify URL contains `checkout-complete`
  4. Verify page shows "Thank you for your order!"
  5. Verify a sub-message about dispatch is shown
- **Expected Result:** Confirmation page displayed with success header "Thank you for your order!".

---

### TC-013: Order Completion — Cart Cleared After Finish
- **Priority:** Critical
- **AC:** AC4
- **Preconditions:** One item in cart; order completed.
- **Steps:**
  1. Complete full checkout (TC-001 flow)
  2. After order confirmed, click "Back Home"
  3. Verify redirect to inventory page
  4. Verify cart badge is NOT visible (cart is empty)
  5. Navigate to `/cart.html` directly
  6. Verify no items are listed in the cart
- **Expected Result:** Cart is empty; badge not shown; `/cart.html` shows empty cart.

---

### TC-014: Checkout Info — Special Characters in Name Fields
- **Priority:** Medium
- **AC:** AC5
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Test Data:** First Name: `J@ne<>` | Last Name: `D"oe` | Zip: `12345`
- **Steps:**
  1. Navigate to checkout-step-one
  2. Enter special chars in First Name and Last Name; valid Zip
  3. Click "Continue"
  4. Observe: does the form accept, show error, or break?
  5. If proceeds to step-two: verify no XSS-like behavior in displayed values
- **Expected Result:** Form either accepts gracefully and displays escaped values, or shows a validation error — no crash or script injection.

---

### TC-015: Checkout Info — Numbers Only in Name Fields
- **Priority:** Low
- **AC:** AC5
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Test Data:** First Name: `12345` | Last Name: `67890` | Zip: `00000`
- **Steps:**
  1. Navigate to checkout-step-one
  2. Enter numeric values in all fields
  3. Click "Continue"
  4. Observe whether the form accepts or rejects the values
- **Expected Result:** Acceptable behavior documented; no crash; boundary case noted.

---

### TC-016: Navigation — Direct URL Access Without Login
- **Priority:** High
- **AC:** AC2, Business Rule #2
- **Preconditions:** No active session.
- **Steps:**
  1. Without logging in, navigate directly to `https://www.saucedemo.com/checkout-step-one.html`
  2. Verify redirect to login page or an appropriate error
  3. Navigate to `/cart.html` without login
  4. Verify redirect or error
- **Expected Result:** Unauthenticated access to protected routes redirects to login page.

---

### TC-017: Navigation — Cancel on Checkout Step One
- **Priority:** Medium
- **AC:** AC3
- **Preconditions:** Logged in; one item in cart; on checkout-step-one.
- **Steps:**
  1. Reach checkout-step-one
  2. Click "Cancel"
  3. Verify redirect to cart page
  4. Verify item is still in cart
- **Expected Result:** Cancel from step-one returns to cart; cart items preserved.

---

## Validation Checklist

- [x] At least one Critical priority test (TC-001, TC-006, TC-007, TC-008, TC-012, TC-013)
- [x] At least 3 negative/error scenario tests (TC-006, TC-007, TC-008, TC-014, TC-015, TC-016)
- [x] All acceptance criteria mapped to at least one test case

**Total test cases: 17**

✅ STEP 2 COMPLETE — Test plan saved to specs/saucedemo-checkout-test-plan.md
