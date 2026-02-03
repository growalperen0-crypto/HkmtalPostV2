# Firebase Storage Kuralları

Firebase Console > Storage > Rules sekmesine gidin ve şu kuralları yapıştırın:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Post fotoğrafları
    match /posts/{userId}/{allPaths=**} {
      // Sadece kendi fotoğraflarını yükleyebilir
      allow write: if request.auth != null && request.auth.uid == userId;
      // Herkes okuyabilir
      allow read: if request.auth != null;
    }
    
    // Kullanıcı avatar'ları (gelecekte eklenebilir)
    match /avatars/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

## Önemli Notlar

1. **Storage'ı etkinleştirin:**
   - Firebase Console > Storage
   - "Get started" butonuna tıklayın
   - "Start in production mode" seçin
   - Bölge seçin (örn: europe-west1)

2. **Kuralları yayınladıktan sonra** birkaç saniye bekleyin

3. **Test etmek için** Firebase Console > Storage > Rules sekmesinde "Simulator" kullanabilirsiniz

## Yaygın Hatalar

**"storage/unauthorized"**
- Storage kuralları yanlış
- **Çözüm:** Yukarıdaki kuralları yapıştırın

**"storage/object-not-found"**
- Dosya yolu yanlış
- **Çözüm:** Dosya yolunu kontrol edin

**"storage/quota-exceeded"**
- Storage kotası dolmuş
- **Çözüm:** Firebase Console'dan kotayı kontrol edin

---

**Başarılı Yükleme!** 🎉
