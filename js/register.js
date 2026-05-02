document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                role: role
            })
            .then(() => {
                alert('Registration successful!');
                window.location.href = 'login.html';
            })
            .catch((error) => {
                alert(error.message);
            });
        })
        .catch((error) => {
            alert(error.message);
        });
});
