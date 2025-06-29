// --- ЛОГІКА ДИНАМІЧНОГО ЗАВАНТАЖЕННЯ МОДУЛІВ ---

const moduleLinks = document.querySelectorAll('.module-link');
const heroSection = document.getElementById('hero-section');
const modulesWrapper = document.getElementById('modules-wrapper');

moduleLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const targetModuleId = link.dataset.target;
        const moduleFileName = `${targetModuleId}.html`;

        // Завантажуємо контент модуля з файлу
        fetch(`modules/${moduleFileName}`)
            .then(response => {
                if (!response.ok) { // Якщо файл не знайдено (напр. module8.html ще не створено)
                    throw new Error('Файл модуля ще не створено.');
                }
                return response.text();
            })
            .then(html => {
                // Вставляємо HTML модуля в контейнер
                modulesWrapper.innerHTML = `<div class="module-container active">${html}</div>`;

                // Ховаємо стартовий екран і показуємо обгортку
                heroSection.style.display = 'none';
                modulesWrapper.style.display = 'block';

                // Ініціалізуємо тест для щойно завантаженого контенту
                const newModuleElement = modulesWrapper.querySelector('.module-container');
                initializeQuiz(newModuleElement);
                
                // Прокручуємо сторінку наверх
                window.scrollTo(0, 0);
                updateUIVisibility();
            })
            .catch(error => {
                console.error('Помилка завантаження модуля:', error);
                modulesWrapper.innerHTML = `<div class="module-container active"><h1>Незабаром...</h1><p>Цей модуль ще в розробці.</p></div>`;
                heroSection.style.display = 'none';
                modulesWrapper.style.display = 'block';
                updateUIVisibility();
            });
    });
});

// --- ЛОГІКА ТЕСТІВ (виправлена версія) ---

function initializeQuiz(moduleElement) {
    const quizContainer = moduleElement.querySelector('.quiz-container');
    if (!quizContainer) return;

    const questions = quizContainer.querySelectorAll('.quiz-question');
    const prevButton = quizContainer.querySelector('.prev-question');
    const nextButton = quizContainer.querySelector('.next-question');
    const counter = quizContainer.querySelector('.question-counter');

    if (!prevButton || !nextButton || !counter || questions.length === 0) {
        return;
    }

    let currentQuestionIndex = 0;

    function showQuestion(index) {
        questions.forEach(q => q.classList.remove('active'));
        if (questions[index]) {
            questions[index].classList.add('active');
        }
        counter.textContent = `Питання ${index + 1} / ${questions.length}`;
        prevButton.disabled = index === 0;
        nextButton.disabled = index === questions.length - 1;
    }

    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    questions.forEach(question => {
        if (question.dataset.eventsAttached === 'true') return;
        question.dataset.eventsAttached = 'true';

        const answers = question.querySelectorAll('.answer-btn');
        const explanation = question.querySelector('.explanation');

        answers.forEach(answer => {
            answer.addEventListener('click', () => {
                if (question.dataset.answered === 'true') return;
                question.dataset.answered = 'true';

                const isCorrect = answer.dataset.correct === 'true';

                if (isCorrect) {
                    answer.classList.add('correct');
                } else {
                    answer.classList.add('incorrect');
                    answers.forEach(btn => {
                        if (btn.dataset.correct === 'true') {
                            btn.classList.add('correct');
                        }
                    });
                }
                explanation.style.display = 'block';
            });
        });
    });

    showQuestion(currentQuestionIndex);
}

// --- ЛОГІКА КЕРУВАННЯ БІЧНОЮ ПАНЕЛЛЮ ---
const sidebar = document.getElementById('sidebar-nav');
const menuToggle = document.getElementById('menu-toggle');
const homeLink = document.getElementById('home-link');
const sidebarModuleLinks = document.querySelectorAll('.sidebar-module-link');

function updateUIVisibility() {
    if (heroSection.style.display === 'none') {
        menuToggle.style.display = 'grid';
    } else {
        menuToggle.style.display = 'none';
    }
}

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
});

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    heroSection.style.display = '';
    modulesWrapper.style.display = 'none';
    sidebar.classList.remove('visible');
    updateUIVisibility();
});

sidebarModuleLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        sidebar.classList.remove('visible');
        const targetModuleId = link.dataset.target;
        const mainLink = document.querySelector(`.module-link[data-target="${targetModuleId}"]`);
        if (mainLink) {
            mainLink.click();
        }
    });
});


// --- ЛОГІКА ДЛЯ ВІДЖЕТУ БЛІЦ-ПИТАННЯ ---

const blitzQuestionText = document.getElementById('blitz-question-text');
const blitzAnswerInput = document.getElementById('blitz-answer-input');
const blitzSubmitBtn = document.getElementById('blitz-submit-btn');
const blitzFeedback = document.getElementById('blitz-feedback');

let blitzQuestions = [];
let currentBlitzAnswer = "";

// Функція, яка завантажує нове випадкове питання у віджет
function loadNewBlitzQuestion() {
    if (blitzQuestions.length === 0) {
        blitzQuestionText.textContent = "Не вдалося завантажити питання.";
        return;
    }
    
    // Скидаємо все до початкового стану
    blitzFeedback.textContent = "";
    blitzAnswerInput.value = "";
    blitzAnswerInput.style.borderColor = "";
    blitzAnswerInput.disabled = false;
    blitzSubmitBtn.disabled = false;

    // Вибираємо і показуємо нове питання
    const randomIndex = Math.floor(Math.random() * blitzQuestions.length);
    const randomQuestion = blitzQuestions[randomIndex];
    
    currentBlitzAnswer = randomQuestion.answer.toLowerCase();
    blitzQuestionText.textContent = randomQuestion.question;
}

// Функція для перевірки відповіді
function checkBlitzAnswer() {
    const userAnswer = blitzAnswerInput.value.trim().toLowerCase();

    if (!userAnswer) return; // Нічого не робити, якщо поле пусте

    if (userAnswer === currentBlitzAnswer) {
        blitzFeedback.textContent = "Правильно! Наступне питання...";
        blitzFeedback.style.color = "#96E072";
        blitzAnswerInput.style.borderColor = "#96E072";
        blitzAnswerInput.disabled = true; // Блокуємо поле на час
        blitzSubmitBtn.disabled = true;

        // Автоматично завантажуємо нове питання через 2 секунди
        setTimeout(loadNewBlitzQuestion, 2000); 
    } else {
        blitzFeedback.textContent = "Не зовсім. Спробуй ще раз!";
        blitzFeedback.style.color = "#F58594";
        blitzAnswerInput.style.borderColor = "#F58594";
    }
}

// Завантажуємо питання з файлу і одразу ж показуємо перше
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        blitzQuestions = data;
        loadNewBlitzQuestion(); // <-- Запускаємо вперше
    })
    .catch(error => {
        console.error("Не вдалося завантажити питання:", error);
        blitzQuestionText.textContent = "Помилка завантаження питань.";
    });

// Обробники подій
blitzSubmitBtn.addEventListener('click', checkBlitzAnswer);
blitzAnswerInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        checkBlitzAnswer();
    }
});