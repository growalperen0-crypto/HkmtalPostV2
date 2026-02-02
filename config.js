// Firebase Konfigürasyonu
// https://console.firebase.google.com adresinden projenizi oluşturun ve bilgilerinizi aşağıya yapıştırın

const firebaseConfig = {
    apiKey: "AIzaSyCx_gqYkmyQxJQzU7YbNn0ASdiRkn3DQVA",
    authDomain: "hkmtalpost.firebaseapp.com",
    projectId: "hkmtalpost",
    storageBucket: "hkmtalpost.firebasestorage.app",
    messagingSenderId: "480414195773",
    appId: "1:480414195773:web:3c21575bb1ccd5911cca54",
    measurementId: "G-0LFDQ29ENR"
  };

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Auth ve Firestore referanslarını al (window'a da ekle)
window.auth = firebase.auth();
window.db = firebase.firestore();
const auth = window.auth;
const db = window.db;
