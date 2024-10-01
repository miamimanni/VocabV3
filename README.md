# Spelling Practice Application

This is a web-based spelling practice application designed to help users improve their spelling skills by allowing them to input words and definitions, practice spelling them, and match words to their corresponding definitions.
Useable site is accessible here https://miamimanni.github.io/VocabV3/

Please note this is for my little one. I understand curiosity. However, I implore you to fork the project and deploy it on your own account with a different google app script url if you want to play with it.

## Features

- **Default Word Input**: Default words are loaded opening of the webpage. It does a GET API Request to a serverless Google Apps Script, this is attached to a Google Sheet which returns the words.
- **Word Input**: Users can input words and their definitions in a `word | definition` format.
- **Select Words for Practice**: Allows user to specify specific words to to practice on. If you already know a word, you can uncheck it so it doesn't prompt you during the spelling or word definition matching exercises
- **Spelling Practice**: Practice spelling the words with instant feedback. Users can select "Hard Mode" to hide hints and feedback during the session.
- **Speech Functionality**: The application can speak the word at normal speed or slowly, using a selected voice from the available web browser / client voices.
- **Word-Definition Matching**: After the spelling phase, users can match words to their correct definitions.
- **Summary**: At the end of the session, a summary is shown with the user's results, including the score, correct and incorrect answers, and overall grade.
- **Persisted Settings**: The selected words and settings are stored locally, so users can resume from where they left off if they wish to start over according to their preferences.

## Installation

This is for local runs only

### Prerequisites
You need a browser that supports JavaScript and the SpeechSynthesis API for the text-to-speech functionality. All browsers support this as of 2024.

### How to Install / Run Locally

1. Clone the repository or download the zip file.
   ```bash
   git clone https://github.com/your-username/spelling-practice.git
   ```
2. Open the `index.html` file in your preferred browser.

### Hosting on GitHub Pages

To host this application on GitHub Pages:

1. Push your code to a GitHub repository.
2. In the GitHub repository settings, enable GitHub Pages and select the branch with the `index.html` file.
3. Visit the provided GitHub Pages link to access the application. The url should be https://<github username>.github.io/<Repository Name>/

## How to Use

1. **Enter Words and Definitions**: On the start page, enter the words and their corresponding definitions in the format: `word | definition`. Note, default words will load from Serverless Google Apps Script (source Google Sheet).
2. **Select Words and Mode**: In the dashboard, select the words you want to practice and optionally enable Hard Mode (which hides feedback).
3. **Practice Spelling**: Try spelling the words, and get feedback for each attempt.
   - Use the "Replay Word" button to hear the word again, or "Speak Slowly" to hear it at a slower pace.
4. **Matching Phase**: After the spelling phase, match the words to their correct definitions.
5. **View Summary**: After all words have been completed, view the summary of your results, including score, grade, and performance in the spelling and matching sections. This also sends a POST request with stats and result data to a API hosted via serverless Google Apps Script attached to a Google Sheet which feeds into a log sheet, each row has all completed attempts.

## File Structure

```plaintext
.
├── index.html         # Main HTML file
├── styles.css         # CSS file for styling the application
└── script.js          # JavaScript file for handling functionality and logic
```

## Technologies Used

ChatGPT was used to generate a lot of the code

- **HTML5**: Structure of the web page.
- **CSS3**: Styling of the web page.
- **JavaScript**: Logic and interactivity, including text-to-speech and data persistence.

## Customization

Feel free to modify the code to fit your specific needs:
- **Adding More Words**: You can update the word list in the `index.html` or dynamically via JavaScript.
- **Styling**: Update the `styles.css` file to customize the look and feel of the application.
- **Backend Integration**: The application uses local storage for persisting user choices, but you can connect it to a backend for saving user data or scores across sessions.

## Google App Script / Google Sheet

Google Sheet workbook consists of several sheets
* **log**: Each row has all completed attempts including datetime, test score, grade, amount correct, amount incorrect, total questions (spelling + matching), mode (easy or hard), as well as an arbitrary amount of result columns for spelling and matching data.
* **old_words**: Words and definitions that were set as current but are no longer
* **current_words**: Words and definitions that feed as default words to this static webpage app. GET API requests to serverless Google Apps Script will return all entries from this sheet in a JSON format. Format is as follows
```
[
    {"word": "word1", definition: "definition1"},
    {"word": "word2", definition: "definition2"},
    ...
]
```
* **new_words**: Words and definitions that are next up to be evaluated
* **control_panel**: This allows me to easily manage this Google Sheet from my phone. Contains a special cell A2 which is formatted to be a checkmark. When checkmarked the value of this cell is set to true. In Google Apps script when an edit is detected and it sees cell A2 is set to true on this sheet it performs the following action. 
  * Cuts words from current_words sheet and adds them to old_words sheet
  * Cuts top 7 words from new_words sheet and adds them to current_words sheet
  * Sets value of cell A2 in control_panel sheet back to false

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
