# Vercel'e Deploy Etme Rehberi

## 🚀 Hızlı Deploy (GitHub ile)

### 1. GitHub'a Yükle

1. GitHub'da yeni bir repository oluşturun
2. Projeyi GitHub'a push edin:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

### 2. Vercel'e Bağla

1. [Vercel](https://vercel.com) adresine gidin
2. "Sign Up" ile kayıt olun (GitHub ile giriş yapabilirsiniz)
3. "Add New Project" butonuna tıklayın
4. GitHub repository'nizi seçin
5. **Framework Preset:** "Other" veya "Other" seçin
6. **Root Directory:** `.` (boş bırakın)
7. **Build Command:** Boş bırakın (gerek yok)
8. **Output Directory:** Boş bırakın
9. "Deploy" butonuna tıklayın

### 3. Firebase Ayarları

Vercel deploy olduktan sonra:

1. Vercel'de projenizin **Settings** > **Environment Variables** bölümüne gidin
2. Firebase config bilgilerini environment variable olarak ekleyebilirsiniz (isteğe bağlı)
3. Veya `config.js` dosyasında zaten var, o yeterli

### 4. Firebase Authorized Domains

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin: `hkmtalpost`
3. **Authentication** > **Settings** (Ayarlar) sekmesine gidin
4. **"Authorized domains"** bölümüne Vercel domain'inizi ekleyin:
   - `your-project.vercel.app`
   - `your-custom-domain.com` (varsa)

## 📝 Manuel Deploy (Vercel CLI ile)

### 1. Vercel CLI Kurulumu

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

İlk kez çalıştırıyorsanız:
- Vercel hesabınıza giriş yapın
- Proje ayarlarını onaylayın
- Deploy otomatik başlar

### 3. Production Deploy

```bash
vercel --prod
```

## 🔧 Önemli Notlar

### Firebase Config

`config.js` dosyasındaki Firebase bilgileri production'da da çalışacak. Sadece **Authorized Domains** listesine Vercel domain'inizi eklemeyi unutmayın.

### Environment Variables (Opsiyonel)

Eğer Firebase config'i environment variable olarak saklamak isterseniz:

1. Vercel Dashboard > Settings > Environment Variables
2. Şu değişkenleri ekleyin:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - vb.

Sonra `config.js`'i şöyle güncelleyin:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  // ...
};
```

Ama şu anki haliyle de çalışır, gerek yok.

### Custom Domain

1. Vercel Dashboard > Settings > Domains
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın
4. Firebase Authorized Domains'e ekleyin

## ✅ Deploy Sonrası Kontrol

1. Site açılıyor mu?
2. Firebase bağlantısı çalışıyor mu? (Konsolu kontrol edin)
3. Kayıt/Giriş çalışıyor mu?
4. Gönderiler yükleniyor mu?

## 🐛 Sorun Giderme

### "Firebase yüklenemedi" Hatası
- Firebase SDK CDN linklerinin çalıştığından emin olun
- İnternet bağlantısını kontrol edin

### "Unauthorized domain" Hatası
- Firebase Console > Authentication > Settings > Authorized Domains
- Vercel domain'inizi ekleyin

### CORS Hatası
- Firebase config'in doğru olduğundan emin olun
- Authorized domains listesini kontrol edin

## 📚 Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Başarılı Deploy!** 🎉
