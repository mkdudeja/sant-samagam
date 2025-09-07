/****************************
 * CONFIGURATION
 ****************************/
const FIRESTORE_PROJECT_ID = "";
const FIRESTORE_API_KEY = "";

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;
const COLLECTION_PHONEBOOK = `${BASE_URL}/phonebook`;
const COLLECTION_LASTSYNCED = `${BASE_URL}/lastsynced`;

const COLUMNS = {
  "id": {},
  "name": {},
  "department": {},
  "designation": {},
  "mobile": {},
  "phone": {},
  "extn": {
    type: "number"
  },
  "location": {},
  "sortOrder": {
    type: "number",
    hidden: true
  },
  "status": {
    type: "number"
  }
};

/****************************
 * MENU SETUP
 ****************************/
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🔥 Firebase")
    .addItem("📖 Read Database", "readDatabase")
    .addItem("⬆️ Update Database", "syncDatabase")
    .addToUi();
}

/****************************
 * READ DATABASE
 ****************************/
function _fetchAllContacts() {
  let url = `${COLLECTION_PHONEBOOK}?pageSize=300&key=${FIRESTORE_API_KEY}`;
  let allDocs = [];
  let pageToken = null;

  do {
    let fullUrl = url + (pageToken ? `&pageToken=${pageToken}` : "");
    let response = UrlFetchApp.fetch(fullUrl);
    let data = JSON.parse(response.getContentText());

    if (data.documents) {
      allDocs = allDocs.concat(data.documents);
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return allDocs.map(doc => {
    const fields = doc.fields;

    const data = {};
    for (let key in fields) {
      data[key] = _getFirestoreValue(fields[key]);
    }

    data.id = doc.name.split("/").pop();
    return data;
  });
}

function readDatabase() {
  // get all contacts
  const allDocs = _fetchAllContacts();

  // Now allDocs contains *all* Firestore docs in that collection
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();

  // Write header row
  const headers = Object.keys(COLUMNS).filter((key) => COLUMNS[key]?.hidden !== true);
  sheet.appendRow(headers);

  if (allDocs.length) {
    allDocs
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(doc => {
        const rowData = [];
        headers.forEach((key) => {
          rowData.push(doc?.[key] || "");
        });
        sheet.appendRow(rowData);
      });
  }
}

/****************************
 * UPDATE DATABASE
 ****************************/
function syncDatabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) return; // no data

  const headers = Object.keys(COLUMNS);
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colIdxMap = new Map();
  const sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  sheetHeaders.forEach((col, index) => {
    colIdxMap.set(col, index)
  });

  // Step 1: build sheetMap dynamically
  const sheetMap = {};
  rows.forEach((row, idx) => {
    const record = {};
    headers.forEach((header) => {
      let value = row[colIdxMap.get(header)];
      if (header === "sortOrder") {
        value = idx + 2;
      }
      record[header] = value;
    });

    // Generate ID if missing (but only commit after DB insert succeeds)
    if (!record.id) {
      record.id = Utilities.getUuid();
    }

    sheetMap[record.id] = record;
  });

  // Step 2: fetch all docs from Firestore
  const docs = _fetchAllContacts();
  const dbMap = docs.reduce((acc, doc) => {
    acc[doc.id] = doc;
    return acc;
  }, {});

  // Step 3: decide inserts/updates/deletes
  const toInsert = [];
  const toUpdate = [];
  const toDelete = [];

  Object.keys(sheetMap).forEach((id, index) => {
    const dbDoc = dbMap[id];
    const sheetDoc = sheetMap[id];

    if (!dbDoc) {
      toInsert.push(sheetDoc);
    } else {
      // check if any field changed
      let changed = false;
      headers.forEach(h => {
        const colType = COLUMNS[h]?.type ?? "string";
        const source = _getColValue(colType, sheetDoc[h]);
        const target = _getColValue(colType, dbDoc[h]);
        if (source !== target) {
          changed = true;
        }
      });
      if (changed) {
        toUpdate.push(sheetDoc);
      }
    }
  });

  Object.keys(dbMap).forEach(id => {
    if (!sheetMap[id]) {
      toDelete.push(id);
    }
  });

  // Step 4: apply batch operations (insert → update sheet ID if success)
  /********* Create contacts *********/
  toInsert.forEach(doc => {
    const uid = _createContact(doc);
    const rowIndex = doc.sortOrder;
    if (uid && rowIndex) {
      sheet.getRange(rowIndex, 1).setValue(uid);
    }
  });

  /********* Update contacts *********/
  toUpdate.forEach(doc => {
    _updateContact(doc.id, doc)
  });

  /********* Delete contacts *********/
  toDelete.forEach(id => _deleteContact(id));

  /********* Refresh lastsynced *********/
  updateLastSynced();
  SpreadsheetApp.getUi().alert("✅ Database upsert completed (insert/update/delete) & lastsynced refreshed!");
}

/****************************
 * CREATE CONTACT
 ****************************/
function _createContact(doc) {
  const url = `${COLLECTION_PHONEBOOK}?key=${FIRESTORE_API_KEY}`;

  const payload = _buildFirestorePayload(doc);

  const resp = UrlFetchApp.fetch(url, {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log("Insert response: " + resp.getResponseCode());

  const result = JSON.parse(resp.getContentText());
  return result.name ? result.name.split("/").pop() : null; // return new doc ID
}

/****************************
 * UPDATE CONTACT
 ****************************/
function _updateContact(id, doc) {
  if (!id) {
    Logger.log("No ID provided for update");
    return;
  }

  const url = `${COLLECTION_PHONEBOOK}/${id}?key=${FIRESTORE_API_KEY}`;
  const payload = _buildFirestorePayload(doc);

  const resp = UrlFetchApp.fetch(url, {
    method: "PATCH",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log("Update " + id + ": " + resp.getResponseCode());
}

/****************************
 * DELETE CONTACT
 ****************************/
function _deleteContact(id) {
  if (!id) return;

  const url = `${COLLECTION_PHONEBOOK}/${id}?key=${FIRESTORE_API_KEY}`;

  const resp = UrlFetchApp.fetch(url, {
    method: "DELETE",
    muteHttpExceptions: true
  });

  Logger.log("Delete " + id + ": " + resp.getResponseCode());
}


/****************************
 * UPDATE LASTSYNCED
 ****************************/
function updateLastSynced() {
  const now = new Date().toISOString();
  const payload = {
    fields: {
      timestamp: { stringValue: now }
    }
  };

  const url = `${COLLECTION_LASTSYNCED}/syncid?key=${FIRESTORE_API_KEY}`;
  const resp = UrlFetchApp.fetch(url, {
    method: "PATCH",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  Logger.log("updateLastSynced: " + resp.getResponseCode());
}

// --- helper: convert sheet row into Firestore payload dynamically
function _buildFirestorePayload(doc) {
  const fields = {};
  Object.keys(doc).forEach(k => {
    const value = doc[k] ?? "";
    if (typeof value === "number") {
      fields[k] = { integerValue: value };
    } else if (typeof value === "boolean") {
      fields[k] = { booleanValue: value };
    } else {
      fields[k] = { stringValue: value.toString() };
    }
  });
  return { fields };
}

function _getFirestoreValue(field) {
  if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
  if (field.doubleValue !== undefined) {
    const num = parseFloat(field.doubleValue);
    return Number.isInteger(num) ? parseInt(num, 10) : num;
  }
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.timestampValue !== undefined) return field.timestampValue;
  return null;
}

function _getColValue(type, value) {
  if (!value) {
    return "";
  }

  if (type === "number") {
    return parseInt(value.toString(), 10);
  }

  return value.toString();
}
