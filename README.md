# Okul Mini Sosyal Medya Uygulaması

Web tabanlı sosyal medya uygulaması. Firebase Authentication ve Firestore kullanarak kullanıcı girişi, gönderi paylaşımı ve beğeni özellikleri sunar.

## 📱 Özellikler

✅ **Kimlik Doğrulama (Authentication)**
- E-posta ve şifre ile kayıt / giriş
- Google hesabı ile giriş
- Güvenli şifre doğrulama

✅ **Gönderiler (Posts)**
- Metin gönderi paylaşımı
- Gönderileri silme (kendi gönderileriniz)
- Gönderi tarihi ve saati
- Gerçek zamanlı güncellemeler

✅ **Beğeniler (Likes)**
- Gönderileri beğen/beğeniyi kaldır
- Beğeni sayısını görüntüle
- Kişiselleştirilmiş beğeni durumu

✅ **Veritabanı (Firestore)**
- Kullanıcı bilgileri
- Gönderiler ve beğeniler
- Gerçek zamanlı güncellemeler

## 🛠️ Teknolojiler

- **HTML5** - Yapı
- **CSS3** - Stil ve animasyonlar
- **JavaScript (Vanilla)** - İş mantığı
- **Firebase Services:**
  - Firebase Authentication
  - Cloud Firestore

## 📋 Gereksinimler

- Modern web tarayıcısı (Chrome, Firefox, Edge, Safari)
- Firebase projesi
- Web sunucusu (yerel geliştirme için)

## 🚀 Kurulum

### 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com) adresine gidin
2. "Yeni Proje Oluştur" butonuna tıklayın
3. Proje adını girin (örn: "Okul Sosyal Medya")
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. Proje oluşturun

### 2. Web App Ekle

1. Firebase Console'da projenizi açın
2. Sol menüden ⚙️ (Ayarlar) > "Proje ayarları" seçin
3. "Uygulamalarınız" bölümünde Web ikonuna (</>) tıklayın
4. Uygulama takma adı: "Okul Sosyal Medya"
5. "Uygulamayı kaydet" butonuna tıklayın
6. Firebase config bilgilerini kopyalayın

### 3. Config Dosyasını Güncelle

`config.js` dosyasını açın ve Firebase config bilgilerinizi yapıştırın:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:YOUR_WEB_APP_ID"
};
```

### 4. Firebase Authentication Ayarları

1. Firebase Console'da sol menüden **"Authentication"** seçin
2. "Başlayın" butonuna tıklayın
3. "Sign-in method" (Giriş yöntemi) sekmesine gidin
4. **"E-posta/Parola"** seçeneğini etkinleştirin
5. **"Google"** seçeneğini etkinleştirin

### 5. Firestore Database Oluştur

1. Firebase Console'da sol menüden **"Firestore Database"** seçin
2. "Veritabanı oluştur" butonuna tıklayın
3. **"Üretim modunda başlat"** seçin
4. Bölge seçin (örn: "europe-west1")
5. "Etkinleştir" butonuna tıklayın

### 6. Firestore Güvenlik Kuralları

Firestore Database > "Kurallar" sekmesine gidin ve şunu yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar: Yalnızca kendi verilerini okuyabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gönderiler: Herkes okuyabilir, giriş yapanlar yazabilir
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Authorized Domains (Yetkili Domainler)

1. Firebase Console'da **"Authentication"** > **"Settings"** (Ayarlar) sekmesine gidin
2. "Authorized domains" (Yetkili domainler) bölümünü kontrol edin
3. Yerel geliştirme için `localhost` zaten listede olmalı
4. Eğer başka bir domain kullanıyorsanız onu ekleyin

### 8. Uygulamayı Çalıştır

#### Yöntem 1: Doğrudan Dosya Açma
1. `index.html` dosyasına çift tıklayın
2. Tarayıcıda açılacaktır

**Not:** Bazı Firebase özellikleri yerel dosya açılışında çalışmayabilir. Web sunucusu kullanmanız önerilir.

#### Yöntem 2: Yerel Web Sunucusu (Önerilen)

**Python ile:**
```bash
python -m http.server 8000
```
Tarayıcıda: `http://localhost:8000`

**Node.js ile:**
```bash
npx http-server -p 8000 -o
```
Tarayıcıda: `http://localhost:8000`

**VS Code Live Server:**
1. VS Code'da projeyi açın
2. `index.html` dosyasına sağ tıklayın
3. "Open with Live Server" seçin

## 📁 Proje Yapısı

```
odevim/
├── index.html      # Ana HTML dosyası
├── style.css       # Stil dosyası
├── app.js          # Ana uygulama mantığı
├── config.js        # Firebase konfigürasyonu
└── README.md        # Bu dosya
```

## 🎨 Kullanım

### Kayıt Ol
1. Uygulamayı açın
2. "Kayıt Ol" linkine tıklayın
3. Ad, e-posta ve şifre girin
4. "Kayıt Ol" butonuna tıklayın
5. Giriş ekranına yönlendirilirsiniz

### Giriş Yap
1. E-posta ve şifre ile giriş yapın
2. Veya "Google ile Giriş Yap" butonuna tıklayın

### Gönderi Paylaş
1. Ana ekranda "Ne düşünüyorsunuz?" alanına yazın
2. "Paylaş" butonuna tıklayın
3. Gönderiniz listede görünür

### Beğen
1. Gönderilerin altındaki "Beğen" butonuna tıklayın
2. Beğeni sayısı güncellenir

### Gönderi Sil
1. Kendi gönderilerinizde "Sil" butonu görünür
2. Silmek istediğiniz gönderinin "Sil" butonuna tıklayın
3. Onaylayın

## 🔒 Güvenlik

- Şifreler Firebase tarafından hashlenerek saklanır
- Kullanıcılar yalnızca kendi verilerini güncelleyebilir
- Gönderiler yalnızca giriş yapanlar tarafından görülür
- XSS saldırılarına karşı koruma (HTML escape)
- Firestore güvenlik kuralları ile korunur

## 🐛 Sorun Giderme

**Giriş yapamıyor:**
- `config.js` dosyasındaki Firebase config bilgilerinin doğru olduğundan emin olun
- Tarayıcı konsolunda hataları kontrol edin (F12)
- Firebase Console'da Authentication'ın etkinleştirildiğini kontrol edin

**Gönderiler görünmüyor:**
- Firestore kurallarının doğru olduğundan emin olun
- Authentication'un etkinleştirildiğinden emin olun
- İnternet bağlantınızı kontrol edin
- Tarayıcı konsolunda hata mesajlarını kontrol edin

**Google giriş çalışmıyor:**
- Firebase Console'da Google provider'ının etkinleştirildiğinden emin olun
- Authorized domains listesinde domain'inizin olduğundan emin olun
- Popup engelleyicileri kapatın
- Tarayıcı konsolunda hata mesajlarını kontrol edin

**CORS hatası:**
- Yerel bir web sunucusu kullanın (doğrudan dosya açma yerine)
- `localhost` domain'inin authorized domains listesinde olduğundan emin olun

## 📝 Notlar

- Bu proje öğrenme amacıyla oluşturulmuştur
- Üretim ortamına taşırken ek güvenlik önlemleri alın
- Fotoğraf paylaşımı özelliği eklenmemiştir (Storage kullanılmamıştır)
- Modern tarayıcılarda çalışır (ES6+ desteği gerekir)

## 📚 Kaynaklar

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)

## 👨‍💻 Geliştirici

Bu proje web tabanlı olarak tasarlanmıştır ve herhangi bir web sunucusunda çalıştırılabilir.

---

**Başarılı Kod Yazma!** 🎉
