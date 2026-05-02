let currentUser = null;
let questions = [];
let answers = {};
let timer;
let timeLeft = 600;
let currentQuestionIndex = 0;
let tabSwitchCount = 0;
let fullscreenExitCount = 0;
let cameraStream = null;
let cameraActive = false;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        initializeExam();
    } else {
        window.location.href = 'index.html';
    }
});

function initializeExam() {
    const duration = localStorage.getItem('examDuration');
    if (duration) {
        timeLeft = parseInt(duration) * 60;
    }
    
    showFullscreenWarning();
}

function showFullscreenWarning() {
    document.getElementById('fullscreenWarning').style.display = 'flex';
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.getElementById('fullscreenWarning').style.display = 'none';
        startCamera().then(() => {
            if (cameraActive) {
                loadQuestions();
                startTimer();
            }
        });
    } else {
        fullscreenExitCount++;
        if (fullscreenExitCount >= 2) {
            alert('Too many fullscreen exits! Exam will be submitted.');
            submitExam();
        } else {
            alert('Warning: Do not exit fullscreen mode during exam! (' + fullscreenExitCount + '/2)');
            showFullscreenWarning();
        }
    }
});

function startCamera() {
    return new Promise((resolve) => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                cameraStream = stream;
                cameraActive = true;
                const video = document.getElementById('cameraVideo');
                video.srcObject = stream;
                document.getElementById('cameraContainer').style.display = 'block';
                resolve(true);
            })
            .catch((error) => {
                console.log('Camera access denied:', error);
                alert('Camera access is REQUIRED to take this exam. Please allow camera access and try again.');
                cameraActive = false;
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                window.location.href = 'student.html';
                resolve(false);
            });
    });
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabSwitchCount++;
        if (tabSwitchCount >= 2) {
            alert('Too many tab switches! Exam will be submitted.');
            submitExam();
        } else {
            alert('Warning: Do not switch tabs during exam! (' + tabSwitchCount + '/2)');
        }
    }
});

function loadQuestions() {
    const subjectId = localStorage.getItem('examSubjectId');
    if (!subjectId) {
        window.location.href = 'student.html';
        return;
    }

    questions = [];
    
    database.ref('questions').orderByChild('subjectId').equalTo(subjectId).once('value')
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                questions.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            if (questions.length === 0) {
                alert('No questions available for this subject');
                window.location.href = 'student.html';
                return;
            }
            displayCurrentQuestion();
        });
}

function displayCurrentQuestion() {
    const container = document.getElementById('questionsContainer');
    const q = questions[currentQuestionIndex];
    container.innerHTML = '';
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-card';
    questionDiv.innerHTML = `
        <div class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
        <div class="question-text">${q.question}</div>
        <div class="options">
            <div class="option ${answers[q.id] === 'A' ? 'selected' : ''}" onclick="selectAnswer('${q.id}', 'A', this)">
                <input type="radio" name="q${q.id}" value="A" ${answers[q.id] === 'A' ? 'checked' : ''}> A) ${q.optionA}
            </div>
            <div class="option ${answers[q.id] === 'B' ? 'selected' : ''}" onclick="selectAnswer('${q.id}', 'B', this)">
                <input type="radio" name="q${q.id}" value="B" ${answers[q.id] === 'B' ? 'checked' : ''}> B) ${q.optionB}
            </div>
            <div class="option ${answers[q.id] === 'C' ? 'selected' : ''}" onclick="selectAnswer('${q.id}', 'C', this)">
                <input type="radio" name="q${q.id}" value="C" ${answers[q.id] === 'C' ? 'checked' : ''}> C) ${q.optionC}
            </div>
            <div class="option ${answers[q.id] === 'D' ? 'selected' : ''}" onclick="selectAnswer('${q.id}', 'D', this)">
                <input type="radio" name="q${q.id}" value="D" ${answers[q.id] === 'D' ? 'checked' : ''}> D) ${q.optionD}
            </div>
        </div>
    `;
    container.appendChild(questionDiv);
}

function selectAnswer(questionId, answer, element) {
    answers[questionId] = answer;
    const options = element.parentElement.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = 
            `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitExam();
        }
    }, 1000);
}

function submitExam() {
    clearInterval(timer);
    stopCamera();

    let score = 0;

    questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
            score++;
        }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const subjectId = localStorage.getItem('examSubjectId');

    database.ref('subjects/' + subjectId).once('value').then((subjectSnap) => {

        const subjectName = subjectSnap.exists()
            ? subjectSnap.val().name
            : "Unknown Subject";

        database.ref('results').push({
            studentId: currentUser.uid,
            studentName: currentUser.email,
            subjectId: subjectId,
            subjectName: subjectName,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            timestamp: Date.now()
        }).then(() => {

            localStorage.setItem("resultData", JSON.stringify({
                subjectName,
                score,
                totalQuestions,
                percentage
            }));

            window.location.href = "result.html";

        });

    });
}