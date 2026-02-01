# I Don't Care About Cookies for Playwright/Puppeteer

This package contains the [I don't care about cookies](https://addons.mozilla.org/cs/firefox/addon/i-dont-care-about-cookies/) browser extension compiled for use with Playwright or Puppeteer.

## Usage

```typescript
import { chromium } from 'playwright'; // works with Firefox too!
import { getInjectableScript } from 'idcac-playwright';

(async () => {
    const b = await chromium.launch({
        headless: false,
    });

    const context = await b.newContext();
    const p = await context.newPage();

    await p.goto('https://google.com');

    // Inject the extension as a client-side script
    await p.evaluate(getInjectableScript());

    // Enjoy your webpage without annoying cookie modals!
})();
```

## What works:
- Custom CSS injection
- Custom JS injection

## WIP 
- Network interception
    - trying to figure out the best way to do this with Playwright

## What doesn't work:
- Whitelisting (just don't inject the script on the page you want to whitelist)