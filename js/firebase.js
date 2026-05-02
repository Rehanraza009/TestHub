const firebaseConfig = {
    apiKey: "AIzaSyCTQTEpZTUjDph723-pYEbDBk61hfIgsmU",
    authDomain: "testhub-d56d5.firebaseapp.com",
    databaseURL: "https://testhub-d56d5-default-rtdb.firebaseio.com/",
    projectId: "testhub-d56d5",
    storageBucket: "testhub-d56d5.firebasestorage.app",
    messagingSenderId: "977890685081",
    appId: "1:977890685081:web:4a032c82847e5cfaa6c808"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
