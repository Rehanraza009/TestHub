const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role');

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            database.ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        if (userData.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else if (userData.role === 'student') {
                            window.location.href = 'student.html';
                        } else {
                            alert('Invalid role');
                            auth.signOut();
                        }
                    } else {
                        alert('User data not found');
                        auth.signOut();
                    }
                })
                .catch((error) => {
                    alert(error.message);
                });
        })
        .catch((error) => {
            alert(error.message);
        });
});
