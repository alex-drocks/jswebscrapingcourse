//DB.js wrapper class to use Google Sheets Spreadsheet Document as a DB
const {GoogleSpreadsheet} = require("google-spreadsheet");

module.exports = {
  db: {
    loadGoogleSheetByTitle: async (title) => {
      let googleSheet;

      const document = _instantiateGoogleSpreadsheetDocument();
      await _loadDocument(document);

      googleSheet = _getSheetByTitle(title, document);

      // Will return a single sheet of a parent Google Spreadsheet.
      return googleSheet;
    }
  }
};

function _instantiateGoogleSpreadsheetDocument() {
  // Instantiates the DB once with the unique Google Spreadsheet document ID.
  const {devSheetID} = require("./.configs").googleSheetsIDs;
  return new GoogleSpreadsheet(devSheetID);
}

async function _loadDocument(docInstance) {
  if (!docInstance) {
    throw new Error("docInstance is not defined but it should be at this point");
  }

  // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  const {client_email, private_key} = require("./.configs").gcpCredentials;
  await docInstance.useServiceAccountAuth({client_email, private_key});

  await docInstance.loadInfo();
  console.log("Loaded Google Spreadsheet Document titled: " + docInstance.title);
}

async function _getSheetByTitle(sheetTitle, docInstance) {
  if (!sheetTitle) {
    throw new Error("sheetTitle is not defined");
  }
  if (!docInstance) {
    throw new Error("docInstance is not defined");
  }

  // returns a Google sheet object that must exist in the current document
  // (note: this is a single sheet in a main Google Spreadsheet document)
  return docInstance.sheetsByTitle[sheetTitle];
}