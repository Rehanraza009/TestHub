const firebaseConfig = {
    apiKey: "AIzaSyAtIwHtqhlezHWFUvoDrd63Zot9_vk3ZBQ",
    authDomain: "online-examination-syste-c82c7.firebaseapp.com",
    databaseURL: "https://online-examination-syste-c82c7-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "online-examination-syste-c82c7",
    storageBucket: "online-examination-syste-c82c7.firebasestorage.app",
    messagingSenderId: "259452851401",
    appId: "1:259452851401:web:3a769d19499e04adbf6918"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
