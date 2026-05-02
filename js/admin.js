let currentUser = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        database.ref('users/' + user.uid).once('value')
            .then((snapshot) => {
                const userData = snapshot.val();
                if (!userData || userData.role !== 'admin') {
                    window.location.href = 'index.html';
                } else {
                    loadStudents();
                    loadSubjects();
                    loadQuestions();
                    loadResults();
                    loadSubjectsForQuestions();
                    loadExams();
                    loadStudyMaterial();
                }
            });
    } else {
        window.location.href = 'index.html';
    }
});

function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        });
}

window.addEventListener('load', () => {
    loadSubjectsForQuestions();
});

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function loadStudents() {
    database.ref('users').orderByChild('role').equalTo('student').on('value', (snapshot) => {
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const student = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td><button class="small danger" onclick="deleteStudent('${childSnapshot.key}')">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

document.getElementById('addStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const password = 'password123';

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                role: 'student'
            })
            .then(() => {
                alert('Student added successfully! Default password: password123');
                document.getElementById('addStudentForm').reset();
            });
        })
        .catch((error) => {
            alert(error.message);
        });
});

function deleteStudent(uid) {
    if (confirm('Are you sure you want to delete this student?')) {
        database.ref('users/' + uid).remove()
            .then(() => {
                alert('Student deleted successfully!');
            });
    }
}

function loadSubjects() {
    database.ref('subjects').on('value', (snapshot) => {
        const tbody = document.querySelector('#subjectTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const subject = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${subject.name}</td>
                <td><button class="small danger" onclick="deleteSubject('${childSnapshot.key}')">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

document.getElementById('addSubjectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;
    database.ref('subjects').push({
        name: name
    })
    .then(() => {
        alert('Subject added successfully!');
        document.getElementById('addSubjectForm').reset();
    });
});

function deleteSubject(key) {
    if (confirm('Are you sure you want to delete this subject?')) {
        database.ref('subjects/' + key).remove()
            .then(() => {
                alert('Subject deleted successfully!');
            });
    }
}

function addSampleSubjects() {
    const sampleSubjects = [
        'Database Management System',
        'Java Programming',
        'Data Structure',
        'Operating System',
        'Web Development'
    ];
    
    let count = 0;
    sampleSubjects.forEach((subjectName) => {
        database.ref('subjects').push({
            name: subjectName
        })
        .then(() => {
            count++;
            if (count === sampleSubjects.length) {
                alert('Sample subjects added successfully!');
            }
        });
    });
}

function addSampleQuestions() {
    database.ref('subjects').once('value', (snapshot) => {
        const subjects = [];
        snapshot.forEach((child) => {
            subjects.push({ id: child.key, name: child.val().name });
        });
        
        if (subjects.length === 0) {
            alert('Please add subjects first!');
            return;
        }
        
        const sampleQuestions = [
            {
                subjectId: subjects.find(s => s.name.includes('Database'))?.id || subjects[0].id,
                question: 'What does SQL stand for?',
                optionA: 'Structured Query Language',
                optionB: 'Simple Question Language',
                optionC: 'Standard Query Library',
                optionD: 'System Query Language',
                correctAnswer: 'A'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Database'))?.id || subjects[0].id,
                question: 'Which of these is a relational database?',
                optionA: 'MongoDB',
                optionB: 'MySQL',
                optionC: 'Redis',
                optionD: 'Cassandra',
                correctAnswer: 'B'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Java'))?.id || subjects[0].id,
                question: 'What is the extension of Java compiled files?',
                optionA: '.java',
                optionB: '.class',
                optionC: '.js',
                optionD: '.py',
                correctAnswer: 'B'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Java'))?.id || subjects[0].id,
                question: 'Which keyword is used to inherit a class in Java?',
                optionA: 'extends',
                optionB: 'implements',
                optionC: 'inherit',
                optionD: 'super',
                correctAnswer: 'A'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Data'))?.id || subjects[0].id,
                question: 'What is the time complexity of Binary Search?',
                optionA: 'O(n)',
                optionB: 'O(log n)',
                optionC: 'O(n²)',
                optionD: 'O(1)',
                correctAnswer: 'B'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Data'))?.id || subjects[0].id,
                question: 'Which data structure uses LIFO principle?',
                optionA: 'Queue',
                optionB: 'Stack',
                optionC: 'Linked List',
                optionD: 'Tree',
                correctAnswer: 'B'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Operating'))?.id || subjects[0].id,
                question: 'What is the purpose of a process scheduler?',
                optionA: 'Manage memory allocation',
                optionB: 'Select which process to run next',
                optionC: 'Handle file systems',
                optionD: 'Manage network connections',
                correctAnswer: 'B'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Operating'))?.id || subjects[0].id,
                question: 'Which of these is a CPU scheduling algorithm?',
                optionA: 'FCFS',
                optionB: 'TCP',
                optionC: 'HTTP',
                optionD: 'FTP',
                correctAnswer: 'A'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Web'))?.id || subjects[0].id,
                question: 'What does HTML stand for?',
                optionA: 'Hyper Text Markup Language',
                optionB: 'High Tech Modern Language',
                optionC: 'Home Tool Markup Language',
                optionD: 'Hyperlinks and Text Markup Language',
                correctAnswer: 'A'
            },
            {
                subjectId: subjects.find(s => s.name.includes('Web'))?.id || subjects[0].id,
                question: 'Which CSS property is used to change text color?',
                optionA: 'text-color',
                optionB: 'font-color',
                optionC: 'color',
                optionD: 'text-style',
                correctAnswer: 'C'
            }
        ];
        
        let count = 0;
        sampleQuestions.forEach((q) => {
            database.ref('questions').push(q)
                .then(() => {
                    count++;
                    if (count === sampleQuestions.length) {
                        alert('Sample questions added successfully!');
                    }
                });
        });
    });
}

function addSampleExams() {
    database.ref('subjects').once('value', (snapshot) => {
        const subjects = [];
        snapshot.forEach((child) => {
            subjects.push({ id: child.key, name: child.val().name });
        });
        
        if (subjects.length === 0) {
            alert('Please add subjects first!');
            return;
        }
        
        const sampleExams = [
            {
                title: 'DBMS Midterm Exam',
                subjectId: subjects.find(s => s.name.includes('Database'))?.id || subjects[0].id,
                duration: 15,
                passPercentage: 40
            },
            {
                title: 'Java Programming Quiz',
                subjectId: subjects.find(s => s.name.includes('Java'))?.id || subjects[0].id,
                duration: 12,
                passPercentage: 40
            },
            {
                title: 'Data Structure Final Exam',
                subjectId: subjects.find(s => s.name.includes('Data'))?.id || subjects[0].id,
                duration: 20,
                passPercentage: 40
            },
            {
                title: 'Operating System Test',
                subjectId: subjects.find(s => s.name.includes('Operating'))?.id || subjects[0].id,
                duration: 18,
                passPercentage: 40
            },
            {
                title: 'Web Development Quiz',
                subjectId: subjects.find(s => s.name.includes('Web'))?.id || subjects[0].id,
                duration: 10,
                passPercentage: 50
            }
        ];
        
        let count = 0;
        sampleExams.forEach((exam) => {
            database.ref('exams').push(exam)
                .then(() => {
                    count++;
                    if (count === sampleExams.length) {
                        alert('Sample exams added successfully!');
                    }
                });
        });
    });
}

function loadSubjectsForQuestions() {
    database.ref('subjects').once('value', (snapshot) => {
        const select1 = document.getElementById('questionSubject');
        const select2 = document.getElementById('examSubject');
        select1.innerHTML = '';
        select2.innerHTML = '';
        
        if (!snapshot.exists() || snapshot.numChildren() === 0) {
            alert('No subjects found! Please add subjects first in the Subjects tab.');
            return;
        }
        
        snapshot.forEach((childSnapshot) => {
            const subject = childSnapshot.val();
            const option1 = document.createElement('option');
            option1.value = childSnapshot.key;
            option1.textContent = subject.name;
            select1.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = childSnapshot.key;
            option2.textContent = subject.name;
            select2.appendChild(option2);
        });
    });
}

function loadQuestions() {
    database.ref('questions').on('value', (snapshot) => {
        const tbody = document.querySelector('#questionTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const question = childSnapshot.val();
            database.ref('subjects/' + question.subjectId).once('value')
                .then((subjectSnapshot) => {
                    const subjectName = subjectSnapshot.val() ? subjectSnapshot.val().name : 'Unknown';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${subjectName}</td>
                        <td>${question.question}</td>
                        <td><button class="small danger" onclick="deleteQuestion('${childSnapshot.key}')">Delete</button></td>
                    `;
                    tbody.appendChild(tr);
                });
        });
    });
}

document.getElementById('addQuestionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectId = document.getElementById('questionSubject').value;
    const question = document.getElementById('questionText').value;
    const optionA = document.getElementById('optionA').value;
    const optionB = document.getElementById('optionB').value;
    const optionC = document.getElementById('optionC').value;
    const optionD = document.getElementById('optionD').value;
    const correctAnswer = document.getElementById('correctAnswer').value;

    database.ref('questions').push({
        subjectId: subjectId,
        question: question,
        optionA: optionA,
        optionB: optionB,
        optionC: optionC,
        optionD: optionD,
        correctAnswer: correctAnswer
    })
    .then(() => {
        alert('Question added successfully!');
        document.getElementById('addQuestionForm').reset();
    });
});

function deleteQuestion(key) {
    if (confirm('Are you sure you want to delete this question?')) {
        database.ref('questions/' + key).remove()
            .then(() => {
                alert('Question deleted successfully!');
            });
    }
}

function loadExams() {
    database.ref('exams').on('value', (snapshot) => {
        const tbody = document.querySelector('#examTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const exam = childSnapshot.val();
            database.ref('subjects/' + exam.subjectId).once('value')
                .then((subjectSnapshot) => {
                    const subjectName = subjectSnapshot.val() ? subjectSnapshot.val().name : 'Unknown';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${exam.title}</td>
                        <td>${subjectName}</td>
                        <td>${exam.duration} min</td>
                        <td>${exam.passPercentage}%</td>
                        <td><button class="small danger" onclick="deleteExam('${childSnapshot.key}')">Delete</button></td>
                    `;
                    tbody.appendChild(tr);
                });
        });
    });
}

document.getElementById('createExamForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('examTitle').value;
    const subjectId = document.getElementById('examSubject').value;
    const duration = parseInt(document.getElementById('examDuration').value);
    const passPercentage = parseInt(document.getElementById('passPercentage').value);

    database.ref('exams').push({
        title: title,
        subjectId: subjectId,
        duration: duration,
        passPercentage: passPercentage,
        createdAt: Date.now()
    })
    .then(() => {
        alert('Exam created successfully!');
        document.getElementById('createExamForm').reset();
    });
});

function deleteExam(key) {
    if (confirm('Are you sure you want to delete this exam?')) {
        database.ref('exams/' + key).remove()
            .then(() => {
                alert('Exam deleted successfully!');
            });
    }
}

function loadResults() {
    database.ref('results').on('value', (snapshot) => {
        const tbody = document.querySelector('#resultTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const result = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${result.studentName}</td>
                <td>${result.subjectName}</td>
                <td>${result.score}/${result.totalQuestions}</td>
                <td>${result.percentage}%</td>
                <td>${new Date(result.timestamp).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function loadSubjectsForStudyMaterial() {
    database.ref('subjects').once('value', (snapshot) => {
        const select = document.getElementById('materialSubject');
        select.innerHTML = '';
        
        if (!snapshot.exists() || snapshot.numChildren() === 0) {
            alert('No subjects found! Please add subjects first in the Subjects tab.');
            return;
        }
        
        snapshot.forEach((childSnapshot) => {
            const subject = childSnapshot.val();
            const option = document.createElement('option');
            option.value = childSnapshot.key;
            option.textContent = subject.name;
            select.appendChild(option);
        });
    });
}

function loadStudyMaterial() {
    database.ref('studyMaterial').on('value', (snapshot) => {
        const tbody = document.querySelector('#studyMaterialTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const material = childSnapshot.val();
            database.ref('subjects/' + material.subjectId).once('value')
                .then((subjectSnapshot) => {
                    const subjectName = subjectSnapshot.val() ? subjectSnapshot.val().name : 'Unknown';
                    const tr = document.createElement('tr');
                    const typeEmoji = {
                        pdf: '📄',
                        ppt: '📊',
                        word: '📝',
                        other: '📁'
                    };
                    tr.innerHTML = `
                        <td>
                            <a href="${material.url}" target="_blank" rel="noopener noreferrer">
                                ${typeEmoji[material.type] || '📁'} ${material.title}
                            </a>
                        </td>
                        <td>${subjectName}</td>
                        <td>${material.type.toUpperCase()}</td>
                        <td>${material.description || '-'}</td>
                        <td><button class="small danger" onclick="deleteStudyMaterial('${childSnapshot.key}')">Delete</button></td>
                    `;
                    tbody.appendChild(tr);
                });
        });
    });
}

document.getElementById('addStudyMaterialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('materialTitle').value;
    const subjectId = document.getElementById('materialSubject').value;
    const type = document.getElementById('materialType').value;
    const url = document.getElementById('materialUrl').value;
    const description = document.getElementById('materialDescription').value;

    database.ref('studyMaterial').push({
        title: title,
        subjectId: subjectId,
        type: type,
        url: url,
        description: description,
        createdAt: Date.now()
    })
    .then(() => {
        alert('Study material added successfully!');
        document.getElementById('addStudyMaterialForm').reset();
    });
});

function deleteStudyMaterial(key) {
    if (confirm('Are you sure you want to delete this study material?')) {
        database.ref('studyMaterial/' + key).remove()
            .then(() => {
                alert('Study material deleted successfully!');
            });
    }
}
