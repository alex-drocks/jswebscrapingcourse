const { GoogleSpreadsheet } = require("google-spreadsheet");
const configs = require("./.configs");

// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet(configs.googleSheets.devTestSheet.id);

(async function () {
  // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  await doc.useServiceAccountAuth({
    client_email: configs.gcpCredentials.client_email,
    private_key: configs.gcpCredentials.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets
  console.log("Loaded Sheets Document titled: " + doc.title);

  const sheet = doc.sheetsByTitle["Fake Data"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
})();
