// Genel Değişkenler
let currentUser = null;

// Firebase referanslarını al
function getAuth() {
    return window.auth || firebase.auth();
}

function getDb() {
    return window.db || firebase.firestore();
}

// Sayfa Yükleme - Firebase yüklenmesini bekle
function initApp() {
    console.log('initApp çağrıldı');
    
    // Firebase'in yüklendiğini kontrol et
    if (typeof firebase === 'undefined') {
        console.error('Firebase yüklenmedi!');
        setTimeout(initApp, 100); // 100ms sonra tekrar dene
        return;
    }
    
    const auth = getAuth();
    const db = getDb();
    
    if (!auth || !db) {
        console.error('Auth veya db tanımlı değil!');
        setTimeout(initApp, 100); // 100ms sonra tekrar dene
        return;
    }
    
    console.log('Firebase başarıyla yüklendi');
    
    // Buton event listener'larını ekle
    setupEventListeners();
    
    // Auth durumu dinle
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            showApp();
            loadUserProfile();
            loadPosts();
        } else {
            currentUser = null;
            showLogin();
        }
    });
}

// DOM yüklendiğinde veya sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM zaten yüklü
    initApp();
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Login butonu
    const buttonLogin = document.getElementById('buttonLogin');
    if (buttonLogin) {
        buttonLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login butonu tıklandı');
            login();
        });
    }
    
    // Google Login butonu
    const buttonGoogleLogin = document.getElementById('buttonGoogleLogin');
    if (buttonGoogleLogin) {
        buttonGoogleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Google Login butonu tıklandı');
            loginWithGoogle();
        });
    }
    
    // Register butonu
    const buttonRegister = document.getElementById('buttonRegister');
    if (buttonRegister) {
        buttonRegister.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Register butonu tıklandı');
            register();
        });
    }
    
    // Register linki
    const linkRegister = document.getElementById('linkRegister');
    if (linkRegister) {
        linkRegister.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Register linki tıklandı');
            toggleAuth();
        });
    }
    
    // Login linki
    const linkLogin = document.getElementById('linkLogin');
    if (linkLogin) {
        linkLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login linki tıklandı');
            toggleAuth();
        });
    }
    
    // Logout butonu
    const buttonLogout = document.getElementById('buttonLogout');
    if (buttonLogout) {
        buttonLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout butonu tıklandı');
            logout();
        });
    }
    
    // Share butonu
    const buttonShare = document.getElementById('buttonShare');
    if (buttonShare) {
        buttonShare.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Share butonu tıklandı');
            createPost();
        });
    }
    
    console.log('Event listener\'lar ayarlandı');
}

// Auth Ekranı Değişti
function toggleAuth() {
    console.log('toggleAuth çağrıldı');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    
    if (!loginContainer || !registerContainer) {
        console.error('Container elementleri bulunamadı!');
        return;
    }
    
    loginContainer.classList.toggle('show');
    registerContainer.classList.toggle('show');
    console.log('Ekran değiştirildi');
}

// E-posta ile Giriş
function login() {
    console.log('login fonksiyonu çağrıldı');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('Input elementleri bulunamadı!');
        alert('Form elementleri bulunamadı!');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        showError('Lütfen e-mail ve şifreyi giriniz!');
        return;
    }

    getAuth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Giriş başarılı:', userCredential.user.email);
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        })
        .catch(error => {
            console.error('Giriş hatası:', error);
            let errorMessage = 'Giriş başarısız!';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu e-mail ile kayıtlı kullanıcı bulunamadı.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Şifre yanlış.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-mail adresi.';
            }
            
            showError(errorMessage);
        });
}

// E-posta ile Kayıt
function register() {
    console.log('register fonksiyonu çağrıldı');
    
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    
    if (!nameInput || !emailInput || !passwordInput) {
        console.error('Register input elementleri bulunamadı!');
        alert('Form elementleri bulunamadı!');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Kayıt bilgileri:', { name, email, passwordLength: password.length });

    if (!name || !email || !password) {
        console.log('Boş alan var');
        showError('Lütfen tüm alanları doldurunuz!');
        return;
    }

    if (password.length < 6) {
        console.log('Şifre çok kısa');
        showError('Şifre en az 6 karakter olmalıdır!');
        return;
    }

    console.log('Firebase Auth ile kayıt başlatılıyor...');
    const auth = getAuth();
    
    if (!auth) {
        console.error('Auth bulunamadı!');
        alert('Firebase Auth yüklenemedi. Lütfen sayfayı yenileyin.');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Kullanıcı oluşturuldu:', userCredential.user.uid);
            // Kullanıcı profili güncelle
            return userCredential.user.updateProfile({
                displayName: name
            }).then(() => {
                console.log('Profil güncellendi');
                // Firestore'a kullanıcı bilgisi ekle
                const db = getDb();
                if (!db) {
                    console.error('Firestore bulunamadı!');
                    throw new Error('Firestore yüklenemedi');
                }
                console.log('Firestore\'a kaydediliyor...');
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            console.log('Kayıt tamamen başarılı!');
            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            toggleAuth();
            showSuccess('Kayıt başarılı! Lütfen giriş yapınız.');
        })
        .catch(error => {
            console.error('Kayıt hatası detayları:', error);
            console.error('Hata kodu:', error.code);
            console.error('Hata mesajı:', error.message);
            
            let errorMessage = 'Kayıt başarısız!';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu e-mail adresi zaten kullanılmaktadır.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-mail adresi.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'E-posta/Şifre ile kayıt Firebase Console\'da etkinleştirilmemiş!';
            } else {
                errorMessage = 'Kayıt başarısız: ' + (error.message || error.code || 'Bilinmeyen hata');
            }
            
            alert(errorMessage);
            showError(errorMessage);
        });
}

// Google ile Giriş
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    getAuth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            
            // Firestore'a kullanıcı bilgisi ekle (varsa güncelle)
            getDb().collection('users').doc(user.uid).set({
                name: user.displayName || 'Kullanıcı',
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('Google giriş başarılı:', user.email);
        })
        .catch(error => {
            console.error('Google giriş hatası:', error);
            
            // Popup engellenmişse redirect dene
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                getAuth().signInWithRedirect(provider)
                    .catch(redirectError => {
                        console.error('Redirect hatası:', redirectError);
                        showError('Google giriş başarısız! Lütfen popup engelleyicileri kapatıp tekrar deneyin.');
                    });
            } else if (error.code === 'auth/operation-not-allowed') {
                showError('Google ile giriş Firebase Console\'da etkinleştirilmemiş.');
            } else {
                showError('Google giriş başarısız: ' + (error.message || 'Bilinmeyen hata'));
            }
        });
}

// Redirect sonucunu kontrol et
getAuth().getRedirectResult()
    .then(result => {
        if (result.user) {
            const user = result.user;
            getDb().collection('users').doc(user.uid).set({
                name: user.displayName || 'Kullanıcı',
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    })
    .catch(error => {
        console.error('Redirect sonuç hatası:', error);
    });

// Çıkış Yap
function logout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        getAuth().signOut()
            .then(() => {
                console.log('Çıkış başarılı');
                currentUser = null;
            })
            .catch(error => {
                console.error('Çıkış hatası:', error);
                showError('Çıkış başarısız!');
            });
    }
}

// Kullanıcı Profili Yükle
function loadUserProfile() {
    if (currentUser) {
        document.getElementById('userName').textContent = 
            currentUser.displayName || currentUser.email;
    }
}

// Yeni Gönderi Oluştur
function createPost() {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) {
        showError('Lütfen bir şeyler yazınız!');
        return;
    }

    if (content.length > 500) {
        showError('Gönderi 500 karakterden fazla olamaz!');
        return;
    }

    getDb().collection('posts').add({
        userId: currentUser.uid,
        author: currentUser.displayName || currentUser.email,
        content: content,
        likes: 0,
        likedBy: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Gönderi başarıyla oluşturuldu!');
        document.getElementById('postContent').value = '';
        showSuccess('Gönderi paylaşıldı!');
        loadPosts();
    })
    .catch(error => {
        console.error('Gönderi oluşturma hatası:', error);
        showError('Gönderi oluşturulamadı!');
    });
}

// Gönderileri Yükle
function loadPosts() {
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '<p class="loading">Gönderiler yükleniyor...</p>';

    getDb().collection('posts')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            postsList.innerHTML = '';
            
            if (snapshot.empty) {
                postsList.innerHTML = '<p class="loading">Henüz gönderi yok.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                const isLiked = post.likedBy && post.likedBy.includes(currentUser.uid);
                
                const postElement = createPostElement(post, postId, isLiked);
                postsList.appendChild(postElement);
            });
        }, error => {
            console.error('Gönderiler yüklenirken hata:', error);
            postsList.innerHTML = '<p class="loading">Gönderiler yüklenemedi.</p>';
        });
}

// Post Elemanı Oluştur
function createPostElement(post, postId, isLiked) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString('tr-TR') : 'Bilinmiyor';
    
    let postHTML = `
        <div class="post-header">
            <div>
                <div class="post-author">${escapeHtml(post.author)}</div>
                <div class="post-date">${date}</div>
            </div>
    `;

    // Eğer kendi gönderisi ise sil butonunu göster
    if (post.userId === currentUser.uid) {
        postHTML += `
            <button class="btn btn-secondary" onclick="deletePost('${postId}')" style="width: 100px;">Sil</button>
        `;
    }

    postHTML += `</div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-actions">
            <button class="post-action-btn ${isLiked ? 'liked' : ''}" 
                    onclick="toggleLike('${postId}', ${isLiked})">
                ❤️ Beğen
            </button>
        </div>
        <div class="like-count">${post.likes || 0} kişi beğendi</div>
    `;

    postDiv.innerHTML = postHTML;
    return postDiv;
}

// Beğeni Aç/Kapat
function toggleLike(postId, isCurrentlyLiked) {
    const postRef = getDb().collection('posts').doc(postId);

    if (isCurrentlyLiked) {
        // Beğeniyi kaldır
        postRef.update({
            likes: firebase.firestore.FieldValue.increment(-1),
            likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        }).catch(error => console.error('Beğeni kaldırma hatası:', error));
    } else {
        // Beğen
        postRef.update({
            likes: firebase.firestore.FieldValue.increment(1),
            likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        }).catch(error => console.error('Beğeni ekleme hatası:', error));
    }
}

// Gönderiyi Sil
function deletePost(postId) {
    if (confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
        getDb().collection('posts').doc(postId).delete()
            .then(() => {
                console.log('Gönderi silindi.');
                showSuccess('Gönderi silindi.');
                loadPosts();
            })
            .catch(error => {
                console.error('Gönderi silme hatası:', error);
                showError('Gönderi silinemedi!');
            });
    }
}

// UI Yardımcı Fonksiyonlar
function showLogin() {
    document.getElementById('appContainer').classList.remove('show');
    document.getElementById('loginContainer').classList.add('show');
    document.getElementById('registerContainer').classList.remove('show');
}

function showApp() {
    document.getElementById('appContainer').classList.add('show');
    document.getElementById('loginContainer').classList.remove('show');
    document.getElementById('registerContainer').classList.remove('show');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.app-content') || document.querySelector('.login-box');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    const container = document.querySelector('.app-content') || document.querySelector('.login-box');
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// XSS Koruması
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
