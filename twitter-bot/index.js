//twitter-bot/index.js
const Twitter = require('twitter');
const credentials = require("./.configs");
//connect to twitter API
const twitterClient = new Twitter(credentials);

const DB = require("../db/DB");

const isDevMode = true;
const db = new DB(isDevMode);

(async function postNextBibleQuote() {
  //initialize the Google Sheets DB
  await db.load();
  const sheet = db.getSheetByTitle("BibleQuotes");

  //get next Bible Quote from Google sheets DB
  const bibleQuote = await getNextBibleQuote(sheet);
  if (!bibleQuote || !bibleQuote.text || !bibleQuote.rowObj) {
    isDevMode && console.error("error: the bibleQuote for tweet is undefined");
    return;
  }

  //use the twitter API to send the bible quote as new tweet
  await sendTweet(bibleQuote.text);

  //mark quote as sent in DB
  await markQuoteAsSent(bibleQuote.rowObj);
})();

async function getNextBibleQuote(sheet) {
  if (!sheet) {
    isDevMode && console.error("you forgot to provide the sheet reference");
    return;
  }

  //loop through Google sheet rows until finding next quote
  let rowObj, quote, verse, finalText;
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row["IS_SENT"] !== "TRUE") {
      rowObj = row;
      quote = row["BIBLE QUOTE"];
      verse = row["VERSE"];
      finalText = `${quote} (${verse})`;
      break;
    }
  }

  const bibleQuote = {
    rowObj: rowObj,
    text: finalText,
  }

  return bibleQuote;
}

async function sendTweet(text) {
  if (!text) {
    isDevMode && console.error("text is undefined while trying to send the tweet");
    return;
  }
  //send the tweet with their API
  return await twitterClient.post('statuses/update', {status: text})
}

async function markQuoteAsSent(rowObj) {
  if (!rowObj || typeof rowObj !== "object") {
    isDevMode && console.error("you forgot to provide the rowObj reference");
    return;
  }

  rowObj["IS_SENT"] = "TRUE";
  await rowObj.save();
}