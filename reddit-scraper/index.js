const puppeteer = require("puppeteer");
const {db} = require("./DB");

const url = "https://old.reddit.com/r/learnprogramming/comments/4q6tae/i_highly_recommend_harvards_free_online_2016_cs50/";

(async () => {
  const browser = await puppeteer.launch({
    "headless": false,
    "args": [
      "--start-maximized"
    ],
    "defaultViewport": null
  });
  const page = await browser.newPage();
  await page.goto(url);

  await expandAllCommentThreads(page);


  // await browser.close();


  //select all comments, scrape text and points

  //sort comments by points

  //insert into google sheets DB
  // const sheet = await db.loadGoogleSheetByTitle("Reddit");
  // sheet.clear();
})();

async function expandAllCommentThreads(page) {
  console.log("Started expanding all comments...");
  let expandButtons = await page.$$(".morecomments");
  while (expandButtons.length) {
    console.log({"expandButtonsCount": expandButtons.length});
    for (const expandButton of expandButtons) {
      await expandButton.click();
      await page.waitForTimeout(420 + (Math.random() * 90));
    }
    await page.waitForTimeout(1000 + (Math.random() * 90));
    expandButtons = await page.$$(".morecomments");
  }
  console.log("Done expanding all comments.");
}
