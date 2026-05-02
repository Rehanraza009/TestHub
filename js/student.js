let currentUser = null;
let subjects = [];
let exams = [];
let userResults = [];
let userData = null;
let questionCounts = {};
let isDarkMode = false;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        database.ref('users/' + user.uid).once('value')
            .then((snapshot) => {
                userData = snapshot.val();
                if (!userData || userData.role !== 'student') {
                    window.location.href = 'index.html';
                } else {
                    initializeDashboard();
                }
            });
    } else {
        window.location.href = 'index.html';
    }
});

function initializeDashboard() {
    console.log('=== initializeDashboard CALLED ===');
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('userAvatar').textContent = userData.name.charAt(0).toUpperCase();
    
    initializeTheme();
    loadAllData();
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        applyDarkMode();
    } else {
        isDarkMode = false;
        applyLightMode();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        applyDarkMode();
        localStorage.setItem('theme', 'dark');
    } else {
        applyLightMode();
        localStorage.setItem('theme', 'light');
    }
}

function applyDarkMode() {
    document.body.style.background = 'linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #1e293b)';
    document.body.style.color = '#e2e8f0';
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').textContent = '☀️';
    }
    
    document.querySelectorAll('.quick-card, .progress-card, .circular-progress-card, .stat-card, .section, .exam-card, .result-card, .profile-card').forEach(el => {
        el.style.background = '#1e293b';
        el.style.color = '#e2e8f0';
    });
    
    document.querySelectorAll('.stat-info h3, .quick-card h3, .progress-card h3, .stats-header h2, .section-header h3, .exam-details h4, .result-details h4, .profile-card h3').forEach(el => {
        el.style.color = '#93c5fd';
    });
    
    document.querySelectorAll('.quick-card p, .stat-info p, .progress-text, .circular-label, .exam-meta span, .result-details p, .exam-date, .profile-item label').forEach(el => {
        el.style.color = '#94a3b8';
    });
}

function applyLightMode() {
    document.body.style.background = 'linear-gradient(-45deg, #f5f7fa, #e0e7ff, #dbeafe, #f5f7fa)';
    document.body.style.color = '';
    if (document.getElementById('themeToggle')) {
        document.getElementById('themeToggle').textContent = '🌙';
    }
    
    document.querySelectorAll('.quick-card, .progress-card, .circular-progress-card, .stat-card, .section, .exam-card, .result-card, .profile-card').forEach(el => {
        el.style.background = 'white';
        el.style.color = '';
    });
    
    document.querySelectorAll('.stat-info h3, .quick-card h3, .progress-card h3, .stats-header h2, .section-header h3, .exam-details h4, .result-details h4, .profile-card h3').forEach(el => {
        el.style.color = '#1e3a8a';
    });
    
    document.querySelectorAll('.quick-card p, .stat-info p, .progress-text, .circular-label, .exam-meta span, .result-details p, .exam-date, .profile-item label').forEach(el => {
        el.style.color = '#64748b';
    });
}

function loadAllData() {
    console.log('=== loadAllData CALLED ===');
    Promise.all([
        database.ref('questions').once('value'),
        database.ref('exams').once('value'),
        database.ref('subjects').once('value'),
        database.ref('results').orderByChild('studentId').equalTo(currentUser.uid).once('value'),
        database.ref('studyMaterial').once('value')
    ]).then(([questionsSnap, examsSnap, subjectsSnap, resultsSnap, studyMaterialSnap]) => {
        console.log('=== Firebase data loaded ===');
        console.log('questionsSnap:', questionsSnap.val());
        console.log('examsSnap:', examsSnap.val());
        console.log('subjectsSnap:', subjectsSnap.val());
        console.log('resultsSnap:', resultsSnap.val());
        console.log('studyMaterialSnap:', studyMaterialSnap.val());
        
        questionCounts = {};
        questionsSnap.forEach((child) => {
            const q = child.val();
            if (!questionCounts[q.subjectId]) {
                questionCounts[q.subjectId] = 0;
            }
            questionCounts[q.subjectId]++;
        });
        
        exams = [];
        if (examsSnap.exists()) {
            examsSnap.forEach((childSnapshot) => {
                exams.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        
        if (exams.length === 0 && subjectsSnap.exists()) {
            subjectsSnap.forEach((child) => {
                exams.push({
                    id: child.key,
                    subjectId: child.key,
                    title: child.val().name + ' Exam',
                    duration: 10,
                    passPercentage: 40,
                    _isSubject: true
                });
            });
        }
        
        userResults = [];
        resultsSnap.forEach((childSnapshot) => {
            userResults.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        userResults.reverse();
        
        let studyMaterial = [];
        if (studyMaterialSnap.exists()) {
            studyMaterialSnap.forEach((childSnapshot) => {
                studyMaterial.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        
        updateDashboardStats();
        renderExams();
        renderResults();
        renderStudyMaterial(studyMaterial);
        
    }).catch((error) => {
        console.error('Error loading data:', error);
    });
}

function updateDashboardStats() {
    const examsAttemptedEl = document.getElementById('examsAttempted');
    if (examsAttemptedEl) examsAttemptedEl.textContent = userResults.length;
    
    const examsAvailableCountEl = document.getElementById('examsAvailableCount');
    if (examsAvailableCountEl) examsAvailableCountEl.textContent = exams.length;
    
    const examsCompletedCountEl = document.getElementById('examsCompletedCount');
    if (examsCompletedCountEl) examsCompletedCountEl.textContent = userResults.length;
    
    const averageScoreEl = document.getElementById('averageScore');
    const averageScoreCardEl = document.getElementById('averageScoreCard');
    
    if (userResults.length > 0) {
        const totalPercent = userResults.reduce((sum, r) => sum + r.percentage, 0);
        const avgPercent = Math.round(totalPercent / userResults.length);
        if (averageScoreEl) averageScoreEl.textContent = avgPercent + '%';
        if (averageScoreCardEl) averageScoreCardEl.textContent = avgPercent + '%';
    }
    
    const pendingExamsEl = document.getElementById('pendingExams');
    if (pendingExamsEl) pendingExamsEl.textContent = Math.max(0, 5 - userResults.length);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        mainContent.style.marginLeft = '280px';
    } else {
        mainContent.style.marginLeft = '0';
    }
}

function showSection(section) {

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(function(el) {
        el.style.display = 'none';
    });

    // Remove active class from sidebar links
    document.querySelectorAll('.sidebar-link').forEach(function(el) {
        el.classList.remove('active');
    });

    // Show selected section
    const sectionEl = document.getElementById(section + '-section');

    if (sectionEl) {
        sectionEl.style.display = 'block';
    }

    // Add active class to clicked sidebar link
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        const clickValue = link.getAttribute('onclick');

        if (clickValue && clickValue.includes("'" + section + "'")) {
            link.classList.add('active');
        }
    });

    // Close sidebar after click
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }

    // Remove overlay
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }

    // Reset main content margin
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginLeft = '0';
    }

    // Scroll page to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function renderExams() {
    console.log('=== renderExams CALLED, exams:', exams.length, exams);
    const colors = ['blue', 'cyan', 'amber'];
    const dashboardExamsHtml = exams.slice(0, 3).map((exam, i) => createExamCard(exam, colors[i % colors.length])).join('');
    const dashboardExamsEl = document.getElementById('dashboardExams');
    if (dashboardExamsEl) {
        dashboardExamsEl.innerHTML = dashboardExamsHtml;
    }
    
    const allExamsHtml = exams.map((exam, i) => createExamCard(exam, colors[i % colors.length])).join('');
    const allExamsEl = document.getElementById('allExams');
    if (allExamsEl) {
        allExamsEl.innerHTML = allExamsHtml;
    }
    
    if (isDarkMode) {
        applyDarkMode();
    }
}

function createExamCard(exam, color) {
    const questionCount = questionCounts[exam.subjectId] || 0;
    const marks = questionCount;
    return `
        <div class="exam-card">
            <div class="exam-info">
                <div class="exam-icon ${color}">📄</div>
                <div class="exam-details">
                    <h4>${exam.title}</h4>
                    <div class="exam-meta">
                        <span>${questionCount} Questions</span>
                        <span>${marks} Marks</span>
                        <span>${exam.duration} Minutes</span>
                    </div>
                </div>
            </div>
            <div class="exam-actions">
                <button class="start-exam-btn" onclick="startExam('${exam.subjectId}', '${exam.id}', ${exam.duration})" ${questionCount === 0 ? 'disabled' : ''}>${questionCount === 0 ? 'No Questions' : 'Start Exam'}</button>
                <div class="exam-date">Pass: ${exam.passPercentage}%</div>
            </div>
        </div>
    `;
}

function renderResults() {
    const dashboardResultsHtml = userResults.slice(0, 2).map(result => createResultCard(result)).join('');
    const dashboardResultsEl = document.getElementById('dashboardResults');
    if (dashboardResultsEl) {
        dashboardResultsEl.innerHTML = dashboardResultsHtml;
    }
    
    const allResultsHtml = userResults.map(result => createResultCard(result)).join('');
    const allResultsEl = document.getElementById('allResults');
    if (allResultsEl) {
        allResultsEl.innerHTML = allResultsHtml;
    }
    
    if (isDarkMode) {
        applyDarkMode();
    }
}

function createResultCard(result) {
    return `
        <div class="result-card">
            <div class="result-info">
                <div class="result-icon">📄</div>
                <div class="result-details">
                    <h4>${result.subjectName}</h4>
                    <p>Completed on ${new Date(result.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
            </div>
            <div class="result-score">
                <span>Score</span>
                <span class="score-value">${result.percentage}%</span>
                <button class="view-result-btn" data-result='${encodeURIComponent(JSON.stringify(result))}'>View Result</button>
            </div>
        </div>
    `;
}

function addViewResultListeners() {
    document.querySelectorAll('.view-result-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resultDataStr = decodeURIComponent(this.getAttribute('data-result'));
            const result = JSON.parse(resultDataStr);
            localStorage.setItem('resultData', JSON.stringify(result));
            window.location.href = 'result.html';
        });
    });
}

const originalRenderExams = renderExams;
renderExams = function() {
    originalRenderExams.apply(this, arguments);
    addViewResultListeners();
};

const originalRenderResults = renderResults;
renderResults = function() {
    originalRenderResults.apply(this, arguments);
    addViewResultListeners();
};

function renderStudyMaterial(studyMaterial) {
    const colors = ['blue', 'cyan', 'amber', 'purple'];
    const typeEmoji = {
        pdf: '📄',
        ppt: '📊',
        word: '📝',
        other: '📁'
    };
    
    const createMaterialCard = (material, index) => {
        return `
            <div class="exam-card" style="animation-delay: ${index * 0.1}s">
                <div class="exam-info">
                    <div class="exam-icon ${colors[index % colors.length]}">${typeEmoji[material.type] || '📁'}</div>
                    <div class="exam-details">
                        <h4>${material.title}</h4>
                        <div class="exam-meta">
                            <span>${material.type.toUpperCase()}</span>
                            <span>${material.description || 'No description'}</span>
                        </div>
                    </div>
                </div>
                <div class="exam-actions">
                    <a href="${material.url}" target="_blank" rel="noopener noreferrer" class="start-exam-btn" style="text-decoration: none; display: inline-block;">View Material</a>
                </div>
            </div>
        `;
    };
    
    const dashboardHtml = studyMaterial.slice(0, 3).map((material, i) => createMaterialCard(material, i)).join('');
    const dashboardEl = document.getElementById('dashboardStudyMaterial');
    if (dashboardEl) {
        dashboardEl.innerHTML = dashboardHtml || '<p style="text-align: center; color: #64748b;">No study material available yet.</p>';
    }
    
    const allHtml = studyMaterial.map((material, i) => createMaterialCard(material, i)).join('');
    const allEl = document.getElementById('allStudyMaterial');
    if (allEl) {
        allEl.innerHTML = allHtml || '<p style="text-align: center; color: #64748b;">No study material available yet.</p>';
    }
    
    if (isDarkMode) {
        applyDarkMode();
    }
}

function startExam(subjectId, examId, duration) {
    localStorage.setItem('examSubjectId', subjectId);
    localStorage.setItem('examId', examId);
    localStorage.setItem('examDuration', duration);
    window.location.href = 'exam.html';
}

function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        });
}

const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        currentUser.updatePassword(newPassword)
            .then(() => {
                alert('Password changed successfully!');
                document.getElementById('changePasswordForm').reset();
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}
// Update Full Profile

