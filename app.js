const playwright = require("playwright-core");

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { url } = event.queryStringParameters;

  let browser = null;
  try {
    browser = await playwright.chromium.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: [
        "--autoplay-policy=user-gesture-required",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-domain-reliability",
        "--disable-extensions",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-notifications",
        "--disable-offer-store-unmasked-wallet-cards",
        "--disable-popup-blocking",
        "--disable-print-preview",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-setuid-sandbox",
        "--disable-speech-api",
        "--disable-sync",
        "--disk-cache-size=33554432",
        "--hide-scrollbars",
        "--ignore-gpu-blacklist",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-pings",
        "--no-sandbox",
        "--no-zygote",
        "--password-store=basic",
        "--use-gl=swiftshader",
        "--use-mock-keychain",
        "--single-process",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });
    const ctx = await browser.newContext({ acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto('https://www.get-information-schools.service.gov.uk/Downloads?Skip=&SearchType=Latest&FilterDate.Day=16&FilterDate.Month=2&FilterDate.Year=2021');
    // Click text=Cancel
    await page.click('text=Cancel');
    // Check input[name="Downloads[0].Selected"]
    await page.check('input[name="Downloads[0].Selected"]');
    // Check input[name="Downloads[1].Selected"]
    await page.check('input[name="Downloads[1].Selected"]');
    // Click input:has-text("Download selected files")

    // assert.equal(page.url(), 'https://www.get-information-schools.service.gov.uk/Downloads/Generated/a5dfb61f-5802-449e-a69e-cb126835d1f1');
    // Go to https://www.get-information-schools.service.gov.uk/Downloads/Generated/a5dfb61f-5802-449e-a69e-cb126835d1f1
    //await page.goto('https://www.get-information-schools.service.gov.uk/Downloads/Generated/a5dfb61f-5802-449e-a69e-cb126835d1f1');
    // Click text=Results.zip 

    // "Your extract is ready"
    // await page.click('.govuk-button');

    // const [response] = await Promise.all([
    //   page.waitForNavigation({ url: '**Generated' }),
    page.click('input:has-text("Download selected files")');
    // page.click('a.some-link')
    // ]);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      // page.click('text=Results.zip')
      page.click('input:has-text("Results.zip")')
    ]);

    // Wait for the download process to complete
    const path = await download.path();
    console.log("Path = " + path);

    //await context.close();
    await browser.close();
    const response = {
      headers: { "Content-type": "application/json" },
      statusCode: 200,
      body: "{'path': "+path+"}",
      // isBase64Encoded: true,
    };
    await context.succeed(response);
    await context.close();
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

