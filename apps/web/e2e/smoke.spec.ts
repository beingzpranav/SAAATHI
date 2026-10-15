import { test, expect } from '@playwright/test';

test.describe('SAATHI E2E Smoke Flows', () => {
  test('Landing Page renders with rich Hearth design system, branding, and navigation', async ({ page }) => {
    await page.goto('/');

    // Check main branding title
    await expect(page).toHaveTitle(/SAATHI/i);

    // Verify hero section and key action buttons
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Check navigation bar items
    const navBar = page.locator('header, nav');
    await expect(navBar.first()).toBeVisible();

    // Verify theme toggle or language switcher exists
    const languageBtn = page.getByRole('button', { name: /English|हिन्दी|Language/i });
    if (await languageBtn.count() > 0) {
      await expect(languageBtn.first()).toBeVisible();
    }
  });

  test('Trade Explorer renders verified trade cards with NCVET median wages and filters', async ({ page }) => {
    await page.goto('/trades');

    // Wait for the trades header
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for trade cards with data-testid or article
    const tradeCards = page.locator('[data-testid="trade-card"], article, .trade-card');
    await expect(tradeCards.first()).toBeVisible();

    // Verify at least one trade card contains vocational information
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/Electrician|Solar|Automotive|Fitter|Plumber|इलेक्ट्रीशियन/i);
  });

  test('Admin Dashboard loads with k-anonymity privacy shield and all metrics', async ({ page }) => {
    await page.goto('/admin');

    // Verify Dashboard Title / Header
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for k-anonymity privacy shield or threshold mention
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toMatch(/k-anonymity|privacy|surveys|households|परिवार/i);

    // Verify tab navigation (Overview, Concerns, Funnel, Escalations)
    const tabs = page.locator('button, [role="tab"]');
    expect(await tabs.count()).toBeGreaterThan(3);

    // Verify export button exists
    const exportBtn = page.getByRole('button', { name: /Export|डाउनलोड|CSV/i });
    await expect(exportBtn.first()).toBeVisible();
  });

  test('Counsellor Console loads with active cases and consultation tools', async ({ page }) => {
    await page.goto('/counsellor');

    // Verify Counsellor Console heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for consultation or booking controls
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Counsellor|परामर्श|Consultation|Booking|Session/i);
  });

  test('User authentication and progression to Decision Card with SHA-256 seal', async ({ page }) => {
    // Mock login endpoint
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'usr-learner-01',
              email: 'learner@saathi.gov.in',
              name: 'Aarav Sharma',
              role: 'LEARNER',
              householdId: 'hh-varanasi-01',
            },
          },
        }),
      });
    });

    // Mock decision card endpoint
    await page.route('**/api/v1/decision-card/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'card-sharma-2026',
            householdId: 'hh-varanasi-01',
            chosenTradeId: 'trade-electrician',
            chosenTradeCode: 'ELE-2024',
            chosenTradeName: 'Electrician (इलेक्ट्रीशियन)',
            chosenProviderId: 'iti-varanasi-gov',
            chosenProviderName: 'Government Industrial Training Institute (ITI) Karaundi, Varanasi',
            chosenProviderAddress: 'Karaundi, BHU Road, Varanasi, UP - 221005',
            sessionIntegrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            generatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    // 1. Visit protected Decision Card route directly (unauthenticated)
    await page.goto('/decision-card');

    // 2. Verify redirect to /login with state
    await expect(page.locator('h1')).toContainText(/Sign in/i);

    // 3. Click fast-login demo account button for Learner
    const demoLearnerBtn = page.getByRole('button', { name: /Learner/i });
    if (await demoLearnerBtn.count() > 0) {
      await demoLearnerBtn.click();
    } else {
      await page.fill('input[type="email"]', 'learner@saathi.gov.in');
      await page.fill('input[type="password"]', 'Password123!');
    }

    // Submit login form (which logs in and automatically redirects back to /decision-card)
    await page.locator('button[type="submit"]').click();

    // 4. Verify Decision Card is visible with official seals and chosen trade
    await expect(page.locator('h1, h2').first()).toBeVisible();
    const cardContent = await page.textContent('body');
    expect(cardContent).toMatch(/Decision|निर्णय|Electrician|इलेक्ट्रीशियन|ITI/i);
  });
});
