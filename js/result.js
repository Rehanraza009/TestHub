let resultData = JSON.parse(localStorage.getItem('resultData'));
let questions = [];

if (resultData) {
    document.getElementById('subjectName').textContent = resultData.subjectName;
    document.getElementById('score').textContent = `${resultData.score}/${resultData.totalQuestions}`;
    document.getElementById('percentage').textContent = `${resultData.percentage}%`;
    document.getElementById('correctCount').textContent = resultData.score;
    document.getElementById('wrongCount').textContent = resultData.totalQuestions - resultData.score;
    document.getElementById('totalCount').textContent = resultData.totalQuestions;
    
    const passFailDiv = document.getElementById('passFail');
    let passPercent = 40;
    if (resultData.passPercentage) {
        passPercent = resultData.passPercentage;
    }
    if (resultData.percentage >= passPercent) {
        passFailDiv.textContent = '✓ Pass';
        passFailDiv.className = 'pass-fail pass';
    } else {
        passFailDiv.textContent = '✗ Fail';
        passFailDiv.className = 'pass-fail fail';
    }
    
    initializeAnswersReview();
} else {
    window.location.href = 'student.html';
}

function initializeAnswersReview() {
    questions = [];
    if (resultData.questions && resultData.questions.length > 0) {
        questions = resultData.questions;
        displayAnswersReview();
    } else if (resultData.subjectId) {
        database.ref('questions').orderByChild('subjectId').equalTo(resultData.subjectId).once('value')
            .then((snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    questions.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                displayAnswersReview();
            });
    }
}

function displayAnswersReview() {
    const container = document.getElementById('answersReview');
    container.innerHTML = '<h3 style="color: #1e40af; margin-bottom: 20px;">📝 Answer Review</h3>';
    
    questions.forEach((q, index) => {
        let userAnswer = null;
        if (resultData.answers && resultData.answers[q.id]) {
            userAnswer = resultData.answers[q.id];
        } else if (resultData.correctAnswers) {
            const ca = resultData.correctAnswers.find(a => a.id === q.id);
            if (ca) {
                userAnswer = ca.userAnswer;
            }
        }
        
        const isCorrect = userAnswer === q.correctAnswer;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        
        let optionsHtml = '';
        ['A', 'B', 'C', 'D'].forEach(opt => {
            let optionClass = '';
            if (opt === q.correctAnswer) {
                optionClass = 'correct';
            } else if (opt === userAnswer && !isCorrect) {
                optionClass = 'wrong';
            }
            
            optionsHtml += `
                <div class="option ${optionClass}">
                    ${opt}) ${q['option' + opt]}
                </div>
            `;
        });
        
        questionDiv.innerHTML = `
            <div class="question-number">
                Question ${index + 1} - ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            <div class="question-text">${q.question}</div>
            <div class="options">${optionsHtml}</div>
            <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 8px;">
                <strong>Your Answer:</strong> ${userAnswer || 'Not answered'} | 
                <strong>Correct Answer:</strong> ${q.correctAnswer}
            </div>
        `;
        container.appendChild(questionDiv);
    });
}
