'use strict';
const playwright = require('playwright-core');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'ap-east-1'});
const fs = require('fs')

process.env.DEBUG = 'pw:api,pw:browser*';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
// const { url } = event.queryStringParameters;

  let browser = null;
  let ctx = null;
  // try {
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
    ctx = await browser.newContext({ acceptDownloads: true });
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
    // await browser.close();
    const response = {
      headers: { "Content-type": "application/json" },
      statusCode: 200,
      body: "{'path': "+path+"}",
      // isBase64Encoded: true,
    };
     // You should always catch your errors when using async/await
    const rs = fs.createReadStream(path)
    rs.on('open', () => {
      console.log('OPEN')
    })
    rs.on('end', () => {
      console.log('END')
    })
    rs.on('close', () => {
      console.log('CLOSE')
    })

    await console.log('START UPLOAD');

    var params = {
      Bucket: 'uk-public-data',
      Key: 'edubasealldata/2021_02_16' + ".zip",
      ACL: 'private',
      Body: rs,
      };
    const s3Response = await s3.upload(params).promise();

    await console.log('response:')
    await console.log(s3Response)

    await ctx.close();
    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Go Serverless v1.0! Your function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
      // callback(null, s3Response);
  // } 
  // catch (error) 
  // {
  //   console.log(error);
  //     // callback(e);
  //   if (ctx !== null) {
  //     await ctx.close();
  //   }
  //   if (browser !== null) {
  //     await browser.close();
  //   }

  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify(
  //       {
  //         message: 'Go Serverless v1.0! Your function executed successfully!',
  //         input: event,
  //         error: error,
  //       },
  //       null,
  //       2
  //     ),
  //   };
  //   // return ctx.fail(error);
  // } 
};

