# Firestore Güvenlik Kuralları

Firebase Console > Firestore Database > Kurallar sekmesine gidin ve şu kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar: Yalnızca kendi verilerini okuyabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Diğer kullanıcıları görebilir (arkadaş ekleme için)
    }
    
    // Gönderiler: Herkes okuyabilir, giriş yapanlar yazabilir
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      // Beğeni için: Herkes likes ve likedBy alanlarını güncelleyebilir
      // Gönderi sahibi tüm alanları güncelleyebilir
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         // Sadece likes ve likedBy değişiyorsa herkes güncelleyebilir
         (request.resource.data.keys().hasOnly(['likes', 'likedBy', 'userId', 'author', 'content', 'createdAt']) &&
          request.resource.data.likes is int &&
          request.resource.data.likedBy is list));
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Yorumlar: Herkes okuyabilir, giriş yapanlar yazabilir
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Arkadaşlıklar: Sadece kendi arkadaşlıklarını görebilir
    match /friendships/{friendshipId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.uid == resource.data.friendId);
      allow create: if request.auth != null;
    }
    
    // Chat'ler: Sadece chat'e dahil olanlar görebilir
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (chatId.contains(request.auth.uid));
      
      // Chat mesajları
      match /messages/{messageId} {
        allow read: if request.auth != null && chatId.contains(request.auth.uid);
        allow create: if request.auth != null && chatId.contains(request.auth.uid);
        allow update, delete: if request.auth != null && 
          request.auth.uid == resource.data.userId;
      }
    }
  }
}
```

## Önemli Notlar

1. **Kuralları yayınladıktan sonra** birkaç saniye bekleyin
2. **Test etmek için** Firebase Console > Firestore > Rules sekmesinde "Simulator" kullanabilirsiniz
3. Eğer hata alırsanız, kuralları tekrar kontrol edin

## Koleksiyonlar

Projede kullanılan Firestore koleksiyonları:

- `users` - Kullanıcı bilgileri
- `posts` - Gönderiler
- `comments` - Yorumlar (nested yorumlar desteklenir)
- `friendships` - Arkadaşlık ilişkileri
- `chats/{chatId}/messages` - Chat mesajları
