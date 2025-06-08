# Firebase Security Rules für Dota Player Rating - SOFORTIGE LÖSUNG

## 🚨 **KRITISCHES PROBLEM**

**Fehler:** `Missing or insufficient permissions` beim Einreichen von Reports

**Ursache:** Firebase Security Rules verbieten normalen Usern das Schreiben in die `reports` Collection

---

## ⚡ **SOFORTIGE LÖSUNG - Diese Rules JETZT implementieren:**

### **Schritt 1: Firebase Console öffnen**
```
https://console.firebase.google.com/project/dota-player-rating/firestore/rules
```

### **Schritt 2: Diese Rules kopieren und einfügen:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== RATINGS COLLECTION =====
    match /ratings/{ratingId} {
      allow read: if true; // Öffentlicher Lesezugriff
      allow create: if request.auth != null; // Jeder authentifizierte User
      allow update: if request.auth != null 
        && (request.auth.uid == resource.data.reviewerId || isAdmin()); // Owner oder Admin
      allow delete: if isAdmin(); // Nur Admins
    }
    
    // ===== REPORTS COLLECTION - HAUPTPROBLEM GELÖST =====  
    match /reports/{reportId} {
      allow read: if isAdmin(); // Nur Admins können Reports lesen
      allow create: if request.auth != null 
        && request.resource.data.reporterId == request.auth.uid; // User können eigene Reports erstellen
      allow update: if isAdmin(); // Nur Admins können Reports bearbeiten
      allow delete: if isAdmin(); // Nur Admins können Reports löschen
    }
    
    // ===== ADMIN-FUNKTION =====
    function isAdmin() {
      return request.auth != null && request.auth.token.email in [
        'bitsofmuschi@gmail.com'  // Ihr Admin-Account
      ];
    }
  }
}
```

### **Schritt 3: "Veröffentlichen" klicken**

---

## 🔧 **Was wird dadurch behoben:**

✅ **Normale User können Reports erstellen** - `allow create: if request.auth != null`  
✅ **Nur eigene Reports** - `request.resource.data.reporterId == request.auth.uid`  
✅ **Admins haben vollen Zugriff** - `isAdmin()` Funktion  
✅ **Sicherheit bleibt gewährleistet** - Nur authentifizierte User  

---

## 🚀 **ALTERNATIVE: Weniger strenge Rules (Falls das nicht funktioniert)**

Falls die obigen Rules immer noch Probleme verursachen, verwenden Sie diese temporären Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /ratings/{ratingId} {
      allow read, write: if true; // Temporär: Alles erlauben
    }
    
    match /reports/{reportId} {
      allow read: if request.auth != null; // Authentifizierte User können Reports lesen
      allow create, update, delete: if request.auth != null; // Authentifizierte User können Reports verwalten
    }
  }
}
```

**⚠️ Achtung:** Diese Rules sind weniger sicher und sollten nur temporär verwendet werden!

---

## 📊 **Testen nach der Änderung:**

1. **Firebase Console Rules veröffentlichen**
2. **Warten Sie 1-2 Minuten** (Propagation Zeit)
3. **Neue Report erstellen** in der App
4. **Erfolg prüfen** - sollte jetzt funktionieren

---

## 🎯 **Erwartetes Ergebnis:**

✅ Reports werden erfolgreich in Firebase gespeichert  
✅ Keine "Missing or insufficient permissions" Fehler  
✅ Fallback-System bleibt als Backup bestehen  
✅ Admins können alle Reports verwalten  

---

## 🐛 **Falls es immer noch nicht funktioniert:**

1. **Browser-Cache leeren**
2. **Entwicklertools öffnen** und Console auf weitere Fehler prüfen
3. **Firebase Authentication** Status überprüfen (User muss eingeloggt sein)
4. **Netzwerk-Tab** in Entwicklertools prüfen für HTTP-Status codes

---

## 📞 **Support & Debugging:**

Falls weiterhin Probleme bestehen, prüfen Sie:
- User ist tatsächlich authentifiziert (`currentUser` nicht null)
- Firebase Projekt-ID ist korrekt
- Internet-Verbindung stabil
- Firebase Services sind online (https://status.firebase.google.com/) 