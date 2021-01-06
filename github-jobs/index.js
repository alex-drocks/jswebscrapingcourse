//index.js
const DB = require("./db/DB");
const fetch = require("node-fetch");

(async function () {
  const isDevMode = true;

  const json = await fetchJSON("https://jobs.github.com/positions.json?description=javascript&location=remote")

  const regex = new RegExp("front", "i");
  const rows = json
    .filter(job => regex.test(job.title))
    .map(job => {
      return {
        "COMPANY": job.company,
        "JOB TITLE": job.title,
        "LOCATION": job.location,
        "DATE": job.created_at,
        "URL": job.url,
      }
    });

  const db = new DB(isDevMode);
  await db.load();
  const sheet = db.getSheetByTitle("GitHubJobs");

  await sheet.addRows(rows);
})();

async function fetchJSON(url) {
  const res = await fetch(url);
  return Array.from(await res.json());
}