// Quiz answer checking, time limit, results, and reset.
const TOTAL_SECONDS = 10*60;
const PASSING_SCORE = 7;

const answerKey = [
    { name: 'q1', type: 'text', correct: ['hypertext markup language','hyper text markup language'], display: 'HyperText Markup Language' },
    { name: 'q2', type: 'text', correct: ['cascading style sheets', 'cascading stylesheets'], display: 'Cascading Style Sheets' },
    { name: 'q3', type: 'radio', correct: 'Google', display: 'Google' },
    { name: 'q4', type: 'radio', correct: 'Data sent between your browser and a website', display: 'Data sent between your browser and a website' },
    { name: 'q5', type: 'radio', correct: 'Displays web page content', display: 'Displays web page content' },
    { name: 'q6', type: 'checkbox', correct: ['HTML', 'CSS', 'JavaScript'], display: "HTML, CSS, and JavaScript" },
    { name: 'q7', type: 'radio', correct: 'Making pages interactive', display: 'Making pages interactive' },
    { name: 'q8', type: 'radio', correct: 'NCSA Mosaic', display: 'NCSA Mosaic' },
    { name: 'q9', type: 'radio', correct: 'Open multiple pages in one browser window', display: 'Open multiple pages in one browser window' },
    { name: 'q10', type: 'radio', correct: 'Save copies of site resources for faster loading', display: 'Save copies of site resources for faster loading' }
];

const form = document.getElementById('quiz-form');
const timerDisplay = document.getElementById('timer');
const results = document.getElementById('results');
const feedback = document.getElementById('answer-feedback');
const submitButton = document.getElementById('submit-btn');
const resetButton = document.getElementById('reset-btn');
let startedAt;
let timerId;
let finished = false;

function formatTime(seconds) {
    const minutes = Math.floor(seconds/60);
    const remainder = seconds%60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function elapsedSeconds() {
    return Math.min(TOTAL_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
}

function updateTimer() {
    const remaining = Math.max(0, TOTAL_SECONDS - elapsedSeconds());
    timerDisplay.textContent = formatTime(remaining);
    if (remaining === 0 && !finished) {
        submitQuiz();
    }
}

function normalize(text) {
    return text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/g, '');
}

function getAnswer(question) {
    if (question.type === 'text') {
        return form.elements[question.name].value.trim();
    }
    const checked = Array.from(form.querySelectorAll(`input[name="${question.name}"]:checked`))
        .map(input => input.value);
    return question.type === 'checkbox' ? checked : (checked[0] || '');
}

function isCorrect(question, answer) {
    if (question.type === 'text') {
        return question.correct.includes(normalize(answer));
    }
    if (question.type === 'checkbox') {
        return answer.length === question.correct.length &&
            question.correct.every(value => answer.includes(value));
    }
    return answer === question.correct;
}


function addFeedback(questionNumber, question, answer, correct) {
    const item = document.createElement('li');
    item.className = correct ? 'answer-correct' : 'answer-incorrect';
    const heading = document.createElement('strong');
    heading.textContent = `Question ${questionNumber}: ${correct ? 'Correct' : 'Incorrect'} — ${correct ? 1 : 0}/1 point`;
    const yourAnswer = document.createElement('p');
    const displayedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
    yourAnswer.textContent = `Your answer: ${displayedAnswer || '(No answer)'}`;
    const correctAnswer = document.createElement('p');
    correctAnswer.textContent = `Correct answer: ${question.display}`;
    item.append(heading, yourAnswer, correctAnswer);
    feedback.appendChild(item);
}

function submitQuiz() {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    updateTimer();

    let score = 0;
    feedback.replaceChildren();
    answerKey.forEach((question, index) => {
        const answer = getAnswer(question);
        const correct = isCorrect(question, answer);
        if (correct) score++;
        addFeedback(index + 1, question, answer, correct);
    });

    const passed = score >= PASSING_SCORE;
    const overall = document.getElementById('overall-result');
    overall.textContent = passed ? 'PASS' : 'FAIL';
    overall.className = passed ? 'result-pass' : 'result-fail';
    document.getElementById('total-score').textContent = `Total score: ${score}/10 (${score*10}%)`;
    document.getElementById('time-spent').textContent = `Time spent: ${formatTime(elapsedSeconds())}`;
    results.hidden = false;

    //Stop answers from being changed after submitting
    form.querySelectorAll('input').forEach(input => {input.disabled = true;});
    submitButton.disabled = true;
    results.focus();
    results.scrollIntoView({behavior: 'smooth', block: 'start'});
}

function startQuiz() {
    clearInterval(timerId);
    form.reset();
    form.querySelectorAll('input').forEach(input => {input.disabled = false;});
    submitButton.disabled = false;
    feedback.replaceChildren();
    results.hidden = true;
    finished = false;
    startedAt = Date.now();
    timerDisplay.textContent = '10:00';
    timerId = setInterval(updateTimer, 250);
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitQuiz();
});
resetButton.addEventListener('click', startQuiz);
startQuiz();