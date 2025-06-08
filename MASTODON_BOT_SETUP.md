# �� Mastodon Community Bot Setup Guide

## 🎯 **What is the Community Bot?**

The **Dota Player Rating Community Bot** automatically posts:
- **📊 Daily updates** (community stats, top players)
- **🌟 Weekly highlights** (MVP of the week, best reviews)
- **🎉 Milestone posts** (100, 500, 1000+ reviews reached)
- **🔥 Special events** (exceptional 5-star reviews)

## 🚀 **Step 1: Create a Mastodon Access Token**

### **Option A: Mastodon.social (Recommended)**
1. Go to: https://mastodon.social/settings/applications
2. Click **"New application"**
3. **Application name**: `Dota Player Rating Bot`
4. **Application website**: `https://hendkai.github.io/dota-player-rating/`
5. **Redirect URI**: `urn:ietf:wg:oauth:2.0:oob`
6. **Scopes**: Select `write:statuses`
7. Click **"Submit"**
8. **Copy the access token** (starts with `mastodon_...`)

### **Option B: Your Own Mastodon Instance**
1. Log in to your preferred Mastodon instance
2. Go to **Settings → Development → New Application**
3. Follow the same steps as above
4. Note your **instance URL** (e.g. `mastodon.world`)

## ⚙️ **Step 2: Configure the Bot in the Admin Panel**

1. **Log in as admin** in the Dota Player Rating app
2. Click **🛡️ Admin Panel**
3. Scroll to the **🤖 Mastodon Community Bot** section
4. **Enter configuration:**
   - **Mastodon instance**: `mastodon.social` (or your instance)
   - **Access token**: Your copied token
5. Click **💾 Save configuration**

## 🧪 **Step 3: Test the Bot**

### **Send a test post**
1. Click **🧪 Test Post** in the admin panel
2. You should see a confirmation: ✅ "Test post sent successfully!"
3. Check your Mastodon feed for the test post

### **Create content preview**
1. Click **👁️ Content Preview**
2. You will see examples for all post types
3. With **📤 Post this content** you can post directly

## 🤖 **Automation and Schedules**

### **Daily posts** 📊
- **Time**: 20:00 (8:00 PM) daily
- **Content:**
  - New reviews of the day
  - Community statistics
  - Top player highlights
  - Positive gaming encouragement

### **Weekly posts** 🌟
- **Time**: Sundays 12:00 PM
- **Content:**
  - Week's MVP (player with best reviews)
  - Review of the week
  - Number of 5⭐ reviews
  - Community growth

### **Milestone posts** 🎉
- **Automatically at:**
  - 100, 500, 1000, 2500, 5000, 10000 reviews
- **Content:** Celebrate community achievements

## 📊 **Monitor Bot Status**

The admin panel shows:
- **Last daily post**: Timestamp of last daily update
- **Last weekly post**: Timestamp of last highlights
- **Next milestone**: When the next milestone post will happen
- **Automation**: Status of bot automation

## 📤 **Manual Posts**

You can post manually at any time:
- **📊 Daily update**: Immediate community update
- **🌟 Weekly highlights**: Current week's highlights
- **🧪 Test post**: Simple integration test

## 🛠️ **Troubleshooting**

### **"No access token" error**
- Check if the access token is entered correctly
- Token must not contain spaces
- Make sure the token has `write:statuses` permission

### **"Post failed" error**
- Check the Mastodon instance URL (without `https://`)
- Make sure the account is not suspended
- Rate limits: Wait 5-10 minutes between posts

### **No automatic posts**
- Automation only works for logged-in admins
- Browser tab must remain open for timer
- For 24/7 automation: implement a server-based solution

## 🌐 **Example Posts**

### **Daily update**
```
🎮 Daily Community Update!

📊 Today: 15 new reviews
🌟 Total: 1,247 reviews (⭐4.6 average)
💚 89% positive ratings

🏆 Top player: ProGamer123 (⭐4.9)

#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

### **Weekly highlights**
```
🌟 Weekly Community Highlights!

📊 This week:
• 87 new reviews
• 34 perfect 5⭐ reviews

🏆 Week's MVP: TeamPlayer42
   ⭐ 4.8 average (12 reviews)

💬 Review of the week:
"Fantastic teammate! Always positive and helpful..."
   - about SupportMaster

🎮 Join the friendliest Dota 2 community!
#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

### **Milestone post**
```
🎉 MILESTONE! 1000 Reviews!

Our Dota 2 community keeps growing!

🤝 Together we build a more positive gaming world
⭐ Every day, great players are discovered
🎮 Toxicity is a thing of the past - teamwork is today!

Thanks to everyone who participates! 💚

#Dota2 #Gaming #Community #PositiveGaming
🔗 https://hendkai.github.io/dota-player-rating/
```

## 🔧 **Advanced Configuration**

### **Adjust post times**
In the code (index.html) you will find:
```javascript
postSchedule: {
    daily: { hour: 20, minute: 0 }, // 20:00 daily
    weekly: { day: 0, hour: 12, minute: 0 }, // Sunday 12:00
}
```

### **Adjust hashtags**
```javascript
defaultHashtags: '#Dota2 #Gaming #Community #PositiveGaming'
```

### **Expand content templates**
The `generateDailyPost()` and `generateWeeklyPost()` functions contain various template variants for variety.

---

## 🎯 **Community Impact**

The bot helps to:
- **🚀 Grow the community** through regular visibility
- **💬 Foster engagement** by highlighting positive players
- **🌟 Positive gaming** by emphasizing good experiences
- **📊 Transparency** through open community stats

**The bot brings your community to life and shows the world that positive gaming is possible!** 🎮✨ 