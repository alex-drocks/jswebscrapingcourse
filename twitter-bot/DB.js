//twitter-bot/DB.js wrapper class to use Google Sheets Spreadsheet Document as a DB
const {GoogleSpreadsheet} = require("google-spreadsheet");

module.exports = class DB {
  isDevMode = undefined;
  doc = undefined; // Will be a Google Spreadsheet Document that may contain multiple sheets
  isLoaded = false;

  constructor() {
    // Instantiates the DB once with the unique Google Spreadsheet document ID.
    // In develop mode, use a document that contains only fake data
    this.isDevMode = !process.env.IS_DEPLOYED;
    if (this.isDevMode) {
      const {googleSheetsIDs} = require("../db/.configs");
      this.doc = new GoogleSpreadsheet(googleSheetsIDs.devSheetID);
    } else {
      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    }
  }

  async load() {
    if (!this.doc) {
      this.isDevMode && console.log("doc is not defined but it should be at this point");
    }

    // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    if (this.isDevMode) {
      const {client_email, private_key} = require("../db/.configs").gcpCredentials;
      await this.doc.useServiceAccountAuth({client_email, private_key});
    } else {
      await this.doc.useServiceAccountAuth({
        client_email:process.env.GCP_CLIENT_EMAIL,
        private_key:process.env.GCP_PRIVATE_KEY,
      });
    }

    await this.doc.loadInfo();
    this.isDevMode && console.log("Loaded Google Spreadsheet Document titled: " + this.doc.title);

    this.isLoaded = true;
  }

  getSheetByTitle(sheetTitle) {
    if (!this.doc) {
      this.isDevMode && console.log("this.doc is not defined");
    } else if (!sheetTitle) {
      this.isDevMode && console.log("sheetTitle is not defined");
    } else if (!this.isLoaded) {
      this.isDevMode && console.log("the DB must be loaded before getting a specific google sheet inside of the doc")
    }

    // returns a Google sheet object that must exist in the current document
    return this.doc.sheetsByTitle[sheetTitle];
  }
};
