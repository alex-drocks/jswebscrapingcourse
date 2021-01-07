const puppeteer = require("puppeteer");
const {db} = require("./DB");

const url = "https://old.reddit.com/r/learnprogramming/comments/4q6tae/i_highly_recommend_harvards_free_online_2016_cs50/";

(async () => {
  const {browser, page} = await startPuppeteer("headless");
  await page.goto(url);

  // await expandAllCommentThreads(page);

  const comments = await getFormattedComments(page);

  await browser.close(); //done scraping with puppeteer
  if (!comments.length)
    return;

  const sheet = await db.loadGoogleSheetByTitle("Reddit");
  sheet.clear();
  console.log("Cleared previous data");

  await sheet.setHeaderRow(Object.keys(comments[0]));
  console.log("Set headers by comments data keys");

  await sheet.addRows(comments);
  console.log("added all comments in 'Reddit' Google Sheet DB");

  await sheet.loadCells("C1");
  const C1 = sheet.getCellByA1("C1");
  C1.value = url;
  await sheet.saveUpdatedCells();
  console.log("added original thread url to the headers");
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

async function getFormattedComments(page) {
  const formattedComments = [];

  console.log("Started getFormattedComments()...");
  const comments = await page.$$(".entry");
  for (const comment of comments) {
    //get this comment's points
    const points = await comment.$eval(".score.unvoted", el => el.textContent).catch(err => null);
    // get this comment's text
    const rawText = await comment.$eval(".usertext-body", el => el.textContent).catch(err => null);

    if (points && rawText) {
      try {
        const text = rawText.replace(/\s/g, " ").trim();
        formattedComments.push({points, text});
      } catch (err) {
        console.error(err);
      }
    }
  }
  console.log("Done getting " + formattedComments.length + " comments.");

  return sortCommentsByPoints(formattedComments);
}

function sortCommentsByPoints(comments) {
  console.log("Started sorting comments by points...");
  const sorted = comments.sort((a, b) => {
    const pointsA = Number(a.points.split(" ")[0]);
    const pointsB = Number(b.points.split(" ")[0]);
    //The negative/positive sign of the subtraction determines the ascending/descending order
    return pointsB - pointsA;
  });
  console.log("Done sorting comments by points.");
  return sorted;
}