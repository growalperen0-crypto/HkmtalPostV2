// Genel Değişkenler
let currentUser = null;

// Firebase referanslarını al
function getAuth() {
    return window.auth || firebase.auth();
}

function getDb() {
    return window.db || firebase.firestore();
}

function getStorage() {
    return window.storage || firebase.storage();
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
            console.log('Kullanıcı giriş yaptı, ana ekran gösteriliyor');
            // Önce tüm container'ları gizle
            const loginContainer = document.getElementById('loginContainer');
            const registerContainer = document.getElementById('registerContainer');
            if (loginContainer) {
                loginContainer.classList.remove('show');
                loginContainer.style.display = 'none';
            }
            if (registerContainer) {
                registerContainer.classList.remove('show');
                registerContainer.style.display = 'none';
            }
            // Sonra ana ekranı göster
            showApp();
            loadUserProfile();
            loadPosts();
        } else {
            currentUser = null;
            console.log('Kullanıcı çıkış yaptı, giriş ekranı gösteriliyor');
            // Ana ekranı gizle
            const appContainer = document.getElementById('appContainer');
            if (appContainer) {
                appContainer.classList.remove('show');
                appContainer.style.display = 'none';
            }
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
    
    // Toggle işlemi
    if (loginContainer.classList.contains('show') || loginContainer.style.display === 'flex') {
        loginContainer.classList.remove('show');
        loginContainer.style.display = 'none';
        registerContainer.classList.add('show');
        registerContainer.style.display = 'flex';
    } else {
        registerContainer.classList.remove('show');
        registerContainer.style.display = 'none';
        loginContainer.classList.add('show');
        loginContainer.style.display = 'flex';
    }
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
    
    // Loading state
    const button = document.getElementById('buttonGoogleLogin');
    const originalText = button ? button.innerHTML : '';
    if (button) {
        button.disabled = true;
        button.innerHTML = '<span>Yükleniyor...</span>';
    }
    
    getAuth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            
            // Firestore'a kullanıcı bilgisi ekle (varsa güncelle)
            return getDb().collection('users').doc(user.uid).set({
                name: user.displayName || 'Kullanıcı',
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).then(() => {
                console.log('Google giriş başarılı:', user.email);
                showToast('Google ile giriş başarılı!', 'success');
            });
        })
        .catch(error => {
            console.error('Google giriş hatası:', error);
            
            // Button'u eski haline getir
            if (button) {
                button.disabled = false;
                button.innerHTML = originalText;
            }
            
            // Popup engellenmişse redirect dene
            if (error.code === 'auth/popup-blocked') {
                showToast('Popup engellendi! Lütfen popup engelleyicileri kapatıp tekrar deneyin.', 'error');
                // Redirect ile dene
                getAuth().signInWithRedirect(provider)
                    .catch(redirectError => {
                        console.error('Redirect hatası:', redirectError);
                        showToast('Google giriş başarısız! Lütfen popup engelleyicileri kapatıp tekrar deneyin.', 'error');
                    });
            } else if (error.code === 'auth/popup-closed-by-user') {
                showToast('Giriş iptal edildi.', 'info');
            } else if (error.code === 'auth/operation-not-allowed') {
                showToast('Google ile giriş Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Console\'dan etkinleştirin.', 'error');
            } else if (error.code === 'auth/network-request-failed') {
                showToast('İnternet bağlantınızı kontrol edin.', 'error');
            } else {
                showToast('Google giriş başarısız: ' + (error.message || 'Bilinmeyen hata'), 'error');
            }
        });
}

// Redirect sonucunu kontrol et (sayfa yüklendiğinde)
if (typeof getAuth !== 'undefined') {
    getAuth().getRedirectResult()
        .then(result => {
            if (result.user) {
                const user = result.user;
                getDb().collection('users').doc(user.uid).set({
                    name: user.displayName || 'Kullanıcı',
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).then(() => {
                    console.log('Google redirect giriş başarılı:', user.email);
                    showToast('Google ile giriş başarılı!', 'success');
                });
            }
        })
        .catch(error => {
            console.error('Redirect sonuç hatası:', error);
            if (error.code !== 'auth/operation-not-allowed') {
                showToast('Google giriş hatası: ' + error.message, 'error');
            }
        });
}

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

// Kullanıcı Profili Yükle (Navbar için)
function loadUserProfile() {
    if (!currentUser) return;
    
    getDb().collection('users').doc(currentUser.uid).get().then(doc => {
        const name = doc.exists 
            ? (doc.data().name || currentUser.displayName || currentUser.email)
            : (currentUser.displayName || currentUser.email);
        
        // Navbar kullanıcı adı
        const userNameNav = document.getElementById('userNameNav');
        if (userNameNav) userNameNav.textContent = name;
        
        // Navbar avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const initial = name.charAt(0).toUpperCase();
            avatar.textContent = initial;
            if (doc.exists) {
                const user = doc.data();
                avatar.style.background = user.avatarColor || getAvatarColor(currentUser.uid);
            } else {
                avatar.style.background = getAvatarColor(currentUser.uid);
            }
        }
        
        // Creator kullanıcı adı
        const creatorName = document.getElementById('creatorName');
        if (creatorName) creatorName.textContent = name;
        
        // Creator avatar
        const creatorAvatar = document.getElementById('creatorAvatar');
        if (creatorAvatar) {
            const initial = name.charAt(0).toUpperCase();
            creatorAvatar.textContent = initial;
            if (doc.exists) {
                const user = doc.data();
                creatorAvatar.style.background = user.avatarColor || getAvatarColor(currentUser.uid);
            } else {
                creatorAvatar.style.background = getAvatarColor(currentUser.uid);
            }
        }
    }).catch(error => {
        console.error('Kullanıcı profili yükleme hatası:', error);
        // Hata durumunda varsayılan değerler
        const name = currentUser.displayName || currentUser.email;
        const userNameNav = document.getElementById('userNameNav');
        if (userNameNav) userNameNav.textContent = name;
        const creatorName = document.getElementById('creatorName');
        if (creatorName) creatorName.textContent = name;
    });
}

// Yeni Gönderi Oluştur (Fotoğraf desteği ile)
let selectedImageFile = null;

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('Fotoğraf çok büyük! Maksimum 5MB olmalı.', 'error');
            return;
        }
        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImagePreview() {
    selectedImageFile = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('postImageInput').value = '';
}

function updateCharCount() {
    const content = document.getElementById('postContent').value;
    const count = content.length;
    document.getElementById('charCount').textContent = `${count}/500`;
    
    if (count > 450) {
        document.getElementById('charCount').style.color = 'var(--like-active)';
    } else {
        document.getElementById('charCount').style.color = 'var(--text-lighter)';
    }
}

function createPost() {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content && !selectedImageFile) {
        showToast('Lütfen bir şeyler yazın veya fotoğraf ekleyin!', 'error');
        return;
    }

    if (content.length > 500) {
        showToast('Gönderi 500 karakterden fazla olamaz!', 'error');
        return;
    }

    const buttonShare = document.getElementById('buttonShare');
    buttonShare.disabled = true;
    buttonShare.textContent = 'Paylaşılıyor...';

    // Önce fotoğraf varsa yükle
    if (selectedImageFile) {
        const fileName = `posts/${currentUser.uid}/${Date.now()}_${selectedImageFile.name}`;
        const uploadTask = getStorage().ref(fileName).put(selectedImageFile);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                buttonShare.textContent = `Yükleniyor... ${Math.round(progress)}%`;
            },
            (error) => {
                console.error('Fotoğraf yükleme hatası:', error);
                showToast('Fotoğraf yüklenemedi!', 'error');
                buttonShare.disabled = false;
                buttonShare.textContent = 'Paylaş';
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(imageUrl => {
                    savePostToFirestore(content, imageUrl);
                });
            }
        );
    } else {
        savePostToFirestore(content, '');
    }
}

function savePostToFirestore(content, imageUrl) {
    // Hashtag'leri çıkar
    const hashtags = extractHashtags(content);
    
    getDb().collection('posts').add({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        text: content,
        imageUrl: imageUrl,
        hashtags: hashtags,
        likeCount: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Gönderi başarıyla oluşturuldu!');
        document.getElementById('postContent').value = '';
        document.getElementById('charCount').textContent = '0/500';
        removeImagePreview();
        const buttonShare = document.getElementById('buttonShare');
        buttonShare.disabled = false;
        buttonShare.textContent = 'Paylaş';
        showToast('Gönderi paylaşıldı!', 'success');
        loadPosts();
    })
    .catch(error => {
        console.error('Gönderi oluşturma hatası:', error);
        showToast('Gönderi oluşturulamadı!', 'error');
        const buttonShare = document.getElementById('buttonShare');
        buttonShare.disabled = false;
        buttonShare.textContent = 'Paylaş';
    });
}

function extractHashtags(text) {
    const hashtagRegex = /#[\w\u0131\u0130\u011F\u011E\u015F\u015E\u00E7\u00C7\u00F6\u00D6\u00FC\u00DC]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
}

// Gönderileri Yükle
let currentFeedType = 'recent'; // 'recent' veya 'popular'

function showRecentPosts() {
    currentFeedType = 'recent';
    document.getElementById('tabRecent').classList.add('active');
    document.getElementById('tabPopular').classList.remove('active');
    loadPosts();
}

function showPopularPosts() {
    currentFeedType = 'popular';
    document.getElementById('tabRecent').classList.remove('active');
    document.getElementById('tabPopular').classList.add('active');
    loadPosts();
}

function loadPosts() {
    const postsList = document.getElementById('postsList');
    
    // Skeleton loading göster
    postsList.innerHTML = `
        <div class="skeleton-post">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
        <div class="skeleton-post">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `;

    let query = getDb().collection('posts');
    
    if (currentFeedType === 'popular') {
        query = query.orderBy('likeCount', 'desc').orderBy('createdAt', 'desc');
    } else {
        query = query.orderBy('createdAt', 'desc');
    }
    
    query.limit(20).onSnapshot(snapshot => {
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

// Post Elemanı Oluştur (Modern Tasarım)
function createPostElement(post, postId, isLiked) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';

    const date = post.createdAt ? formatDate(post.createdAt.toDate()) : 'Bilinmiyor';
    const userName = post.userName || post.author || 'Kullanıcı';
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(post.userId);
    
    // Hashtag'leri link'e çevir
    let content = escapeHtml(post.text || post.content || '');
    content = linkifyHashtags(content);
    
    let postHTML = `
        <div class="post-header">
            <div class="post-user" onclick="showUserProfile('${post.userId}')">
                <div class="user-avatar-small" style="background: ${avatarColor}">${userInitial}</div>
                <div class="post-user-info">
                    <div class="post-user-name">${escapeHtml(userName)}</div>
                    <div class="post-date">${date}</div>
                </div>
            </div>
            <div class="post-actions-header">
    `;

    // Eğer kendi gönderisi ise düzenle ve sil butonlarını göster
    if (post.userId === currentUser.uid) {
        postHTML += `
            <button class="btn btn-small btn-outline" onclick="editPost('${postId}')" title="Düzenle">✏️</button>
            <button class="btn btn-small btn-outline" onclick="deletePost('${postId}')" title="Sil">🗑️</button>
        `;
    }

    postHTML += `</div></div>
        <div class="post-content">${content}</div>
    `;

    // Fotoğraf varsa göster
    if (post.imageUrl) {
        postHTML += `<img src="${post.imageUrl}" alt="Gönderi" class="post-image" onclick="openImageModal('${post.imageUrl}')">`;
    }

    postHTML += `
        <div class="post-footer">
            <button class="post-action ${isLiked ? 'liked' : ''}" 
                    onclick="toggleLike('${postId}', ${isLiked})">
                <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                <span>${post.likeCount || post.likes || 0}</span>
            </button>
            <button class="post-action" onclick="toggleComments('${postId}')">
                💬 ${post.commentCount || 0}
            </button>
        </div>
        <div id="comments-${postId}" class="comments-section" style="display: none;">
            <div class="comment-input-box">
                <input type="text" id="commentInput-${postId}" placeholder="Yorum yazın..." maxlength="300" onkeypress="if(event.key==='Enter') addComment('${postId}')">
                <button class="btn btn-small btn-primary" onclick="addComment('${postId}')">Gönder</button>
            </div>
            <div id="commentsList-${postId}" class="comments-list"></div>
        </div>
    `;

    postDiv.innerHTML = postHTML;
    return postDiv;
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function linkifyHashtags(text) {
    const hashtagRegex = /#[\w\u0131\u0130\u011F\u011E\u015F\u015E\u00E7\u00C7\u00F6\u00D6\u00FC\u00DC]+/g;
    return text.replace(hashtagRegex, (match) => {
        const tag = match.substring(1);
        return `<a href="#" class="hashtag" onclick="showHashtagPosts('${tag}'); return false;">${match}</a>`;
    });
}

function getAvatarColor(userId) {
    const colors = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Beğeni Aç/Kapat (Animasyonlu)
function toggleLike(postId, isCurrentlyLiked) {
    const postRef = getDb().collection('posts').doc(postId);
    const likeButton = event.target.closest('.post-action');
    
    if (isCurrentlyLiked) {
        // Beğeniyi kaldır
        postRef.update({
            likeCount: firebase.firestore.FieldValue.increment(-1),
            likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        })
        .catch(error => {
            console.error('Beğeni kaldırma hatası:', error);
            showToast('Beğeni kaldırılamadı!', 'error');
        });
    } else {
        // Beğen - Animasyon ekle
        if (likeButton) likeButton.classList.add('liked');
        
        postRef.update({
            likeCount: firebase.firestore.FieldValue.increment(1),
            likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        })
        .then(() => {
            // Post sahibine bildirim gönder (kendisi değilse)
            getDb().collection('posts').doc(postId).get().then(doc => {
                const post = doc.data();
                if (post && post.userId !== currentUser.uid) {
                    const userName = currentUser.displayName || currentUser.email;
                    createNotification(post.userId, 'like', postId, userName);
                }
            });
        })
        .catch(error => {
            console.error('Beğeni ekleme hatası:', error);
            if (likeButton) likeButton.classList.remove('liked');
            showToast('Beğenilemedi! Firestore kurallarını kontrol edin.', 'error');
        });
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
    // Tüm container'ları gizle
    const appContainer = document.getElementById('appContainer');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    
    // Ana uygulama ve register'ı gizle
    if (appContainer) {
        appContainer.classList.remove('show');
    }
    if (registerContainer) {
        registerContainer.classList.remove('show');
    }
    
    // Login'i göster
    if (loginContainer) {
        loginContainer.classList.add('show');
    }
}

function showApp() {
    // Tüm container'ları gizle
    const appContainer = document.getElementById('appContainer');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    
    // Login ve Register'ı gizle
    if (loginContainer) {
        loginContainer.classList.remove('show');
    }
    if (registerContainer) {
        registerContainer.classList.remove('show');
    }
    
    // Ana uygulama container'ını göster
    if (appContainer) {
        appContainer.classList.add('show');
    }
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

// ==================== YORUM SİSTEMİ ====================

// Yorumları Aç/Kapat
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(postId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Yorum Ekle
function addComment(postId, parentCommentId = null) {
    const inputId = parentCommentId ? `replyInput-${parentCommentId}` : `commentInput-${postId}`;
    const input = document.getElementById(inputId);
    const content = input.value.trim();
    
    if (!content) {
        showError('Lütfen yorum yazınız!');
        return;
    }
    
    const commentData = {
        postId: postId,
        userId: currentUser.uid,
        author: currentUser.displayName || currentUser.email,
        content: content,
        parentCommentId: parentCommentId || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        likedBy: []
    };
    
    getDb().collection('comments').add(commentData)
        .then(() => {
            input.value = '';
            
            // Post sahibine bildirim gönder (kendisi değilse)
            getDb().collection('posts').doc(postId).get().then(doc => {
                const post = doc.data();
                if (post && post.userId !== currentUser.uid) {
                    const userName = currentUser.displayName || currentUser.email;
                    createNotification(post.userId, 'comment', postId, userName);
                }
            });
            
            // Post'un commentCount'unu artır
            getDb().collection('posts').doc(postId).update({
                commentCount: firebase.firestore.FieldValue.increment(1)
            });
            
            loadComments(postId);
            showToast('Yorum eklendi!', 'success');
        })
        .catch(error => {
            console.error('Yorum ekleme hatası:', error);
            showToast('Yorum eklenemedi!', 'error');
        });
}

// Yorumları Yükle
function loadComments(postId) {
    const commentsList = document.getElementById(`commentsList-${postId}`);
    commentsList.innerHTML = '<p class="loading">Yorumlar yükleniyor...</p>';
    
    getDb().collection('comments')
        .where('postId', '==', postId)
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
            commentsList.innerHTML = '';
            
            if (snapshot.empty) {
                commentsList.innerHTML = '<p class="loading">Henüz yorum yok.</p>';
                return;
            }
            
            const comments = [];
            snapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            
            // Ana yorumları göster (parentCommentId null olanlar)
            const topLevelComments = comments.filter(c => !c.parentCommentId);
            topLevelComments.forEach(comment => {
                const commentElement = createCommentElement(comment, comments);
                commentsList.appendChild(commentElement);
            });
        });
}

// Yorum Elemanı Oluştur (Nested)
function createCommentElement(comment, allComments) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    if (comment.parentCommentId) {
        commentDiv.className += ' comment-reply';
    }
    
    const date = comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleString('tr-TR') : 'Bilinmiyor';
    const isLiked = comment.likedBy && comment.likedBy.includes(currentUser.uid);
    
    // Bu yoruma yapılan yanıtları bul
    const replies = allComments.filter(c => c.parentCommentId === comment.id);
    
    let commentHTML = `
        <div class="comment-header">
            <strong>${escapeHtml(comment.author)}</strong>
            <span class="comment-date">${date}</span>
        </div>
        <div class="comment-content">${escapeHtml(comment.content)}</div>
        <div class="comment-actions">
            <button class="comment-action-btn ${isLiked ? 'liked' : ''}" 
                    onclick="toggleCommentLike('${comment.id}', ${isLiked})">
                ❤️ ${comment.likes || 0}
            </button>
            <button class="comment-action-btn" onclick="toggleReply('${comment.id}')">
                💬 Yanıtla
            </button>
            ${comment.userId === currentUser.uid ? 
                `<button class="comment-action-btn" onclick="deleteComment('${comment.id}', '${comment.postId}')">Sil</button>` 
                : ''}
        </div>
        <div id="replyInput-${comment.id}" class="reply-input-box" style="display: none;">
            <input type="text" id="replyText-${comment.id}" placeholder="Yanıt yazın..." maxlength="300">
            <button class="btn btn-small" onclick="addComment('${comment.postId}', '${comment.id}')">Gönder</button>
        </div>
    `;
    
    // Yanıtları göster
    if (replies.length > 0) {
        commentHTML += '<div class="comment-replies">';
        replies.forEach(reply => {
            const replyElement = createCommentElement(reply, allComments);
            commentHTML += replyElement.outerHTML;
        });
        commentHTML += '</div>';
    }
    
    commentDiv.innerHTML = commentHTML;
    return commentDiv;
}

// Yanıt Kutusunu Aç/Kapat
function toggleReply(commentId) {
    const replyBox = document.getElementById(`replyInput-${commentId}`);
    replyBox.style.display = replyBox.style.display === 'none' ? 'block' : 'none';
}

// Yorum Beğenisi
function toggleCommentLike(commentId, isCurrentlyLiked) {
    const commentRef = getDb().collection('comments').doc(commentId);
    
    if (isCurrentlyLiked) {
        commentRef.update({
            likes: firebase.firestore.FieldValue.increment(-1),
            likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        });
    } else {
        commentRef.update({
            likes: firebase.firestore.FieldValue.increment(1),
            likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        });
    }
}

// Yorum Sil
function deleteComment(commentId, postId) {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
        getDb().collection('comments').doc(commentId).delete()
            .then(() => {
                loadComments(postId);
                showSuccess('Yorum silindi.');
            })
            .catch(error => {
                console.error('Yorum silme hatası:', error);
                showError('Yorum silinemedi!');
            });
    }
}

// Ana Feed'e Dön
function showFeed() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('chatContent').style.display = 'none';
    document.getElementById('friendsContent').style.display = 'none';
    document.getElementById('profileContent').style.display = 'none';
    
    // Sidebar menü güncelle
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const menuFeed = document.getElementById('menuFeed');
    if (menuFeed) menuFeed.classList.add('active');
    
    loadPosts();
}

// ==================== ARKADAŞ SİSTEMİ ====================

let friendsList = [];
let allUsers = [];

// Arkadaşlar Ekranını Göster
function showFriends() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('chatContent').style.display = 'none';
    document.getElementById('friendsContent').style.display = 'block';
    loadFriends();
    loadAllUsers();
}

// Arkadaşları Yükle
function loadFriends() {
    const friendsContainer = document.getElementById('friendsContainer');
    friendsContainer.innerHTML = '<p class="loading">Yükleniyor...</p>';
    
    getDb().collection('friendships')
        .where('userId', '==', currentUser.uid)
        .where('status', '==', 'accepted')
        .onSnapshot(snapshot => {
            friendsList = [];
            snapshot.forEach(doc => {
                friendsList.push(doc.data().friendId);
            });
            
            if (friendsList.length === 0) {
                friendsContainer.innerHTML = '<p class="loading">Henüz arkadaşınız yok.</p>';
                return;
            }
            
            // Arkadaş bilgilerini al
            const promises = friendsList.map(friendId => 
                getDb().collection('users').doc(friendId).get()
            );
            
            Promise.all(promises).then(snapshots => {
                friendsContainer.innerHTML = '';
                snapshots.forEach(snap => {
                    if (snap.exists) {
                        const user = snap.data();
                        const friendElement = createFriendElement(user, snap.id);
                        friendsContainer.appendChild(friendElement);
                    }
                });
            });
        });
}

// Tüm Kullanıcıları Yükle
function loadAllUsers() {
    getDb().collection('users')
        .get()
        .then(snapshot => {
            allUsers = [];
            snapshot.forEach(doc => {
                // Kendi kullanıcısını hariç tut
                if (doc.id !== currentUser.uid) {
                    allUsers.push({ id: doc.id, ...doc.data() });
                }
            });
            searchUsers();
        })
        .catch(error => {
            console.error('Kullanıcılar yüklenirken hata:', error);
        });
}

// Kullanıcı Ara
function searchUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    if (!searchTerm) {
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm))
    );
    
    filteredUsers.forEach(user => {
        const isFriend = friendsList.includes(user.id);
        const userElement = createUserElement(user, isFriend);
        usersList.appendChild(userElement);
    });
}

// Kullanıcı Elemanı Oluştur
function createUserElement(user, isFriend) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-item';
    
    userDiv.innerHTML = `
        <div class="user-info">
            <strong>${escapeHtml(user.name || user.email)}</strong>
            <span>${escapeHtml(user.email || '')}</span>
        </div>
        <button class="btn btn-small ${isFriend ? 'btn-secondary' : 'btn-primary'}" 
                onclick="${isFriend ? 'removeFriend' : 'addFriend'}('${user.id}')">
            ${isFriend ? 'Arkadaşlıktan Çıkar' : 'Arkadaş Ekle'}
        </button>
    `;
    
    return userDiv;
}

// Arkadaş Elemanı Oluştur
function createFriendElement(user, userId) {
    const friendDiv = document.createElement('div');
    friendDiv.className = 'friend-item';
    
    friendDiv.innerHTML = `
        <div class="user-info">
            <strong>${escapeHtml(user.name || user.email)}</strong>
            <span>${escapeHtml(user.email || '')}</span>
        </div>
        <button class="btn btn-primary" onclick="startChat('${userId}')">
            Mesaj Gönder
        </button>
    `;
    
    return friendDiv;
}

// Arkadaş Ekle
function addFriend(friendId) {
    // İki taraflı arkadaşlık kaydı oluştur
    const friendship1 = {
        userId: currentUser.uid,
        friendId: friendId,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const friendship2 = {
        userId: friendId,
        friendId: currentUser.uid,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    getDb().collection('friendships').add(friendship1);
    getDb().collection('friendships').add(friendship2);
    
    showSuccess('Arkadaşlık isteği gönderildi!');
    loadFriends();
}

// Arkadaşlıktan Çıkar
function removeFriend(friendId) {
    if (confirm('Bu kişiyi arkadaşlıktan çıkarmak istediğinize emin misiniz?')) {
        getDb().collection('friendships')
            .where('userId', '==', currentUser.uid)
            .where('friendId', '==', friendId)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => doc.ref.delete());
            });
        
        getDb().collection('friendships')
            .where('userId', '==', friendId)
            .where('friendId', '==', currentUser.uid)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => doc.ref.delete());
            });
        
        showSuccess('Arkadaşlıktan çıkarıldı.');
        loadFriends();
    }
}

// ==================== CHAT SİSTEMİ ====================

let currentChatId = null;
let currentChatUserId = null;

// Chat Ekranını Göster
function showChat() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('friendsContent').style.display = 'none';
    document.getElementById('chatContent').style.display = 'block';
    loadChats();
}

// Chat Başlat
function startChat(userId) {
    // Chat ID oluştur (alfabetik sırayla)
    const chatId = [currentUser.uid, userId].sort().join('_');
    currentChatId = chatId;
    currentChatUserId = userId;
    
    // Kullanıcı bilgisini al
    getDb().collection('users').doc(userId).get().then(snap => {
        if (snap.exists) {
            const user = snap.data();
            document.getElementById('chatHeader').innerHTML = `
                <h3>${escapeHtml(user.name || user.email)}</h3>
            `;
            document.getElementById('chatInputContainer').style.display = 'flex';
            loadChatMessages(chatId);
        }
    });
    
    showChat();
}

// Chat'leri Yükle
function loadChats() {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '<p class="loading">Yükleniyor...</p>';
    
    // Arkadaş listesinden chat'leri oluştur
    if (friendsList.length === 0) {
        chatList.innerHTML = '<p class="loading">Henüz arkadaşınız yok.</p>';
        return;
    }
    
    const promises = friendsList.map(friendId => 
        getDb().collection('users').doc(friendId).get()
    );
    
    Promise.all(promises).then(snapshots => {
        chatList.innerHTML = '';
        snapshots.forEach(snap => {
            if (snap.exists) {
                const user = snap.data();
                const chatElement = createChatElement(user, snap.id);
                chatList.appendChild(chatElement);
            }
        });
    });
}

// Chat Elemanı Oluştur
function createChatElement(user, userId) {
    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat-item';
    chatDiv.onclick = () => startChat(userId);
    
    chatDiv.innerHTML = `
        <div class="chat-user-info">
            <strong>${escapeHtml(user.name || user.email)}</strong>
        </div>
    `;
    
    return chatDiv;
}

// Chat Mesajlarını Yükle
function loadChatMessages(chatId) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '<p class="loading">Mesajlar yükleniyor...</p>';
    
    getDb().collection('chats').doc(chatId).collection('messages')
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = '';
            
            if (snapshot.empty) {
                messagesContainer.innerHTML = '<p class="loading">Henüz mesaj yok.</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
            
            // En alta kaydır
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
}

// Mesaj Elemanı Oluştur
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.userId === currentUser.uid ? 'message-sent' : 'message-received'}`;
    
    const date = message.createdAt ? new Date(message.createdAt.toDate()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message.content)}</div>
        <div class="message-time">${date}</div>
    `;
    
    return messageDiv;
}

// Mesaj Gönder
function sendMessage() {
    if (!currentChatId) {
        showError('Lütfen bir konuşma seçin!');
        return;
    }
    
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    
    if (!content) {
        showError('Lütfen mesaj yazınız!');
        return;
    }
    
    const messageData = {
        userId: currentUser.uid,
        author: currentUser.displayName || currentUser.email,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    getDb().collection('chats').doc(currentChatId).collection('messages').add(messageData)
        .then(() => {
            input.value = '';
        })
        .catch(error => {
            console.error('Mesaj gönderme hatası:', error);
            showError('Mesaj gönderilemedi!');
        });
}

// Enter tuşu ile mesaj gönder
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// ==================== YENİ ÖZELLİKLER ====================

// Toast Bildirimleri
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal Sistemi
function openModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon(isDark);
}

function loadDarkMode() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function updateDarkModeIcon(isDark) {
    const btn = document.getElementById('darkModeBtn');
    if (btn) {
        btn.textContent = isDark ? '☀️' : '🌙';
    }
}

// Profil Sistemi
let viewingProfileId = null;

function showProfile(userId = null) {
    viewingProfileId = userId || currentUser.uid;
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('friendsContent').style.display = 'none';
    document.getElementById('chatContent').style.display = 'none';
    document.getElementById('profileContent').style.display = 'block';
    
    // Sidebar menü güncelle
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    document.getElementById('menuProfile').classList.add('active');
    
    loadUserProfilePage(viewingProfileId);
}

function showUserProfile(userId) {
    showProfile(userId);
}

function loadUserProfilePage(userId) {
    getDb().collection('users').doc(userId).get().then(doc => {
        if (!doc.exists) {
            showToast('Kullanıcı bulunamadı!', 'error');
            return;
        }
        
        const user = doc.data();
        const isOwnProfile = userId === currentUser.uid;
        
        // Profil bilgilerini göster
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = user.name || user.email;
        
        const profileBio = document.getElementById('profileBio');
        if (profileBio) profileBio.textContent = user.bio || 'Bio eklenmemiş';
        
        const avatarColor = user.avatarColor || getAvatarColor(userId);
        const userInitial = (user.name || user.email).charAt(0).toUpperCase();
        
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        if (profileAvatarLarge) {
            profileAvatarLarge.style.background = avatarColor;
            profileAvatarLarge.textContent = userInitial;
        }
        
        // Butonları göster/gizle
        const profileEditBtn = document.getElementById('profileEditBtn');
        const profileFollowBtn = document.getElementById('profileFollowBtn');
        
        if (isOwnProfile) {
            if (profileEditBtn) profileEditBtn.style.display = 'inline-block';
            if (profileFollowBtn) profileFollowBtn.style.display = 'none';
        } else {
            if (profileEditBtn) profileEditBtn.style.display = 'none';
            if (profileFollowBtn) profileFollowBtn.style.display = 'inline-block';
            checkFollowStatus(userId);
        }
        
        // İstatistikleri yükle
        loadProfileStats(userId);
        loadProfilePosts(userId);
    });
}

function loadProfileStats(userId) {
    // Gönderi sayısı
    getDb().collection('posts').where('userId', '==', userId).get().then(snapshot => {
        document.getElementById('profilePostCount').textContent = snapshot.size;
    });
    
    // Takipçi sayısı
    getDb().collection('follows').where('followedId', '==', userId).get().then(snapshot => {
        document.getElementById('profileFollowerCount').textContent = snapshot.size;
    });
    
    // Takip edilen sayısı
    getDb().collection('follows').where('followerId', '==', userId).get().then(snapshot => {
        document.getElementById('profileFollowingCount').textContent = snapshot.size;
    });
}

function loadProfilePosts(userId) {
    const postsList = document.getElementById('profilePostsList');
    postsList.innerHTML = '<p class="loading">Yükleniyor...</p>';
    
    getDb().collection('posts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
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
        });
}

function editProfile() {
    getDb().collection('users').doc(currentUser.uid).get().then(doc => {
        const user = doc.data();
        const modalContent = `
            <div class="form-group">
                <label>Ad Soyad</label>
                <input type="text" id="editName" value="${user.name || ''}" placeholder="Adınız Soyadınız">
            </div>
            <div class="form-group">
                <label>Bio</label>
                <textarea id="editBio" placeholder="Hakkınızda..." maxlength="150">${user.bio || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Avatar Rengi</label>
                <div class="color-picker">
                    ${['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => 
                        `<div class="color-option" style="background: ${color}" onclick="selectAvatarColor('${color}')"></div>`
                    ).join('')}
                </div>
            </div>
            <button class="btn btn-primary" onclick="saveProfile()">Kaydet</button>
        `;
        openModal('Profili Düzenle', modalContent);
    });
}

let selectedAvatarColor = null;

function selectAvatarColor(color) {
    selectedAvatarColor = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    event.target.classList.add('selected');
}

function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    
    const updateData = {
        name: name,
        bio: bio
    };
    
    if (selectedAvatarColor) {
        updateData.avatarColor = selectedAvatarColor;
    }
    
    getDb().collection('users').doc(currentUser.uid).update(updateData)
        .then(() => {
            showToast('Profil güncellendi!', 'success');
            closeModal();
            loadUserProfilePage(currentUser.uid);
            loadUserProfile();
        })
        .catch(error => {
            console.error('Profil güncelleme hatası:', error);
            showToast('Profil güncellenemedi!', 'error');
        });
}

// Takip Sistemi
function toggleFollow() {
    const targetUserId = viewingProfileId;
    if (!targetUserId || targetUserId === currentUser.uid) return;
    
    getDb().collection('follows')
        .where('followerId', '==', currentUser.uid)
        .where('followedId', '==', targetUserId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // Takip et
                getDb().collection('follows').add({
                    followerId: currentUser.uid,
                    followedId: targetUserId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showToast('Takip edildi!', 'success');
                    checkFollowStatus(targetUserId);
                    loadProfileStats(targetUserId);
                });
            } else {
                // Takibi bırak
                snapshot.forEach(doc => doc.ref.delete());
                showToast('Takip bırakıldı!', 'info');
                checkFollowStatus(targetUserId);
                loadProfileStats(targetUserId);
            }
        });
}

function checkFollowStatus(userId) {
    getDb().collection('follows')
        .where('followerId', '==', currentUser.uid)
        .where('followedId', '==', userId)
        .get()
        .then(snapshot => {
            const btn = document.getElementById('profileFollowBtn');
            if (btn) {
                btn.textContent = snapshot.empty ? 'Takip Et' : 'Takibi Bırak';
                btn.classList.toggle('btn-secondary', !snapshot.empty);
            }
        });
}

// Bildirim Sistemi
function createNotification(userId, type, postId, fromUserName) {
    getDb().collection('users').doc(userId).collection('notifications').add({
        type: type,
        postId: postId,
        fromUserName: fromUserName,
        fromUserId: currentUser.uid,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function showNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    loadNotifications();
}

function loadNotifications() {
    const list = document.getElementById('notificationsList');
    list.innerHTML = '<p class="loading">Yükleniyor...</p>';
    
    let unreadCount = 0;
    
    getDb().collection('users').doc(currentUser.uid).collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .onSnapshot(snapshot => {
            list.innerHTML = '';
            unreadCount = 0;
            
            if (snapshot.empty) {
                list.innerHTML = '<p class="loading">Bildirim yok</p>';
                updateNotificationBadge(0);
                return;
            }
            
            snapshot.forEach(doc => {
                const notif = doc.data();
                if (!notif.read) unreadCount++;
                
                const notifElement = createNotificationElement(notif, doc.id);
                list.appendChild(notifElement);
            });
            
            updateNotificationBadge(unreadCount);
        });
}

function createNotificationElement(notif, notifId) {
    const div = document.createElement('div');
    div.className = `notification-item ${notif.read ? '' : 'unread'}`;
    
    const icons = {
        like: '❤️',
        comment: '💬',
        follow: '👥'
    };
    
    const messages = {
        like: `${notif.fromUserName} gönderinizi beğendi`,
        comment: `${notif.fromUserName} gönderinize yorum yaptı`,
        follow: `${notif.fromUserName} sizi takip etmeye başladı`
    };
    
    const time = notif.createdAt ? formatDate(notif.createdAt.toDate()) : 'Az önce';
    
    div.innerHTML = `
        <div class="notification-icon">${icons[notif.type] || '🔔'}</div>
        <div class="notification-content">
            <div class="notification-text">${messages[notif.type] || 'Yeni bildirim'}</div>
            <div class="notification-time">${time}</div>
        </div>
    `;
    
    div.onclick = () => {
        markNotificationRead(notifId);
        if (notif.postId) {
            showFeed();
            // Post'a scroll yap
            setTimeout(() => {
                const postElement = document.querySelector(`[data-post-id="${notif.postId}"]`);
                if (postElement) {
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
        showNotifications(); // Dropdown'u kapat
    };
    
    return div;
}

function markNotificationRead(notifId) {
    getDb().collection('users').doc(currentUser.uid).collection('notifications')
        .doc(notifId).update({ read: true });
}

function markAllNotificationsRead() {
    getDb().collection('users').doc(currentUser.uid).collection('notifications')
        .where('read', '==', false)
        .get()
        .then(snapshot => {
            const batch = getDb().batch();
            snapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            return batch.commit();
        })
        .then(() => {
            showToast('Tüm bildirimler okundu işaretlendi', 'success');
        });
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Hashtag Sistemi
function showHashtagPosts(tag) {
    showFeed();
    const modalContent = `
        <h3>#${tag}</h3>
        <div id="hashtagPostsList" class="posts-list"></div>
    `;
    openModal(`#${tag} Gönderileri`, modalContent);
    
    getDb().collection('posts')
        .where('hashtags', 'array-contains', tag.toLowerCase())
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .then(snapshot => {
            const list = document.getElementById('hashtagPostsList');
            list.innerHTML = '';
            
            if (snapshot.empty) {
                list.innerHTML = '<p class="loading">Bu hashtag için gönderi yok.</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                const isLiked = post.likedBy && post.likedBy.includes(currentUser.uid);
                const postElement = createPostElement(post, postId, isLiked);
                list.appendChild(postElement);
            });
        });
}

function loadPopularHashtags() {
    getDb().collection('posts').get().then(snapshot => {
        const hashtagCounts = {};
        
        snapshot.forEach(doc => {
            const post = doc.data();
            if (post.hashtags && Array.isArray(post.hashtags)) {
                post.hashtags.forEach(tag => {
                    hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
                });
            }
        });
        
        const sorted = Object.entries(hashtagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const container = document.getElementById('popularHashtags');
        container.innerHTML = '';
        
        sorted.forEach(([tag, count]) => {
            const item = document.createElement('div');
            item.className = 'hashtag-item';
            item.innerHTML = `
                <span onclick="showHashtagPosts('${tag}')">#${tag}</span>
                <span>${count}</span>
            `;
            container.appendChild(item);
        });
    });
}

// Arama
function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim().toLowerCase();
        if (query) {
            performSearch(query);
        }
    }
}

function performSearch(query) {
    const modalContent = `
        <div id="searchResults">
            <h4>Kullanıcılar</h4>
            <div id="searchUsersResults"></div>
            <h4 style="margin-top: 20px;">Gönderiler</h4>
            <div id="searchPostsResults"></div>
        </div>
    `;
    openModal('Arama Sonuçları', modalContent);
    
    // Kullanıcı ara
    getDb().collection('users')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(10)
        .get()
        .then(snapshot => {
            const container = document.getElementById('searchUsersResults');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const user = doc.data();
                const userDiv = document.createElement('div');
                userDiv.className = 'suggested-user';
                userDiv.onclick = () => {
                    closeModal();
                    showProfile(doc.id);
                };
                userDiv.innerHTML = `
                    <div class="user-avatar-small" style="background: ${getAvatarColor(doc.id)}">${(user.name || user.email).charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>${escapeHtml(user.name || user.email)}</strong>
                    </div>
                `;
                container.appendChild(userDiv);
            });
        });
    
    // Gönderi ara
    getDb().collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .then(snapshot => {
            const container = document.getElementById('searchPostsResults');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const post = doc.data();
                const text = (post.text || post.content || '').toLowerCase();
                if (text.includes(query)) {
                    const postId = doc.id;
                    const isLiked = post.likedBy && post.likedBy.includes(currentUser.uid);
                    const postElement = createPostElement(post, postId, isLiked);
                    container.appendChild(postElement);
                }
            });
        });
}

// Gönderi Düzenleme
function editPost(postId) {
    getDb().collection('posts').doc(postId).get().then(doc => {
        const post = doc.data();
        const modalContent = `
            <textarea id="editPostText" style="width: 100%; min-height: 120px; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-family: inherit;" maxlength="500">${escapeHtml(post.text || post.content || '')}</textarea>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button class="btn btn-primary" onclick="savePostEdit('${postId}')">Kaydet</button>
                <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
            </div>
        `;
        openModal('Gönderiyi Düzenle', modalContent);
    });
}

function savePostEdit(postId) {
    const newText = document.getElementById('editPostText').value.trim();
    
    if (!newText) {
        showToast('Gönderi boş olamaz!', 'error');
        return;
    }
    
    const hashtags = extractHashtags(newText);
    
    getDb().collection('posts').doc(postId).update({
        text: newText,
        hashtags: hashtags
    })
    .then(() => {
        showToast('Gönderi güncellendi!', 'success');
        closeModal();
        loadPosts();
    })
    .catch(error => {
        console.error('Gönderi güncelleme hatası:', error);
        showToast('Gönderi güncellenemedi!', 'error');
    });
}

// Yorum Düzenleme
function editComment(commentId, postId) {
    getDb().collection('comments').doc(commentId).get().then(doc => {
        const comment = doc.data();
        const modalContent = `
            <textarea id="editCommentText" style="width: 100%; min-height: 80px; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-family: inherit;" maxlength="300">${escapeHtml(comment.content)}</textarea>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button class="btn btn-primary" onclick="saveCommentEdit('${commentId}', '${postId}')">Kaydet</button>
                <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
            </div>
        `;
        openModal('Yorumu Düzenle', modalContent);
    });
}

function saveCommentEdit(commentId, postId) {
    const newText = document.getElementById('editCommentText').value.trim();
    
    if (!newText) {
        showToast('Yorum boş olamaz!', 'error');
        return;
    }
    
    getDb().collection('comments').doc(commentId).update({
        content: newText
    })
    .then(() => {
        showToast('Yorum güncellendi!', 'success');
        closeModal();
        loadComments(postId);
    })
    .catch(error => {
        console.error('Yorum güncelleme hatası:', error);
        showToast('Yorum güncellenemedi!', 'error');
    });
}

// Yorum sistemini güncelle (düzenleme butonu ekle)
function updateCommentElement(comment, commentId, postId) {
    // Mevcut createCommentElement fonksiyonunu güncelle
    // Düzenle butonu ekle
}

// Emoji Picker (Basit)
function openEmojiPicker() {
    const emojis = ['😊', '😂', '❤️', '😍', '🤔', '👍', '👏', '🎉', '🔥', '💯'];
    const modalContent = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 12px;">
            ${emojis.map(emoji => `<span style="font-size: 24px; cursor: pointer; padding: 8px;" onclick="insertEmoji('${emoji}')">${emoji}</span>`).join('')}
        </div>
    `;
    openModal('Emoji Seç', modalContent);
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('postContent');
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    textarea.value = textBefore + emoji + textAfter;
    textarea.focus();
    textarea.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    updateCharCount();
    closeModal();
}

// Resim Modal
function openImageModal(imageUrl) {
    const modalContent = `<img src="${imageUrl}" style="width: 100%; border-radius: 8px;">`;
    openModal('Gönderi Resmi', modalContent);
}

// Önerilen Kullanıcılar
function loadSuggestedUsers() {
    getDb().collection('users')
        .limit(5)
        .get()
        .then(snapshot => {
            const container = document.getElementById('suggestedUsers');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                if (doc.id === currentUser.uid) return;
                
                const user = doc.data();
                const userDiv = document.createElement('div');
                userDiv.className = 'suggested-user';
                userDiv.onclick = () => showProfile(doc.id);
                
                const initial = (user.name || user.email).charAt(0).toUpperCase();
                userDiv.innerHTML = `
                    <div class="user-avatar-small" style="background: ${getAvatarColor(doc.id)}">${initial}</div>
                    <div>
                        <strong>${escapeHtml(user.name || user.email)}</strong>
                        <div style="font-size: 12px; color: var(--text-light);">${user.bio || ''}</div>
                    </div>
                `;
                container.appendChild(userDiv);
            });
        });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    
    // Dışarı tıklanınca dropdown'ları kapat
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#notificationBtn') && !e.target.closest('#notificationDropdown')) {
            document.getElementById('notificationDropdown').style.display = 'none';
        }
    });
});

// Sayfa yüklendiğinde yan özellikleri yükle
setTimeout(() => {
    if (currentUser) {
        loadPopularHashtags();
        loadSuggestedUsers();
        loadNotifications();
    }
}, 2000);
