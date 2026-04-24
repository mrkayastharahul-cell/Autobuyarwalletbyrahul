# ⚡ AR Auto Buyer

## 🚀 What this is

A browser-based automation script that:

* Scans page for exact amount
* Buys automatically
* Detects payment screen
* Selects MobiKwik

---

## ⚙️ Features

* Instant full-page scan
* Exact match only
* Auto retry every 1 second
* Clicks up to 3 Buy buttons
* Auto Default fallback
* Payment detection
* Sound alerts
* Auto MobiKwik selection

---

## ▶️ How to Use

### Paste this in browser console:

```javascript
fetch('https://api.github.com/repos/mrkayastharahul-cell/Autobuyarwalletbyrahul/commits/main')
.then(r => r.json())
.then(d => {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/Autobuyarwalletbyrahul@' + d.sha + '/script.js';
  document.body.appendChild(s);
});
```

---

## 🔁 How it works

1. Press START
2. Scans page instantly
3. If match:

   * Shows only matches
   * Clicks Buy (max 3)
4. If no match:

   * Clicks Default
   * Retries every 1 sec
5. On payment page:

   * Plays sound
   * Clicks MobiKwik
   * Stops

---

## ⚠️ Notes

* Works based on page layout (may break if site changes)
* Exact text match required
* Use carefully to avoid detection/blocking

---

## 👤 Author

Rahul
