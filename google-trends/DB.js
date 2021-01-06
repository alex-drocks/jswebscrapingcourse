//DB.js wrapper class to use Google Sheets Spreadsheet Document as a DB
const { GoogleSpreadsheet } = require("google-spreadsheet");

module.exports = class DB {
  doc = undefined; // Will be a Google Spreadsheet Document that may contain multiple sheets
  isLoaded = false;

  constructor(isDevMode = true) {
    // Instantiates the DB once with the unique Google Spreadsheet document ID.
    // In develop mode, use a document that contains only fake data
    const { googleSheetsIDs } = require("../.configs");
    this.doc = new GoogleSpreadsheet(googleSheetsIDs[isDevMode ? "devSheetID" : "prodSheetID"]);
  }

  async load() {
    if (!this.doc) {
      throw new Error("doc is not defined but it should be at this point");
    }

    // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    const { client_email, private_key } = require("../.configs").gcpCredentials;
    await this.doc.useServiceAccountAuth({ client_email, private_key });

    await this.doc.loadInfo();
    console.log("Loaded Google Spreadsheet Document titled: " + this.doc.title);

    this.isLoaded = true;
  }

  getSheetByTitle(sheetTitle) {
    if (!this.doc) {
      throw new Error("this.doc is not defined");
    } else if (!sheetTitle) {
      throw new Error("sheetTitle is not defined");
    } else if (!this.isLoaded) {
      throw new Error("the DB must be loaded before getting a specific google sheet inside of the doc")
    }

    // returns a Google sheet object that must exist in the current document
    return this.doc.sheetsByTitle[sheetTitle];
  }
};
