const puppeteer = require("puppeteer");
const {db} = require("./DB");

(async () => {
  const {browser, page} = await startPuppeteer(false);
  await page.goto("https://instagram.com");



})();


//utility functions
async function startPuppeteer(mode) {
  const browser = await puppeteer.launch(mode === "headless"
    ? {}
    : {
      "headless": false,
      "args": [
        "--start-maximized"
      ],
      "defaultViewport": null
    });

  const page = await browser.newPage();

  return {browser, page};
}