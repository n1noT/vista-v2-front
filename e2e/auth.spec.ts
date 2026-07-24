/**
 * End-to-end coverage of the register/login/profile flow, run against the
 * real front + API + Postgres stack (not mocks) — specifically because this
 * is a cross-origin setup (front :4200, API :3000) with a SameSite=None
 * session cookie, exactly the configuration that a CORS or cookie-flag
 * mistake would silently break in the browser but not in a unit test.
 *
 * The first test walks the whole flow in one pass (register → logout →
 * login → reload → edit pseudo) and also collects console errors, asserting
 * none of them mention CORS/cross-origin — that's the actual regression this
 * suite exists to catch. `page.reload()` mid-test is deliberate: it proves
 * the session is coming back from the cookie on a fresh page load, not just
 * surviving in Angular's in-memory `currentUser` signal. The second test
 * checks the guard's redirect independently of any login state.
 */
import { test, expect } from '@playwright/test';

function uniqueUser() {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return { pseudo: `e2e_${id}`, email: `e2e_${id}@example.com`, password: 'password123' };
}

test('register, log out, log back in, edit pseudo', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  const user = uniqueUser();

  await page.goto('/register');
  await page.getByLabel('Pseudo').fill(user.pseudo);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText(user.pseudo)).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText(user.pseudo)).toBeVisible();

  // Reload to prove the session survives from the cookie, not just in-memory state.
  await page.reload();
  await expect(page.getByText(user.pseudo)).toBeVisible();

  const newPseudo = `${user.pseudo}_renamed`;
  await page.getByRole('button', { name: 'Edit pseudo' }).click();
  await page.getByLabel('Pseudo').fill(newPseudo);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(newPseudo)).toBeVisible();

  const corsErrors = consoleErrors.filter((e) => /cors|cross-origin/i.test(e));
  expect(corsErrors, `CORS-related console errors: ${corsErrors.join('; ')}`).toEqual([]);
});

test('unauthenticated visitor is redirected away from /profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fprofile/);
});
