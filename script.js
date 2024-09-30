let words = [];
let definitions = [];
let selectedWords = [];
let selectedDefinitions = [];
let currentWordIndex = 0;
let currentWord = "";
let userAttempt = "";
let results = [];
let matchResults = [];
let hardMode = false;
let voices = [];
// Touch event handlers for mobile
let draggedElement = null;
let selectedVoice = null;
let selectedWordIndex = null; // Keep track of the currently selected word
const googleApiURL = 'https://script.google.com/macros/s/AKfycbzZ-Nx4rizxkorJ2YKJu8vIEoK8v0dkeh-ZsN9IZZJfXsnktfhoKxmOn9uCalGY6iuc/exec';

function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    voices = voices.filter(voice => voice.lang.toLowerCase().includes('en'));
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });

    let defaultVoiceIndex = voices.findIndex(voice => voice.name.toLowerCase().includes('samantha'));
    if (defaultVoiceIndex === -1) {
        defaultVoiceIndex = voices.findIndex(voice => voice.name.toLowerCase().includes('kathy'));
        if (defaultVoiceIndex === -1) {
            defaultVoiceIndex = 0;
        }
    }
    voiceSelect.selectedIndex = defaultVoiceIndex;
    selectedVoice = voices[defaultVoiceIndex];
}

function showDashboard() {
    setHeader();
    const wordsInput = document.getElementById('words').value.trim();
    if (wordsInput === "") return;
    const wordLines = wordsInput.split('\n');
    words = wordLines.map(line => line.split('|')[0].trim());
    definitions = wordLines.map(line => line.split('|')[1].trim());
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';

    selectedWords = JSON.parse(localStorage.getItem('selectedWords')) || [];
    hardMode = JSON.parse(localStorage.getItem('hardMode')) || false;

    if (selectedWords.length === 0) {
        selectedWords = [...words];
        selectedDefinitions = [...definitions];
        localStorage.setItem('selectedWords', JSON.stringify(selectedWords));
    }

    words.forEach((word, index) => {
        const label = document.createElement('label');
        const checked = selectedWords.includes(word);
        label.innerHTML = `<input type="checkbox" id="word-${index}" ${checked ? 'checked' : ''}> ${word}`;
        wordList.appendChild(label);
        // wordList.appendChild(document.createElement('br'));
    });

    document.getElementById('hard-mode').checked = hardMode;

    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
}

function startPractice() {
    setHeader();
    selectedWords = words.filter((word, index) => document.getElementById(`word-${index}`).checked);
    selectedDefinitions = definitions.filter((def, index) => document.getElementById(`word-${index}`).checked);
    hardMode = document.getElementById('hard-mode').checked;

    localStorage.setItem('selectedWords', JSON.stringify(selectedWords));
    localStorage.setItem('hardMode', JSON.stringify(hardMode));

    if (selectedWords.length === 0) return;
    currentWordIndex = 0;
    results = [];
    showSpellCheck();
}

function showSpellCheck() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('spell-check').style.display = 'block';
    enableButtons();
    loadNextWord();
}

function loadNextWord() {
    setHeader();
    if (currentWordIndex >= selectedWords.length) {
        showMatchingPhase(); // Show matching phase before summary
        return;
    }
    currentWord = selectedWords[currentWordIndex];
    userAttempt = "";
    document.getElementById('prompt').innerText = `Word ${currentWordIndex + 1}:`;
    document.getElementById('prompt2-hint').innerText = `${currentWord.replace(/./g, '_ ')}`;
    document.getElementById('user-input').value = '';
    document.getElementById('no-matter-what-feedback').innerHTML = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('stats').innerHTML = '';
    document.getElementById('prompt2-hint').style.display = hardMode ? 'none' : 'block';
    document.getElementById('feedback').style.display = hardMode ? 'none' : 'block';
    document.getElementById('stats').style.display = hardMode ? 'none' : 'block';
    setTimeout(speakWord, 500);
}

function speakWord() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.voice = selectedVoice;
    utterance.rate = 0.5;
    speechSynthesis.speak(utterance);
}

function speakWordSlow() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.voice = selectedVoice;
    utterance.rate = 0.1;
    speechSynthesis.speak(utterance);
}

function checkSpelling() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    const correctWord = currentWord.toLowerCase();
    userAttempt = userInput;
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';

    for (let i = 0; i < userInput.length; i++) {
        const span = document.createElement('span');
        span.innerText = userInput[i];
        if (userInput[i] === correctWord[i]) {
            span.className = 'correct';
        } else {
            span.className = 'incorrect';
        }
        feedback.appendChild(span);
    }

    // Display stats
    const totalLetters = correctWord.length;
    const lettersRemaining = totalLetters - userInput.length;
    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <p>Total letters: ${totalLetters}</p>
        <p>Letters typed: ${userInput.length}</p>
        <p>Letters remaining: ${lettersRemaining}</p>
    `;

    // Enable submit button only if at least one letter is typed
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = userInput.length === 0;
}

function submitWord() {
    setHeader();
    disableButtons();

    const userInput = document.getElementById('user-input').value.toLowerCase();
    const correctWord = currentWord.toLowerCase();
    userAttempt = userInput;

    let feedbackText = "";
    if (userInput === correctWord) {
        feedbackText = "Correct!";
    } else {
        feedbackText = `Incorrect! Correct spelling: ${currentWord}`;
    }

    const feedback = document.getElementById('no-matter-what-feedback');
    feedback.innerHTML = feedbackText;

    results.push({
        word: currentWord,
        userAttempt: userAttempt,
        correct: userInput === correctWord
    });

    currentWordIndex++;
    setTimeout(() => {
        loadNextWord();
        setTimeout(enableButtons, 2000); // Enable buttons after new word is loaded with 2-second delay
    }, 1000); // 1-second delay before loading the next word
}

function disableButtons() {
    const buttons = document.querySelectorAll('#spell-check button');
    buttons.forEach(button => button.disabled = true);
}

function enableButtons() {
    const buttons = document.querySelectorAll('#spell-check button');
    buttons.forEach(button => button.disabled = false);
    if (document.getElementById('user-input').value.length === 0) {
        document.getElementById('submit-button').disabled = true; // Initially disable submit button
    } else {
        document.getElementById('submit-button').disabled = false;
    }
}

function getGrade(score) {
    switch (true) {
        case score >= 90:
        return "A";
        case score >= 80:
        return "B";
        case score >= 70:
        return "C";
        case score >= 60:
        return "D";
        default:
        return "F";
    }
}
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    let progressBar = document.getElementById('progress-bar');
    let progress = 0;

    let interval = setInterval(() => {
        progress += 1;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 1); // Adjust the interval for desired speed
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Matching phase for drag-and-drop word to definition
function showMatchingPhase() {
    const matchContainer = document.getElementById('match-container');

    const wordList = document.getElementById('match-word-list');
    wordList.innerHTML = '';

    selectedWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.innerText = word;
        wordDiv.className = 'tap-word';
        wordDiv.id = `tapWord-${index}`;
        wordDiv.style.pointerEvents = 'auto';

        // Add click event listener for word selection
        wordDiv.addEventListener('click', () => selectWord(index));

        wordList.appendChild(wordDiv);
    });

    const definitionList = document.getElementById('match-definition-list');
    definitionList.innerHTML = '';
    let newSelectedDefinitions = selectedDefinitions.map((definition, index) => {
        return { definition: definition, index: index };
    });
    shuffleArray(newSelectedDefinitions);
    newSelectedDefinitions.forEach(({ definition, index }) => {
        const defDiv = document.createElement('div');
        defDiv.innerText = definition;
        defDiv.className = 'tap-definition';
        defDiv.id = `definition-${index}`;

        // Add click event listener for definition selection
        defDiv.addEventListener('click', () => selectDefinition(index));

        definitionList.appendChild(defDiv);
    });

    document.getElementById('spell-check').style.display = 'none';
    matchContainer.style.display = 'block';
}

// Function to handle word selection
function selectWord(index) {
    // Deselect any previously selected word
    if (selectedWordIndex !== null) {
        document.getElementById(`tapWord-${selectedWordIndex}`).style.backgroundColor = '';
    }

    // Set the new selected word and highlight it
    selectedWordIndex = index;
    document.getElementById(`tapWord-${index}`).style.backgroundColor = 'yellow';
}

// Function to handle definition selection
function selectDefinition(defIndex) {
    if (selectedWordIndex === null) return; // No word is selected

    const correctDefIndex = selectedWordIndex;
    const selectedWordDiv = document.getElementById(`tapWord-${selectedWordIndex}`);
    const selectedDefDiv = document.getElementById(`definition-${defIndex}`);
    const correctDefDiv = document.getElementById(`definition-${correctDefIndex}`);

    if (defIndex === correctDefIndex) {
        // Correct match
        selectedWordDiv.className = 'tap-word correct';
        selectedDefDiv.className = 'tap-definition correct';
        matchResults.push({
            word: selectedWords[selectedWordIndex],
            correct: true,
            selectedDefinition: selectedDefinitions[defIndex],
            correctDefinition: selectedDefinitions[correctDefIndex]
        });
    } else {
        // Incorrect match
        selectedWordDiv.className = 'tap-word incorrect';
        correctDefDiv.className = 'tap-definition incorrect';
        matchResults.push({
            word: selectedWords[selectedWordIndex],
            correct: false,
            selectedDefinition: selectedDefinitions[defIndex], // Incorrect definition
            correctDefinition: selectedDefinitions[correctDefIndex]  // Correct definition
        });
    }

    // Disable further interaction for this word and its correct definition
    selectedWordDiv.style.backgroundColor = ''
    selectedWordDiv.style.pointerEvents = 'none';
    correctDefDiv.style.pointerEvents = 'none';

    selectedWordDiv.style.opacity = '0.5';
    correctDefDiv.style.opacity = '0.5';

    // Reset selectedWordIndex
    selectedWordIndex = null;

    // Check if all matches have been made
    if (matchResults.length >= selectedWords.length) {
        showFinalSummary(); // Call the final summary function when all words are matched
    }
}

function touchStart(event) {
    draggedElement = event.target;
    draggedElement.style.opacity = '0.5'; // Visual feedback during touch drag
}

function touchMove(event) {
    event.preventDefault(); // Prevent default scrolling

    // Get touch coordinates
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Move the dragged element to follow the touch
    draggedElement.style.position = 'absolute';
    draggedElement.style.left = `${touchX - draggedElement.offsetWidth / 2}px`;
    draggedElement.style.top = `${touchY - draggedElement.offsetHeight / 2}px`;
}

function touchEnd(event) {
    // Temporarily hide the dragged element to avoid blocking the drop target detection
    draggedElement.style.visibility = 'hidden';

    // Identify the drop target based on touch location
    const touch = event.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // Restore the visibility of the dragged element
    draggedElement.style.visibility = 'visible';

    // Check if the drop target is a valid definition
    if (dropTarget && dropTarget.classList.contains('drop-target')) {
        dropWord({ target: dropTarget });
    }

    // Reset the dragged element's position and opacity
    draggedElement.style.position = 'static';
    draggedElement.style.opacity = '1'; // Reset visual feedback
    draggedElement = null;
}

function dragStart(event) {
    event.dataTransfer.setData('text', event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function dropWord(event) {
    const wordId = draggedElement ? draggedElement.id : event.dataTransfer.getData('text');
    const wordDiv = document.getElementById(wordId);
    const defDiv = event.target;

    const wordIndex = parseInt(wordId.split('-')[1]);
    const defIndex = parseInt(defDiv.id.split('-')[1]);
    const correctDef = document.getElementById(`definition-${wordIndex}`);

    if (wordIndex === defIndex) {
        // Correct match
        wordDiv.setAttribute('class', 'draggable-word correct');
        wordDiv.style.backgroundColor = 'lightgreen';
        defDiv.style.backgroundColor = 'lightgreen';
        matchResults.push({
            word: selectedWords[wordIndex],
            correct: true,
            selectedDefinition: selectedDefinitions[defIndex],
            correctDefinition: selectedDefinitions[wordIndex]
        });
    } else {
        // Incorrect match
        wordDiv.setAttribute('class', 'draggable-word incorrect');
        wordDiv.style.backgroundColor = 'salmon';
        correctDef.style.backgroundColor = 'salmon';
        matchResults.push({
            word: selectedWords[wordIndex],
            correct: false,
            selectedDefinition: selectedDefinitions[defIndex], // Incorrect definition
            correctDefinition: selectedDefinitions[wordIndex]  // Correct definition
        });
    }
    wordDiv.style.pointerEvents = 'none'
    wordDiv.setAttribute('draggable', 'false');
    wordDiv.style.opacity = '0.5';

    // Check if all words have been matched
    if (matchResults.length >= selectedWords.length) {
        showFinalSummary(); // Call the final summary function when all words are matched
    }
}

function showFinalSummary() {
    setHeader();
    let correctCounter = 0;
    let incorrectCounter = 0;

    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('match-container').style.display = 'none';

    const result = document.getElementById('spellingResults');
    result.innerHTML = '';

    // Display spelling quiz results
    results.forEach(({ word, userAttempt, correct }, index) => {
        const resultItem = document.createElement('div');
        resultItem.style.textAlign = 'left'; // Left justify the result item
        resultItem.innerHTML = correct
            ? `<p>${index + 1}. <span style="color: green;">&#10003;</span> <strong>${word}</strong>: Correct</p>`
            : `<p>${index + 1}. <span style="color: red;">&#10005;</span> <strong>${word}</strong>: Incorrect, you spelled it as <em>${userAttempt}</em></p>`;
        result.appendChild(resultItem);
        correct ? correctCounter++ : incorrectCounter++;
    });

    // Display matching results
    const matchingResults = document.getElementById('matchingResults');
    matchResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.style.textAlign = 'left';
        
        if (result.correct) {
            // Correct match
            resultItem.innerHTML = `<p>${index + 1}. <span style="color: green;">&#10003;</span> <strong>${result.word}</strong>: Correct match</p>`;
        } else {
            // Incorrect match - show both incorrect and correct definitions
            resultItem.innerHTML = `
                <p>${index + 1}. <span style="color: red;">&#10005;</span> <strong>${result.word}</strong>: Incorrect match</p>
                <p>You selected: <em>${result.selectedDefinition}</em></p>
                <p>Correct definition: <em>${result.correctDefinition}</em></p>`;
        }
        result.correct ? correctCounter++ : incorrectCounter++;
        matchingResults.appendChild(resultItem);
    });

    const totalQuestions = results.length + matchResults.length;
    const score = (correctCounter / (totalQuestions)).toFixed(2) * 100;
    const mode = hardMode ? "Hard Mode" : "Easy Mode";
    const grade = getGrade(score);

    const payload = {
        Score: score,
        Grade: grade,
        Correct: correctCounter,
        Incorrect: incorrectCounter,
        Total: totalQuestions,
        Mode: mode,
        Results: results,
        MatchResults: matchResults
    };

    // Create a summary statistics div
    const statsDiv = document.getElementById("summary-stats");
    statsDiv.innerHTML = `<p><strong>Score:</strong> ${score}%, <strong>Grade:</strong> ${grade}, <strong>Correct Answers:</strong> ${correctCounter}, <strong>Incorrect Answers:</strong> ${incorrectCounter}, <strong>Total Questions:</strong> ${totalQuestions}, <strong>Mode:</strong> ${mode}</p>`;

    const jsonPayload = JSON.stringify(payload);
    const encodedData = btoa(jsonPayload);

    showLoading();
    setTimeout(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", googleApiURL, false);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(`data=${encodedData}`);
        hideLoading();
    }, 1000);

    document.getElementById('summary').style.display = 'block';
}

function startOver() {
    setHeader();
    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('match-container').style.display = 'none';
    document.getElementById('words').value = '';

    // Clear selections from localStorage
    localStorage.removeItem('selectedWords');
    localStorage.removeItem('hardMode');

    matchResults = []
}

function setDateTime() {
    // Get current date and time
    let now = new Date();
    let datetime = now.toLocaleString();

    // Insert date and time into HTML
    document.getElementById("datetime").innerHTML = datetime;
}

function setHardModeStatus(){
    document.getElementById("easy-or-hard-mode").innerHTML = hardMode ? "Hard Mode" : "Easy Mode";
}

function setHeader() {
    setDateTime();
    setHardModeStatus();
}

// Update selectedVoice when the dropdown value changes
document.getElementById('voice-selection').addEventListener('change', function() {
    disableButtons();
    selectedVoice = voices[this.value];
    enableButtons();
});

// Load the voices when the page is ready
speechSynthesis.onvoiceschanged = populateVoiceList;

populateVoiceList(); // Call it immediately in case voices are already loaded

setHeader();

function initialPopulateWords(){
    const xhr3 = new XMLHttpRequest();
    xhr3.open('GET', googleApiURL, false);
    xhr3.send();
    let responsePayload = xhr3.response;
    let parsedwordsAndDefinitions = JSON.parse(responsePayload);
    // let wordsOnly = parsedwordsAndDefinitions.map(wordsAndDef => wordsAndDef.word);
    let wordsAndDefs = parsedwordsAndDefinitions.map(wordsAndDef => `${wordsAndDef.word}|${wordsAndDef.definition}`)
    document.getElementById('words').innerHTML = wordsAndDefs.join("\n");
    setTimeout(hideLoading, 2000);
}

showLoading()

initialPopulateWords();
