const puppeteer = require("puppeteer");
const {instagramLogin} = require("./.configs");
const {db} = require("./db");

(async () => {
  const sheet = await db.loadGoogleSheetByTitle("Instagram");
  const imgURL = (await sheet.getRows()).map(row => row.imgURL)[0];

  const {browser, page} = await startPuppeteer(false);
  await page.goto("https://instagram.com");
  await page.waitForSelector("#loginForm");

  const [usernameInput, passwordInput] = await page.$$("#loginForm input");
  await usernameInput.type(instagramLogin.user);
  await passwordInput.type(instagramLogin.pass);

  await page.keyboard.press("Enter"); //form submit
  await page.waitForSelector("span.coreSpriteSearchIcon");

  await goToProfile(page, imgURL);

  await likeImage(page, imgURL);
  await page.waitForTimeout(500);
  await browser.close();

  await sheet.addRows([{
    imgURL: imgURL,
    liked: "true",
  }]);
})();


//utility functions
async function startPuppeteer(isHeadless) {
  const browser = await puppeteer.launch(isHeadless
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

async function goToProfile(page, imgURL) {
  await page.goto(imgURL.split("\/p\/")[0]);
  //https://www.instagram.com/drocksrecords/p/Bff-hYDA-5s/
  //https://www.instagram.com/drocksrecords <==
}

async function likeImage(page, imgURL) {
  const href = imgURL.split(/instagram\.com\/.*\/p\//)[1]
  // original: https://www.instagram.com/drocksrecords/p/Bff-hYDA-5s/
  // extracted img link: Bff-hYDA-5s/
  // final href: /p/Bff-hYDA-5s/ <==
  const targetImgSelector = `article a[href="/p/${href}"]`;
  await page.waitForSelector(targetImgSelector);
  const img = await page.$(targetImgSelector);
  await img.click();
  await page.waitForSelector("article[role='presentation'] section button svg[aria-label]");
  const likeBtn = await page.$("article[role='presentation'] section button svg[aria-label='J’aime']");
  likeBtn && await likeBtn.click();
}