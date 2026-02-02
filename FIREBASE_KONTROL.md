# Firebase Kayıt Sorunu - Kontrol Listesi

## 🔍 Adım Adım Kontrol

### 1. Firebase Console'da Authentication Kontrolü

1. **Firebase Console'a gidin:** https://console.firebase.google.com
2. Projenizi seçin: `hkmtalchat`
3. Sol menüden **"Authentication"** (Kimlik Doğrulama) seçin
4. **"Sign-in method"** (Giriş yöntemi) sekmesine tıklayın
5. **"E-posta/Parola"** satırını bulun
6. **"Etkinleştir"** toggle'ının **AÇIK** olduğundan emin olun
7. **"Kaydet"** butonuna tıklayın

**ÖNEMLİ:** Eğer "E-posta/Parola" kapalıysa, kayıt ol çalışmaz!

### 2. Firestore Database Kontrolü

1. Firebase Console'da sol menüden **"Firestore Database"** seçin
2. Eğer veritabanı yoksa:
   - "Veritabanı oluştur" butonuna tıklayın
   - "Üretim modunda başlat" seçin
   - Bölge seçin (örn: europe-west1)
   - "Etkinleştir" butonuna tıklayın

### 3. Firestore Güvenlik Kuralları

1. Firestore Database > **"Kurallar"** sekmesine gidin
2. Şu kuralların olduğundan emin olun:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gönderiler
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. **"Yayınla"** butonuna tıklayın

### 4. Tarayıcı Konsolunda Hata Kontrolü

1. Tarayıcıda `F12` tuşuna basın
2. **"Console"** sekmesine gidin
3. "Kayıt Ol" butonuna tıklayın
4. Konsolda şu mesajları görmelisiniz:
   - "register fonksiyonu çağrıldı"
   - "Kayıt bilgileri: ..."
   - "Firebase Auth ile kayıt başlatılıyor..."
   - "Kullanıcı oluşturuldu: ..."

5. **Kırmızı hata mesajları** varsa, hata kodunu not edin:
   - `auth/operation-not-allowed` → Authentication'da E-posta/Parola kapalı
   - `auth/email-already-in-use` → Bu e-mail zaten kullanılıyor
   - `auth/weak-password` → Şifre çok zayıf
   - `auth/invalid-email` → Geçersiz e-mail formatı

### 5. Config.js Kontrolü

`config.js` dosyasındaki Firebase bilgilerinin doğru olduğundan emin olun:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCxC_AemXwl3ltbg9ZS_yc_23xK-y8lM9s",
    authDomain: "hkmtalchat.firebaseapp.com",
    projectId: "hkmtalchat",
    // ...
};
```

Bu bilgiler Firebase Console > Project Settings > Your apps > Web app'ten alınmalı.

## ✅ Test Adımları

1. **Sayfayı yenileyin:** `Ctrl + F5`
2. **Konsolu açın:** `F12` > Console
3. **Kayıt ekranına gidin:** "Kayıt Ol" linkine tıklayın
4. **Bilgileri girin:**
   - Ad: Test Kullanıcı
   - E-mail: test@example.com
   - Şifre: 123456 (en az 6 karakter)
5. **"Kayıt Ol" butonuna tıklayın**
6. **Konsoldaki mesajları kontrol edin**

## 🐛 Yaygın Hatalar ve Çözümleri

### "operation-not-allowed" Hatası
**Çözüm:** Firebase Console > Authentication > Sign-in method > E-posta/Parola'yı etkinleştirin

### "permission-denied" Hatası
**Çözüm:** Firestore kurallarını yukarıdaki gibi güncelleyin

### "network-request-failed" Hatası
**Çözüm:** İnternet bağlantınızı kontrol edin

### Buton hiç çalışmıyor
**Çözüm:** 
- Konsolu açın (`F12`)
- Hata mesajlarını kontrol edin
- Sayfayı hard refresh yapın (`Ctrl + F5`)

## 📞 Hala Çalışmıyorsa

Konsoldaki **tam hata mesajını** kopyalayıp paylaşın. Özellikle:
- Hata kodu (örn: `auth/operation-not-allowed`)
- Hata mesajı
- Console'daki tüm kırmızı mesajlar
