//google-trends/index.js
const fetch = require("node-fetch");
const cheerio = require("cheerio");

(async function trendsFetcher() {
  let trends = [];

  const minSearchesPerMonth = 500000;
  const myKeywordsList = [
    "",
    // "podcast"
  ];

  //clear previous entries in Google Sheets DB
  const DB = require("./DB");
  const db = new DB(true);
  await db.load();
  const sheet = db.getSheetByTitle("GoogleTrends");
  sheet.clear();

  //scrape all trends pages
  let pageNum = 0;
  while (true) {
    pageNum++;
    const res = await fetch(`https://explodingtopics.com/topics-this-month?page=${pageNum}`);
    console.log({scrapingPageNum: pageNum});
    if (res.status !== 200)
      break;

    const html = await res.text();
    const $ = cheerio.load(html);
    const cards = $(".topicInfoContainer").toArray();
    const pageTrends = cards.map(card => {
      const elm = $(card);
      return {
        googleKeyword: elm.find(".tileKeyword").text(),
        searchesPerMonth: elm.find(".scoreTagItem").first().text(),
        description: elm.find(".tileDescription").text(),
        status: elm.find(".typeTagInnerContainer").text(),
      };
    });

    trends = trends.concat(pageTrends);
  }

  //format output
  trends = trends
    .map(trend => {
      return {
        googleKeyword: trend.googleKeyword,
        searchesPerMonth: convertStringNumberToNumber(trend.searchesPerMonth),
        description: trend.description,
        googleSearchLink: `https://www.google.com/search?q=${encodeURIComponent(trend.googleKeyword)}`,
        googleTrendsLink: `https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.googleKeyword)}`,
        status: trend.status
      };
    })
    .filter(trend =>
      myKeywordsList.some(keyword => trend.description.toLowerCase().includes(keyword))
      && Number(trend.searchesPerMonth) >= minSearchesPerMonth
      && trend.status.includes("exploding")
    );

  const headers = Object.keys(trends[0]);
  await sheet.setHeaderRow(headers);

  console.log("Number of trends matching filter: " + trends.length);
  if (trends.length)
    await sheet.addRows(trends);

})();

function convertStringNumberToNumber(stringNumber) {
  let number;
  number = stringNumber.replace(/[.,]/, "");
  number = number.replace(/K$/i, "000");
  number = number.replace(/M$/i, "000000");
  number = number.replace("↑", "+");
  number = number.replace("↓", "-");
  return number;
}