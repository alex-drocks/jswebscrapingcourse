const fetch = require("node-fetch");
const cheerio = require("cheerio");

const baseURL = "https://ca.investing.com/equities/";

(async () => {
  const DB = require("./DB");
  const db = new DB(true);
  await db.load();

  const sheet = db.getSheetByTitle("Stocks");
  sheet.clear();

  let stocks = [
    "toronto-dominion-bank",
    "bank-of-montreal-financial-group",
    "national-bank-of-canada",
    "alimentation-couchen-tard-a",
    "bombardier-inc-a",
    "dollarama-inc",
    "canadian-tire-corp-ltd",
    "aurora-cannabis",
    "abcann-global-corp",
    "supreme-pharmaceuticals-inc"
  ];

  stocks = await fetchAllParallel(stocks);

  stocks = formatData(stocks);
  if (!stocks.length)
    return;

  //set the first row titles
  const headers = Object.keys(stocks[0]);
  await sheet.setHeaderRow(headers);

  //add the data rows
  await sheet.addRows(stocks);
})();

async function fetchAllParallel(endpoints) {
  let promises = [];

  endpoints.forEach(endpoint => {
    promises.push(_fetchSingleStockData(endpoint));
  });

  return await Promise.all(promises);
}

async function _fetchSingleStockData(stockURL) {
  const res = await fetch(`${baseURL}${stockURL}`);
  if (res.status !== 200) {
    console.log({"response status": res.status});
    return;
  }
  const html = await res.text();

  const $ = cheerio.load(html);
  const container = $("section#leftColumn");
  return {
    name: container.find("div.instrumentHead h1").first().text(),
    price: container.find("div#quotes_summary_current_data span#last_last").text(),
    url: baseURL + stockURL,
  };
}

function formatData(dataArray) {
  return dataArray.map(data => {
    return {
      symbol: data.name.match(/\((.*)\)/)[1],
      name: data.name.replace(/\s/g, " ").trim(),
      price: data.price.trim(),
      timestamp: new Date(Date.now()).toLocaleString("fr-CA"),
      url: data.url
    };
  });
}
