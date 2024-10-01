# Spelling Practice Application

This is a web-based spelling practice application designed to help users improve their spelling skills by allowing them to input words and definitions, practice spelling them, and match words to their corresponding definitions.
Useable site is accessible here https://miamimanni.github.io/VocabV3/

Please note this is for my little one. I understand curiosity. However, I implore you to fork the project and deploy it on your own account with a different google app script url if you want to play with it.

## Features

- **Word Input**: Users can input words and their definitions in a `word | definition` format.
- **Spelling Practice**: Practice spelling the words with instant feedback. Users can select "Hard Mode" to hide hints and feedback during the session.
- **Speech Functionality**: The application can speak the word at normal speed or slowly, using a selected voice from the available browser voices.
- **Word-Definition Matching**: After the spelling phase, users can match words to their correct definitions.
- **Summary**: At the end of the session, a summary is shown with the user's results, including the score, correct and incorrect answers, and overall grade.
- **Persisted Settings**: The selected words and settings are stored locally, so users can resume from where they left off.

## Installation

### Prerequisites
You need a browser that supports JavaScript and the SpeechSynthesis API for the text-to-speech functionality.

### How to Install

1. Clone the repository or download the zip file.
   ```bash
   git clone https://github.com/your-username/spelling-practice.git
   ```
2. Open the `index.html` file in your preferred browser.

### Hosting on GitHub Pages

To host this application on GitHub Pages:

1. Push your code to a GitHub repository.
2. In the GitHub repository settings, enable GitHub Pages and select the branch with the `index.html` file.
3. Visit the provided GitHub Pages link to access the application.

## How to Use

1. **Enter Words and Definitions**: On the start page, enter the words and their corresponding definitions in the format: `word | definition`.
2. **Select Words and Mode**: In the dashboard, select the words you want to practice and optionally enable Hard Mode (which hides feedback).
3. **Practice Spelling**: Try spelling the words, and get feedback for each attempt.
   - Use the "Replay Word" button to hear the word again, or "Speak Slowly" to hear it at a slower pace.
4. **Matching Phase**: After the spelling phase, match the words to their correct definitions.
5. **View Summary**: After all words have been completed, view the summary of your results, including score, grade, and performance in the spelling and matching sections.

## File Structure

```plaintext
.
├── index.html         # Main HTML file
├── styles.css         # CSS file for styling the application
└── script.js          # JavaScript file for handling functionality and logic
```

## Technologies Used

- **HTML5**: Structure of the web page.
- **CSS3**: Styling of the web page.
- **JavaScript**: Logic and interactivity, including text-to-speech and data persistence.

## Customization

Feel free to modify the code to fit your specific needs:
- **Adding More Words**: You can update the word list in the `index.html` or dynamically via JavaScript.
- **Styling**: Update the `styles.css` file to customize the look and feel of the application.
- **Backend Integration**: The application uses local storage for persisting user choices, but you can connect it to a backend for saving user data or scores across sessions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
