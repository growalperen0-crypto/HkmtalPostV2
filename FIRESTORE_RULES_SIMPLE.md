# Firestore Güvenlik Kuralları (Basit Versiyon)

Eğer yukarıdaki kurallar çalışmazsa, bu basit versiyonu kullanın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gönderiler - BEĞENİ İÇİN ÖNEMLİ!
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      // Herkes beğeni yapabilir (sadece likes ve likedBy güncellenebilir)
      allow update: if request.auth != null;
      // Sadece gönderi sahibi silebilir
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Yorumlar
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Arkadaşlıklar
    match /friendships/{friendshipId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.uid == resource.data.friendId);
      allow create: if request.auth != null;
    }
    
    // Chat'ler
    match /chats/{chatId} {
      allow read, write: if request.auth != null && chatId.contains(request.auth.uid);
      
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

**ÖNEMLİ:** Bu basit versiyonda posts için `allow update: if request.auth != null;` kuralı var. Bu, herkesin gönderileri güncelleyebileceği anlamına gelir. Güvenlik için daha kısıtlayıcı kurallar istiyorsanız, yukarıdaki detaylı versiyonu kullanın.
