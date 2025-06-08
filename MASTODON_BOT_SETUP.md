# 🤖 Mastodon Community-Bot Setup Guide

## 🎯 **Was ist der Community-Bot?**

Der **Dota Player Rating Community-Bot** postet automatisch:
- **📊 Tägliche Updates** (Community-Statistiken, Top-Spieler)
- **🌟 Wöchentliche Highlights** (MVP der Woche, beste Reviews)
- **🎉 Meilenstein-Posts** (100, 500, 1000+ Reviews erreicht)
- **🔥 Besondere Ereignisse** (Außergewöhnliche 5-Sterne Reviews)

## 🚀 **Schritt 1: Mastodon Access Token erstellen**

### **Option A: Mastodon.social (Empfohlen)**
1. Gehe zu: https://mastodon.social/settings/applications
2. Klicke auf **"New application"**
3. **Application name**: `Dota Player Rating Bot`
4. **Application website**: `https://hendkai.github.io/dota-player-rating/`
5. **Redirect URI**: `urn:ietf:wg:oauth:2.0:oob`
6. **Scopes**: Wähle `write:statuses` aus
7. Klicke **"Submit"**
8. **Kopiere den Access Token** (beginnt mit `mastodon_...`)

### **Option B: Eigene Mastodon-Instanz**
1. Melde dich bei deiner bevorzugten Mastodon-Instanz an
2. Gehe zu **Settings → Development → New Application**
3. Folge den gleichen Schritten wie oben
4. Notiere dir deine **Instanz-URL** (z.B. `mastodon.world`)

## ⚙️ **Schritt 2: Bot im Admin-Panel konfigurieren**

1. **Logge dich als Admin ein** in die Dota Player Rating App
2. Klicke auf **🛡️ Admin Panel**
3. Scroll zum **🤖 Mastodon Community-Bot** Bereich
4. **Konfiguration eingeben:**
   - **Mastodon-Instanz**: `mastodon.social` (oder deine Instanz)
   - **Access Token**: Dein kopierter Token
5. Klicke **💾 Konfiguration speichern**

## 🧪 **Schritt 3: Bot testen**

### **Test-Post senden**
1. Klicke **🧪 Test-Post** im Admin-Panel
2. Du solltest eine Bestätigung sehen: ✅ "Test-Post erfolgreich gesendet!"
3. Prüfe deinen Mastodon-Feed für den Test-Post

### **Content-Vorschau erstellen**
1. Klicke **👁️ Content-Vorschau**
2. Du siehst Beispiele für alle Post-Typen
3. Mit **📤 Diesen Content posten** kannst du direkt posten

## 🤖 **Automatisierung und Zeitpläne**

### **Tägliche Posts** 📊
- **Zeit**: 20:00 Uhr täglich
- **Inhalt**: 
  - Neue Reviews des Tages
  - Community-Statistiken
  - Top-Spieler Highlights
  - Positive Gaming Encouragement

### **Wöchentliche Posts** 🌟
- **Zeit**: Sonntags 12:00 Uhr
- **Inhalt**:
  - Wochen-MVP (Spieler mit besten Reviews)
  - Review der Woche
  - Anzahl 5⭐ Bewertungen
  - Community-Wachstum

### **Meilenstein-Posts** 🎉
- **Automatisch bei erreichen von**:
  - 100, 500, 1000, 2500, 5000, 10000 Reviews
- **Inhalt**: Feier der Community-Erfolge

## 📊 **Bot-Status überwachen**

Das Admin-Panel zeigt:
- **Letzter täglicher Post**: Zeitstempel des letzten Daily-Updates
- **Letzter wöchentlicher Post**: Zeitstempel der letzten Highlights
- **Nächster Meilenstein**: Wann der nächste Meilenstein-Post kommt
- **Automatisierung**: Status der Bot-Automatisierung

## 📤 **Manuelle Posts**

Du kannst jederzeit manuell posten:
- **📊 Täglicher Update**: Sofortiger Community-Update
- **🌟 Wöchentliche Highlights**: Aktuelle Wochen-Highlights
- **🧪 Test-Post**: Einfacher Test der Integration

## 🛠️ **Fehlerbehebung**

### **"No access token" Fehler**
- Prüfe ob der Access Token korrekt eingegeben wurde
- Token darf keine Leerzeichen enthalten
- Stelle sicher, dass der Token `write:statuses` Berechtigung hat

### **"Post failed" Fehler**
- Prüfe die Mastodon-Instanz URL (ohne `https://`)
- Stelle sicher, dass der Account nicht gesperrt ist
- Rate-Limits: Warte 5-10 Minuten zwischen Posts

### **Keine automatischen Posts**
- Automatisierung funktioniert nur für eingeloggte Admins
- Browser-Tab muss geöffnet bleiben für Timer
- Für 24/7 Automatisierung: Server-basierte Lösung implementieren

## 🌐 **Beispiel-Posts**

### **Täglicher Update**
```
🎮 Täglicher Community-Update!

📊 Heute: 15 neue Reviews
🌟 Gesamt: 1,247 Reviews (⭐4.6 Durchschnitt)
💚 89% positive Bewertungen

🏆 Top Spieler: ProGamer123 (⭐4.9)

#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

### **Wöchentliche Highlights**
```
🌟 Wöchentliche Community-Highlights!

📊 Diese Woche:
• 87 neue Reviews
• 34 perfekte 5⭐ Bewertungen

🏆 Wochen-MVP: TeamPlayer42
   ⭐ 4.8 Durchschnitt (12 Reviews)

💬 Review der Woche:
"Fantastischer Teammate! Immer positiv und hilfsbereit..."
   - über SupportMaster

🎮 Macht mit bei der freundlichsten Dota 2 Community!
#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

### **Meilenstein-Post**
```
🎉 MEILENSTEIN! 1000 Reviews!

Unsere Dota 2 Community wächst stetig!

🤝 Zusammen bauen wir eine positivere Gaming-Welt
⭐ Jeden Tag werden großartige Spieler entdeckt
🎮 Toxizität war gestern - Teamwork ist heute!

Danke an alle, die mitmachen! 💚

#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

## 🔧 **Erweiterte Konfiguration**

### **Post-Zeiten anpassen**
Im Code (index.html) findest du:
```javascript
postSchedule: {
    daily: { hour: 20, minute: 0 }, // 20:00 täglich
    weekly: { day: 0, hour: 12, minute: 0 }, // Sonntag 12:00
}
```

### **Hashtags anpassen**
```javascript
defaultHashtags: '#Dota2 #Gaming #Community #PositiveGaming'
```

### **Content-Templates erweitern**
Die `generateDailyPost()` und `generateWeeklyPost()` Funktionen enthalten verschiedene Template-Varianten für Abwechslung.

---

## 🎯 **Community-Impact**

Der Bot hilft dabei:
- **🚀 Community-Wachstum** durch regelmäßige Sichtbarkeit
- **💬 Engagement fördern** durch Highlights positiver Spieler
- **🌟 Positive Gaming** durch Betonung guter Erfahrungen
- **📊 Transparenz** durch offene Community-Statistiken

**Der Bot macht eure Community lebendig und zeigt der Welt, dass positives Gaming möglich ist!** 🎮✨ 