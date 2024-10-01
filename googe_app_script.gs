function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('current_words');
  const data = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues(); // Fetch words and definitions from columns A and B

  let wordsAndDefinitions = data.map(row => {
    return {
      word: row[0],
      definition: row[1]
    };
  });

  return ContentService.createTextOutput(JSON.stringify(wordsAndDefinitions))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    // Get the encoded payload from the request
    const encodedData = e.parameter.data;

    // Decode the base64 string
    const decodedData = Utilities.base64Decode(encodedData);

    // Convert byte array to string
    const jsonData = Utilities.newBlob(decodedData).getDataAsString();

    // Parse the JSON string into an object
    const data = JSON.parse(jsonData);
  // var data = JSON.parse(e.postData.contents);

  // Extract primary data
  var currentDateTime = new Date();
  var score = data.Score;
  var grade = data.Grade;
  var correct = data.Correct;
  var incorrect = data.Incorrect;
  var total = data.Total;
  var mode = data.Mode;

  // Flatten the results array
  var flattenedResults = [];

  // Prepare the row
  var row = [currentDateTime, score, grade, correct, incorrect, total, mode].concat(data.Results).concat(data.MatchResults);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('log');
  sheet.appendRow(row);

  var returnValue = ContentService.createTextOutput(JSON.stringify({"result": "success YES"}))
  .setMimeType(ContentService.MimeType.JSON);

  return returnValue;
}

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;

  // Check if the edited cell is C2 and the value is true (checkmark)
  if (sheet.getName() === 'control_panel' && range.getA1Notation() === 'A2' && e.value === 'TRUE') {
    moveWords();  // Call the moveWords function
  }
}

function moveWords(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var newWordsSheet = spreadsheet.getSheetByName('new_words');
  var newWordRange = newWordsSheet.getRange("1:7");

  var currentWordsSheet = spreadsheet.getSheetByName('current_words');
  var currentWordRange = currentWordsSheet.getRange("1:7");

  var oldWordsSheet = spreadsheet.getSheetByName('old_words');
  var oldWordRange = oldWordsSheet.getRange("1:7");

  oldWordsSheet.insertRowsBefore(1,7); // insert 7 rows at top row

  oldWordRange.setValues(currentWordRange.getValues());
  currentWordRange.setValues(newWordRange.getValues());
  newWordsSheet.deleteRows(1,7);

  var controlPanelSheet = spreadsheet.getSheetByName('control_panel');
  controlPanelSheet.getRange("A2").setValue(false);
}
