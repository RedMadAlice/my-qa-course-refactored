// --- ЛОГІКА ДИНАМІЧНОГО ЗАВАНТАЖЕННЯ (ОНОВЛЕНА ВЕРСІЯ) ---

// Знаходимо всі посилання, які мають завантажувати контент
const contentLinks = document.querySelectorAll('.module-link, .sidebar-module-link');
const heroSection = document.getElementById('hero-section');
const modulesWrapper = document.getElementById('modules-wrapper');

contentLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const target = link.dataset.target; // напр., "practice-1" або "module-6"
        let folder = 'modules'; // Папка за замовчуванням
        let fileName = target;

        // Визначаємо правильну папку на основі префікса
        if (target.startsWith('practice-')) {
            folder = 'practices';
            fileName = target.replace('practice-', 'practice-'); // залишаємо як є
        } else if (target.startsWith('exam-')) {
            folder = 'exams';
            fileName = target.replace('exam-', 'exam-part'); // перетворюємо exam-1 на exam-part1
        }
        
        const fullPath = `${folder}/${fileName}.html`;
        console.log(`Trying to fetch: ${fullPath}`); // Допоміжний лог для дебагінгу

        // Завантажуємо контент модуля з файлу
        fetch(fullPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Файл не знайдено за шляхом: ${fullPath}`);
                }
                return response.text();
            })
            .then(html => {
                modulesWrapper.innerHTML = `<div class="module-container active">${html}</div>`;
                heroSection.style.display = 'none';
                modulesWrapper.style.display = 'block';

                const newModuleElement = modulesWrapper.querySelector('.module-container');
                initializeQuiz(newModuleElement);
                
                
                window.scrollTo(0, 0);
                updateUIVisibility();
            })
            .catch(error => {
                console.error('Помилка завантаження контенту:', error);
                modulesWrapper.innerHTML = `<div class="module-container active"><h1>Незабаром...</h1><p>Цей розділ ще в розробці.</p></div>`;
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


// --- ЛОГІКА ДЛЯ АНІМОВАНОГО ВІДЖЕТУ ---

const blitzQuestionText = document.getElementById('blitz-question-text');
const blitzAnswerInput = document.getElementById('blitz-answer-input');
const blitzSubmitBtn = document.getElementById('blitz-submit-btn');
const animatedBird = document.getElementById('animated-bird');
const animatedSpider = document.getElementById('animated-spider');

let blitzQuestions = [];
let currentBlitzAnswer = "";
let isChecking = false; // Прапорець, щоб уникнути подвійних кліків

function loadNewBlitzQuestion() {
    if (blitzQuestions.length === 0) return;
    
    blitzAnswerInput.value = "";
    blitzAnswerInput.style.borderColor = "";
    blitzAnswerInput.disabled = false;
    blitzSubmitBtn.disabled = false;
    isChecking = false;

    const randomIndex = Math.floor(Math.random() * blitzQuestions.length);
    const randomQuestion = blitzQuestions[randomIndex];
    
    currentBlitzAnswer = randomQuestion.answer.toLowerCase();
    blitzQuestionText.textContent = randomQuestion.question;
}

function checkBlitzAnswer() {
    if (isChecking) return;
    const userAnswer = blitzAnswerInput.value.trim().toLowerCase();
    if (!userAnswer) return;

    isChecking = true;
    blitzAnswerInput.disabled = true;
    blitzSubmitBtn.disabled = true;

    const btnRect = blitzSubmitBtn.getBoundingClientRect();

    // Видаляємо класи перед новою перевіркою
    blitzAnswerInput.classList.remove('correct-answer', 'incorrect-answer');

    if (userAnswer === currentBlitzAnswer) {
        // ПРАВИЛЬНА ВІДПОВІДЬ
        blitzAnswerInput.classList.add('correct-answer'); // <-- ЗМІНЕНО

        animatedBird.style.left = `${btnRect.left + 10}px`;
        animatedBird.style.top = `${btnRect.top + 5}px`;
        animatedBird.classList.add('fly-away');

        setTimeout(() => {
            animatedBird.classList.remove('fly-away');
            loadNewBlitzQuestion();
        }, 2000);

    } else {
        // НЕПРАВИЛЬНА ВІДПОВІДЬ
        blitzAnswerInput.classList.add('incorrect-answer'); // <-- ЗМІНЕНО

        const widgetRect = document.getElementById('blitz-widget').getBoundingClientRect();
        animatedSpider.style.left = `${widgetRect.left + widgetRect.width / 2 - 15}px`;
        animatedSpider.style.top = `${widgetRect.bottom}px`;
        animatedSpider.classList.add('drop-down');

        setTimeout(() => {
            animatedSpider.classList.remove('drop-down');
            isChecking = false;
            blitzAnswerInput.disabled = false;
            blitzSubmitBtn.disabled = false;
        }, 1500);
    }
}

// Завантаження питань з файлу (залишається без змін)
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        blitzQuestions = data;
        loadNewBlitzQuestion();
    })
    .catch(error => {
        console.error("Не вдалося завантажити питання:", error);
        blitzQuestionText.textContent = "Помилка завантаження питань.";
    });

// Обробники подій (залишаються без змін)
blitzSubmitBtn.addEventListener('click', checkBlitzAnswer);
blitzAnswerInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        checkBlitzAnswer();
    }
});

// --- ЛОГІКА ДЛЯ МЕНЮ ЕКЗАМЕНІВ ТА ОНОВЛЕННЯ UI ---

const examsMenuBtn = document.getElementById('exams-menu-btn');
const examsSidebar = document.getElementById('exams-sidebar');
// Важливо: шукаємо посилання тепер всередині нової панелі #exams-sidebar
const examLinks = document.querySelectorAll('#exams-sidebar .exam-link'); 

// Функція, яка керує видимістю кнопок
function updateUIVisibility() {
    const isOnModulePage = heroSection.style.display === 'none';
    
    // Показуємо або ховаємо кнопку-бургер
    if (menuToggle) {
        menuToggle.style.display = isOnModulePage ? 'grid' : 'none';
    }
    // Показуємо або ховаємо кнопку екзаменів
    if (examsMenuBtn) {
        examsMenuBtn.style.display = 'grid'; // Завжди видима
    }
}

// Функція для закриття правої панелі
function closeExamsSidebar() {
    if (examsSidebar) {
        examsSidebar.classList.remove('visible');
    }
}

// Клік на кнопку "Екзамени" (шапочка)
if (examsMenuBtn) {
    examsMenuBtn.addEventListener('click', (e) => {
        // Зупиняємо "спливання" події, щоб клік по кнопці не закрив панель одразу
        e.stopPropagation(); 
        examsSidebar.classList.toggle('visible');
    });
}

// Обробка кліків по посиланнях на екзамени
examLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const examFileName = link.dataset.exam;

        closeExamsSidebar(); // Спочатку закриваємо панель

        // Завантажуємо екзамен з невеликою затримкою, щоб анімація закриття встигла спрацювати
        setTimeout(() => {
            fetch(`exams/${examFileName}.html`)
                .then(response => {
                    if (!response.ok) throw new Error('Файл екзамену не знайдено.');
                    return response.text();
                })
                .then(html => {
                    modulesWrapper.innerHTML = `<div class="module-container active">${html}</div>`;
                    heroSection.style.display = 'none';
                    modulesWrapper.style.display = 'block';
                    window.scrollTo(0, 0);
                    initializeQuiz(modulesWrapper.querySelector('.module-container'));
                    updateUIVisibility();
                })
                .catch(error => {
                    console.error("Помилка завантаження екзамену:", error);
                    modulesWrapper.innerHTML = `<div class="module-container active"><h1>Помилка</h1><p>Не вдалося завантажити екзамен.</p></div>`;
                });
        }, 300); // 300 мілісекунд
    });
});

// Глобальний обробник кліків для закриття панелі при кліку поза нею
document.addEventListener('click', (e) => {
    if (examsSidebar && examsSidebar.classList.contains('visible')) {
        // Перевіряємо, чи клік був не по самій панелі і не по кнопці, яка її викликає
        if (!examsSidebar.contains(e.target) && !examsMenuBtn.contains(e.target)) {
            closeExamsSidebar();
        }
    }
});

// Додай цей рядок в кінець файлу script.js
document.addEventListener('DOMContentLoaded', updateUIVisibility);

// --- ВСТАВТЕ ЦЕЙ НОВИЙ БЛОК В SCRIPT.JS ---

// Обробка кліків по посиланнях на практикуми
const practiceLinks = document.querySelectorAll('#exams-sidebar .practice-link');
practiceLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const practiceFileName = link.dataset.target;

        closeExamsSidebar(); // Закриваємо праву панель

        setTimeout(() => {
            fetch(`practices/${practiceFileName}.html`) // Завантажуємо з папки 'practices'
                .then(response => {
                    if (!response.ok) throw new Error('Файл практики не знайдено.');
                    return response.text();
                })
                .then(html => {
                    modulesWrapper.innerHTML = `<div class="module-container active">${html}</div>`;
                    heroSection.style.display = 'none';
                    modulesWrapper.style.display = 'block';
                    window.scrollTo(0, 0);
                    initializeQuiz(modulesWrapper.querySelector('.module-container'));
                    initializeSolutions(); // <-- ОСЬ ТУТ викликаємо нашу нову функцію 
                    updateUIVisibility();
                })
                .catch(error => {
                    console.error("Помилка завантаження практики:", error);
                    modulesWrapper.innerHTML = `<div class="module-container active"><h1>Незабаром...</h1><p>Цей розділ ще в розробці.</p></div>`;
                });
        }, 300);
    });
});

function initializeSolutions() {
    // Знаходимо всі кнопки-перемикачі на сторінці
    const allToggles = document.querySelectorAll('.solution-toggle');

    allToggles.forEach(toggle => {
        // Додаємо обробник кліку
        toggle.addEventListener('click', () => {
            const container = toggle.closest('.solution-container');
            const icon = toggle.querySelector('i');
            const text = toggle.querySelector('h4');

            // Перемикаємо клас 'open', який і відповідає за показ/приховування
            container.classList.toggle('open');

            // Змінюємо іконку та текст для кращого UX
            if (container.classList.contains('open')) {
                icon.className = 'fa-solid fa-eye-slash';
                // Отримуємо текстовий вузол, щоб змінити лише текст, а не іконку
                text.childNodes[1].nodeValue = ' Сховати рішення'; 
            } else {
                icon.className = 'fa-solid fa-eye';
                text.childNodes[1].nodeValue = ' Показати рішення';
            }
        });
    });
}