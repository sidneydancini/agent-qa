# Test Execution Report — SCRUM-101: E-commerce Checkout
**Date:** 2026-06-08  
**Tester:** QA Automation Agent (Claude Code)  
**Environment:** https://www.saucedemo.com (Production demo)  
**Playwright Version:** 1.60.0  
**Browsers Tested:** Chromium 148, Firefox 150, WebKit 26.4  

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Total Test Cases Planned | 17 |
| Manual / Exploratory Tests Executed | 10 |
| Automated Tests Executed | 17 (× 3 browsers = 51 runs) |
| Overall PASS | 51 / 51 (100%) |
| Overall FAIL | 0 |
| Blocked / Skipped | 0 |
| Acceptance Criteria Covered | 5 / 5 (100%) |

**Overall Quality Assessment:** **GO.** The SauceDemo checkout flow is fully functional across Chromium, Firefox, and WebKit. All 5 acceptance criteria are covered, all 17 test cases pass in every browser, and no defects were found. The application enforces mandatory field validation with correct error messages, properly guards authenticated routes, and clears the cart after order completion. The feature is ready for release based on the current test scope. Recommendation: add session-expiry and network-error tests in a follow-up sprint before enabling real payment integration.

---

## 2. Manual Test Results (Step 3 — Exploratory)

| TC ID | Title | Status | Key Finding |
|---|---|---|---|
| EXPLORE-01 | Login page selectors | PASS | All data-test selectors confirmed: username, password, login-button |
| EXPLORE-02 | Inventory page selectors | PASS | 6 products; data-test^="add-to-cart" pattern works for all |
| EXPLORE-03 | Add item + cart badge | PASS | `.shopping_cart_badge` increments correctly |
| EXPLORE-04 | Cart page selectors | PASS | checkout, continue-shopping buttons confirmed |
| EXPLORE-05 | Checkout step one selectors | PASS | firstName, lastName, postalCode, continue, cancel all present |
| EXPLORE-06 | Error messages | PASS | Exact error text confirmed for each missing field |
| EXPLORE-07 | Checkout step two selectors | PASS | Subtotal=$29.99, Tax=$2.40, Total=$32.39 verified |
| EXPLORE-08 | Checkout complete selectors | PASS | `.complete-header` = "Thank you for your order!" |
| EXPLORE-09 | Unauth access protection | PASS | Both /checkout-step-one.html and /cart.html redirect to `/` |
| EXPLORE-10 | Cancel step one → cart | PASS | Redirects to /cart.html with badge preserved |

**Issues discovered during manual testing:** None. Application behaved as specified across all explored paths.

---

## 3. Automated Test Results (Step 5)

| TC ID | Title | Initial Status | Healing Applied | Final Status |
|---|---|---|---|---|
| TC-001 | Complete checkout end-to-end | PASS | None | ✅ PASS |
| TC-002 | Cart displays multiple items | PASS | None | ✅ PASS |
| TC-003 | Continue Shopping preserves cart | PASS | None | ✅ PASS |
| TC-004 | Valid info proceeds to overview | PASS | None | ✅ PASS |
| TC-005 | Form fields and buttons visible | PASS | None | ✅ PASS |
| TC-006 | Empty First Name error | PASS | None | ✅ PASS |
| TC-007 | Empty Last Name error | PASS | None | ✅ PASS |
| TC-008 | Empty Postal Code error | PASS | None | ✅ PASS |
| TC-009 | Price breakdown accuracy | PASS | None | ✅ PASS |
| TC-010 | Cancel overview → products | PASS | None | ✅ PASS |
| TC-011 | Overview matches cart | PASS | None | ✅ PASS |
| TC-012 | Order completion success msg | PASS | None | ✅ PASS |
| TC-013 | Cart cleared after order | PASS | None | ✅ PASS |
| TC-014 | Special chars — no crash | PASS | None | ✅ PASS |
| TC-015 | Numeric-only names | PASS | None | ✅ PASS |
| TC-016 | Unauth route protection | PASS | None | ✅ PASS |
| TC-017 | Cancel step one → cart | PASS | None | ✅ PASS |

### 3.1 Healing Summary

No healing cycles were required. All 51 test runs (17 tests × 3 browsers) passed on first execution.

| TC ID | Failure Type | Root Cause | Fix Applied | Status After Heal |
|---|---|---|---|---|
| — | — | — | — | N/A — no failures |

### 3.2 Test Suite Breakdown

| Suite File | Total Tests | Pass | Fail | Duration (chromium) |
|---|---|---|---|---|
| checkout-happy-path.spec.ts | 6 | 6 | 0 | ~1.3s avg |
| checkout-validation.spec.ts | 7 | 7 | 0 | ~0.7s avg |
| checkout-navigation.spec.ts | 4 | 4 | 0 | ~0.8s avg |
| **Total (per browser)** | **17** | **17** | **0** | **~4.3s** |
| **Total (all 3 browsers)** | **51** | **51** | **0** | **~25.3s** |

---

## 4. Defects Log

No defects were identified during manual or automated testing.

**N/A — not applicable.** All test cases passed; no bugs to report for this cycle.

---

## 5. Test Coverage Analysis

| Acceptance Criterion | Covered By | Status |
|---|---|---|
| AC1 — Cart Review (items, totals, navigation) | TC-001, TC-002, TC-003 | ✅ COVERED |
| AC2 — Checkout Information Entry (form, mandatory fields, errors) | TC-004, TC-005, TC-006, TC-007, TC-008 | ✅ COVERED |
| AC3 — Order Overview (summary, breakdown, cancel) | TC-009, TC-010, TC-011 | ✅ COVERED |
| AC4 — Order Completion (success msg, Back Home, cart cleared) | TC-012, TC-013 | ✅ COVERED |
| AC5 — Error Handling (validation, special chars, boundary) | TC-006, TC-007, TC-008, TC-014, TC-015 | ✅ COVERED |

**Coverage gaps:** None for the defined acceptance criteria.

**Recommendations for additional testing:**
- Session expiry: test checkout behavior when session cookie expires mid-flow
- Network error simulation: test with offline mode or throttled connection during checkout
- Mobile viewports: test on iPhone 12 and Pixel 5 configurations (not run in this cycle)
- Concurrent users: test cart isolation across simultaneous sessions
- `problem_user` and `performance_glitch_user` credentials: SauceDemo exposes alternate user types that trigger UI bugs and slow responses worth testing

---

## 6. Summary & Next Steps

- **Risk areas:**
  - No server-side session expiry testing performed
  - Mobile responsiveness not covered in this cycle
  - Special character handling passed but behavior is permissive — any downstream system consuming the name fields should validate/sanitize independently

- **Recommended actions before release:**
  - Run mobile viewport configurations (iPhone/Pixel)
  - Add a test for `problem_user` to document known broken behaviors
  - Verify behavior when cart is empty and user manually navigates to `/checkout-step-one.html`

- **Suggested regression tests:**
  - TC-001 (full happy path) — include in every regression suite as smoke test
  - TC-006, TC-007, TC-008 (error messages) — re-run any time form labels or copy changes
  - TC-016 (unauth protection) — re-run any time auth middleware is touched

✅ STEP 6 COMPLETE — Report saved to test-results/SCRUM-101-checkout-test-report.md
