# End-to-End QA Workflow with Natural Language

> **Overview:** This document guides an AI agent through a complete 7-step QA workflow using MCP servers and specialized agents. Each prompt includes explicit output format instructions, constraints, and success criteria to minimize ambiguity and maximize the quality of autonomous execution.

---

## Workflow Overview

```
User Story → Test Plan → Exploratory Testing → Automation Scripts → Execute & Heal → Report → Git Commit
```

| Step | Agent/Tool | Output |
|------|-----------|--------|
| 1 | File Reader | User story summary |
| 2 | `playwright-test-planner` | `specs/saucedemo-checkout-test-plan.md` |
| 3 | Playwright Browser Tools | Screenshots + findings |
| 4 | `playwright-test-generator` | `tests/saucedemo-checkout/*.spec.js` |
| 5 | `playwright-test-healer` | Healed scripts + healing report |
| 6 | File Writer | `test-results/SCRUM-101-checkout-test-report.md` |
| 7 | GitHub MCP | Commit + Push |

---

## 🎯 STEP 1 — Read User Story

### Prompt

```
You are a QA analyst starting a new testing workflow.

Your ONLY task in this step is to read and summarize a user story file.

INPUT FILE: user-stories/SCRUM-101-ecommerce-checkout.md

INSTRUCTIONS:
1. Read the file completely before responding
2. Do NOT start testing or planning yet — this step is read-only

OUTPUT FORMAT (use exactly these sections):
---
## User Story Summary
[2–3 sentences describing what the feature does and its business value]

## Acceptance Criteria
[Numbered list — one item per criterion, copied verbatim from the file]

## Application Under Test
- URL: [extracted URL]
- Test Credentials: [username / password if present]
- Environment: [staging/production/local if mentioned]

## Key Features to Test
[Bullet list of functional areas implied by the acceptance criteria]
---

DONE signal: End your response with "✅ STEP 1 COMPLETE — Ready for test planning."
```

---

## 📋 STEP 2 — Create Test Plan

### Prompt

```
You are a QA engineer using the playwright-test-planner agent.

CONTEXT: You have already read the user story from STEP 1.
The application is: [URL from Step 1]
Test credentials: [credentials from Step 1]

YOUR TASK: Create a comprehensive test plan that covers ALL acceptance criteria.

AGENT TO USE: playwright-test-planner
SAVE OUTPUT TO: specs/saucedemo-checkout-test-plan.md

INSTRUCTIONS:
1. Launch the playwright-test-planner agent
2. Provide it with the application URL and credentials
3. Instruct it to explore all workflows listed in the acceptance criteria
4. The agent must cover the following scenario types:
   - Happy path (successful checkout end-to-end)
   - Negative scenarios (empty fields, invalid data, wrong credentials)
   - Edge cases (boundary values, special characters, network delays)
   - Navigation flow (back button, direct URL access, session expiry)
   - UI validation (required fields, error messages, visual feedback)

EACH TEST CASE MUST INCLUDE:
- ID: TC-[number] (e.g., TC-001)
- Title: [clear, action-oriented title]
- Priority: Critical | High | Medium | Low
- Preconditions: [what must be true before the test runs]
- Steps: [numbered list of actions]
- Expected Result: [specific, verifiable outcome for each step]
- Test Data: [exact values to use]

CONSTRAINTS:
- Do NOT write code in this step
- Do NOT execute tests yet
- Minimum 15 test cases covering all acceptance criteria

OUTPUT VALIDATION: Before saving, confirm the file contains:
[ ] At least one Critical priority test
[ ] At least 3 negative/error scenario tests
[ ] All acceptance criteria mapped to at least one test case

DONE signal: End with "✅ STEP 2 COMPLETE — Test plan saved to specs/saucedemo-checkout-test-plan.md"
```

---

## 🔍 STEP 3 — Perform Exploratory Testing

### Prompt

```
You are a QA engineer performing manual exploratory testing using Playwright browser tools.

CONTEXT:
- Test plan is at: specs/saucedemo-checkout-test-plan.md
- Read this file BEFORE starting any browser action

YOUR TASK: Execute each test scenario from the plan manually using the browser, 
document results, and capture evidence.

EXECUTION PROTOCOL — follow this order for EVERY test case:
1. Read the test case completely (ID, steps, expected result)
2. Set up preconditions (login, clear state, etc.)
3. Execute each step in sequence
4. After each step: compare actual vs expected result
5. Take a screenshot at:
   - The start of the test
   - Any error state or unexpected behavior
   - The final state of the test
6. Record PASS / FAIL / BLOCKED with a clear reason

WHAT TO DOCUMENT FOR EACH TEST CASE:
- TC ID and Title
- Status: PASS | FAIL | BLOCKED
- Actual Result (even when passing — note any visual quirks)
- Element selectors used (CSS, ID, aria-label, data-testid) — CRITICAL for Step 4
- Any unexpected behavior, even if not a test failure
- Screenshot filenames

IMPORTANT — CAPTURE THIS FOR STEP 4:
For every interaction (click, fill, assert), record the exact selector used.
Example: "Used selector: [data-test='checkout-button']"
This information is REQUIRED by the automation script generator in Step 4.

CONSTRAINTS:
- Do NOT skip test cases — mark as BLOCKED if unable to execute
- Do NOT fix bugs — document them
- Do NOT modify the test plan file

DONE signal: End with "✅ STEP 3 COMPLETE — Exploratory testing finished.
Summary: [X] PASS | [Y] FAIL | [Z] BLOCKED"
```

---

## ⚙️ STEP 4 — Generate Automation Scripts

### Prompt

```
You are a QA automation engineer using the playwright-test-generator agent.

CONTEXT — Read BOTH files before generating any code:
1. Test plan: specs/saucedemo-checkout-test-plan.md (defines WHAT to test)
2. Exploratory testing results from Step 3 (defines HOW to interact with the UI)

YOUR TASK: Generate robust Playwright JavaScript test scripts for all test scenarios.

SAVE OUTPUT TO: tests/saucedemo-checkout/
FILE NAMING: [feature-area].spec.js (e.g., checkout-happy-path.spec.js, checkout-validation.spec.js)

MANDATORY CODE REQUIREMENTS:
1. Selectors — use ONLY selectors discovered in Step 3. Priority order:
   [data-test] > [data-testid] > #id > aria-label > role > CSS class (last resort)

2. Structure — every spec file must have:
   - import { test, expect } from '@playwright/test' at the top
   - beforeEach: navigate to app URL + login if required
   - afterEach: clear state / logout if needed
   - Descriptive test names matching TC IDs: test('TC-001: [title]', ...)

3. Assertions — use specific, meaningful assertions:
   ✅ await expect(page.locator('[data-test="error"]')).toHaveText('Username is required')
   ❌ await expect(page).toHaveURL('/checkout')  // too vague

4. Wait strategies — use only Playwright built-in waits:
   ✅ await page.waitForSelector(...)
   ✅ await expect(locator).toBeVisible()
   ❌ await page.waitForTimeout(3000)  // no hardcoded waits

5. Configuration — each spec must run on: chromium, firefox, webkit

6. Comments — add comments for non-obvious steps:
   // Using data-test selector discovered in Step 3 exploratory testing

AFTER GENERATING: Run the tests once to check for syntax errors.
Report: [X] scripts generated | [Y] passed initial run | [Z] failed (list failures)

CONSTRAINTS:
- Do NOT invent selectors that weren't discovered in Step 3
- Do NOT skip test cases from the plan
- Do NOT use page.waitForTimeout() anywhere

DONE signal: End with "✅ STEP 4 COMPLETE — [N] scripts generated in tests/saucedemo-checkout/"
```

---

## 🔧 STEP 5 — Execute and Heal Automation Tests

### Prompt

```
You are a QA automation engineer using the playwright-test-healer agent.

YOUR TASK: Execute all automation scripts, identify failures, and auto-heal them 
until the full suite is stable and passing.

EXECUTION LOOP — repeat until all tests pass or max 3 healing cycles:

CYCLE START:
1. Run: npx playwright test tests/saucedemo-checkout/ --reporter=list
2. Capture: total tests, passed, failed, flaky
3. For each FAILING test:

   DIAGNOSIS (classify the failure type):
   - Selector failure → element not found, wrong locator
   - Timing failure → element not ready, race condition
   - Assertion failure → wrong expected value
   - Logic failure → wrong test steps
   - Environment failure → network, auth, data issue

   HEALING ACTION per type:
   - Selector failure: Find correct selector via page inspection, update locator
   - Timing failure: Add waitForSelector / toBeVisible before the action
   - Assertion failure: Verify actual value, update expected value if app behavior changed
   - Logic failure: Review test steps against test plan, rewrite the block
   - Environment failure: Document and mark as BLOCKED (do not heal env issues)

4. Apply fix to the script file
5. Re-run ONLY the healed tests to verify fix
6. If still failing → attempt next healing strategy
7. If failing after 3 attempts → mark as UNRESOLVABLE, document reason

DOCUMENTATION REQUIRED after each cycle:
| TC ID | Failure Type | Root Cause | Fix Applied | Status After Heal |
|-------|-------------|------------|-------------|-------------------|
| TC-XXX | Selector | Element ID changed | Updated to data-test attr | ✅ PASS |

FINAL RUN: After all healing, run the full suite once more and record final results.

DONE signal: End with:
"✅ STEP 5 COMPLETE
Final Results: [X] PASS | [Y] FAIL | [Z] BLOCKED
Healing cycles performed: [N]
Unresolvable failures: [list or 'none']"
```

---

## 📊 STEP 6 — Create Test Report

### Prompt

```
You are a QA lead compiling a comprehensive test execution report.

INPUTS — Read all of these before writing the report:
- Step 3 results: manual exploratory testing findings
- Step 4 results: generated script inventory
- Step 5 results: automated execution and healing results

SAVE TO: test-results/SCRUM-101-checkout-test-report.md

REPORT STRUCTURE (use exactly these sections):

---
# Test Execution Report — SCRUM-101: E-commerce Checkout
**Date:** [today's date]
**Tester:** QA Automation Agent
**Environment:** [URL tested]
**Playwright Version:** [version used]

---

## 1. Executive Summary
| Metric | Value |
|--------|-------|
| Total Test Cases Planned | |
| Manual Tests Executed | |
| Automated Tests Executed | |
| Overall PASS | |
| Overall FAIL | |
| Blocked / Skipped | |
| Acceptance Criteria Covered | X / Y (Z%) |

**Overall Quality Assessment:** [1 paragraph — GO / NO GO recommendation with justification]

---

## 2. Manual Test Results (Step 3)
[Table: TC ID | Title | Status | Key Finding]
[Subsection: Issues discovered during manual testing — numbered list]

---

## 3. Automated Test Results (Step 5)
[Table: TC ID | Title | Initial Status | Healing Applied | Final Status]

### 3.1 Healing Summary
[Table from Step 5 documentation]

### 3.2 Test Suite Breakdown
[Table: Suite File | Total | Pass | Fail | Duration]

---

## 4. Defects Log
[For every FAIL — use this format:]

### BUG-[001]: [Short title]
- **Severity:** Critical | High | Medium | Low
- **Found in:** Manual | Automated | Both
- **TC Reference:** TC-XXX
- **Steps to Reproduce:**
  1. [step]
  2. [step]
- **Expected:** [what should happen]
- **Actual:** [what actually happens]
- **Evidence:** [screenshot filename]
- **Environment:** [browser, OS, URL]

---

## 5. Test Coverage Analysis
[Table: Acceptance Criterion | Covered By | Status]

**Coverage gaps:** [any AC not covered — explain why]
**Recommendations for additional testing:** [bulleted list]

---

## 6. Summary & Next Steps
- **Risk areas:** [list]
- **Recommended actions before release:** [list]
- **Suggested regression tests:** [list]
---

CONSTRAINTS:
- Do NOT leave any section empty — write "N/A — not applicable" if needed
- All numbers must be consistent across sections (totals must add up)
- Severity definitions: Critical=data loss/security, High=core flow broken, Medium=workaround exists, Low=cosmetic

DONE signal: End with "✅ STEP 6 COMPLETE — Report saved to test-results/SCRUM-101-checkout-test-report.md"
```

---

## 🔀 STEP 7 — Commit to Git

### Prompt

```
You are a DevOps engineer using the GitHub MCP agent to commit all test artifacts.

REPOSITORY: https://github.com/sidneydancini/agent-qa

PRE-COMMIT CHECKLIST — verify ALL items before committing:
[ ] specs/saucedemo-checkout-test-plan.md exists
[ ] tests/saucedemo-checkout/*.spec.js files exist
[ ] test-results/SCRUM-101-checkout-test-report.md exists
[ ] user-stories/SCRUM-101-ecommerce-checkout.md exists
[ ] No credentials or secrets are present in any file

GIT OPERATIONS — execute in this exact order:
1. Check if git is initialized: git status
   - If not initialized: git init && git remote add origin [REPOSITORY URL]
2. Stage all files: git add .
3. Verify staged files: git status (list what will be committed)
4. Create commit with this EXACT message:

feat(tests): Add complete QA suite for SCRUM-101 checkout workflow

- Add user story documentation (SCRUM-101-ecommerce-checkout.md)
- Add comprehensive test plan with all acceptance criteria scenarios
- Add Playwright automation scripts for checkout process
- Add test execution report with manual and automated results
- Include healing log and defects documentation

Resolves SCRUM-101

5. Push: git push origin main
   - If rejected (non-fast-forward): git pull --rebase origin main, then push again
   - If branch doesn't exist: git push -u origin main

POST-PUSH VALIDATION:
- Confirm push was successful
- Provide the commit SHA
- List all files committed

CONSTRAINTS:
- Do NOT force push (--force)
- Do NOT commit if pre-commit checklist has unchecked items — report what is missing

DONE signal: End with:
"✅ STEP 7 COMPLETE
Commit SHA: [sha]
Files committed: [N]
Repository: [URL]"
```

---

## 🔵 Single Combined Prompt — Complete Workflow (Video Demo)

> **How to use:** Paste this single prompt into an agent with access to all configured MCP servers. It executes all 7 steps in sequence with checkpoints between each one.

```
You are an autonomous QA engineer executing a complete end-to-end QA workflow.
You have access to: filesystem tools, Playwright browser tools, playwright-test-planner agent,
playwright-test-generator agent, playwright-test-healer agent, and GitHub MCP agent.

IMPORTANT RULES:
- Complete each step fully before moving to the next
- After each step, output a status checkpoint (format below)
- If a step fails, stop and report the error — do NOT skip ahead
- Preserve all outputs from each step as they are inputs for the next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ USER STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Read: user-stories/SCRUM-101-ecommerce-checkout.md
Output: Summary of requirements, acceptance criteria, app URL, and test credentials.

[CHECKPOINT 1] ✅ or ❌ — state what was found or what failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — CREATE TEST PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use playwright-test-planner agent with the URL and credentials from Step 1.
Cover all acceptance criteria. Include happy path, negative, and edge case scenarios.
Save to: specs/saucedemo-checkout-test-plan.md

[CHECKPOINT 2] ✅ or ❌ — state number of test cases created and file location

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — EXPLORATORY TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Read specs/saucedemo-checkout-test-plan.md, then use Playwright browser tools
to manually execute each test scenario.
Capture: screenshots, element selectors, PASS/FAIL status per test case.
NOTE: Record all selectors used — they are required for Step 4.

[CHECKPOINT 3] ✅ or ❌ — state PASS/FAIL/BLOCKED counts and list of selectors found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — GENERATE AUTOMATION SCRIPTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Using playwright-test-generator agent, create Playwright JavaScript scripts
based on the test plan AND the selectors from Step 3.
Requirements: beforeEach/afterEach hooks, specific assertions, no hardcoded waits,
multi-browser config (chromium, firefox, webkit).
Save to: tests/saucedemo-checkout/

[CHECKPOINT 4] ✅ or ❌ — state number of scripts generated and any initial failures

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — EXECUTE AND HEAL TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run all scripts in tests/saucedemo-checkout/.
For each failure: use playwright-test-healer agent to diagnose (selector/timing/assertion),
apply fix, re-run to verify. Repeat until stable. Max 3 healing cycles.

[CHECKPOINT 5] ✅ or ❌ — state final PASS/FAIL counts and healing summary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — CREATE TEST REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compile all results from Steps 3, 4, and 5 into a report.
Include: executive summary, manual results, automated results, defects log,
coverage analysis, and GO/NO GO recommendation.
Save to: test-results/SCRUM-101-checkout-test-report.md

[CHECKPOINT 6] ✅ or ❌ — state overall quality assessment and file location

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — COMMIT TO GIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Using GitHub MCP agent, stage all new files and commit with message:
"feat(tests): Add complete QA suite for SCRUM-101 checkout workflow"
Push to: https://github.com/ravikaanthe/AgentE2EQAWorkflow-Playwright.git

[CHECKPOINT 7] ✅ or ❌ — state commit SHA and list of committed files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all 7 steps, output:
| Step | Status | Key Output |
|------|--------|------------|
| 1    | ✅/❌  | [summary]  |
| 2    | ✅/❌  | [summary]  |
| 3    | ✅/❌  | [summary]  |
| 4    | ✅/❌  | [summary]  |
| 5    | ✅/❌  | [summary]  |
| 6    | ✅/❌  | [summary]  |
| 7    | ✅/❌  | [summary]  |
```
