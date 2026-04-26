(function () {
  "use strict";

  if (window.__AUTO_BUY_FLOW__) return;
  window.__AUTO_BUY_FLOW__ = true;

  let running = false;

  // ===== CONFIG =====
  let TARGET_AMOUNT = "1000"; // change from UI if needed
  let SPEED = 400;

  // ===== UTILS =====
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function log(msg) {
    console.log("[BOT]", msg);
  }

  // ===== STEP 1: CLICK DEFAULT =====
  function clickDefault() {
    const el = [...document.querySelectorAll("p.txt")]
      .find(e => e.innerText.trim().toLowerCase() === "default");

    if (el) {
      el.click();
      log("Clicked Default");
      return true;
    }
    return false;
  }

  // ===== STEP 2: FILTER AMOUNT =====
  function filterAmount(val) {
    let count = 0;

    document.querySelectorAll(".ml10").forEach(el => {
      const cleaned = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      const row = el.closest(".x-row");

      if (!row) return;

      if (cleaned === val) {
        row.style.display = "";
        count++;
      } else {
        row.style.display = "none";
      }
    });

    return count;
  }

  function resetFilter() {
    document.querySelectorAll(".ml10").forEach(el => {
      const row = el.closest(".x-row");
      if (row) row.style.display = "";
    });
  }

  // ===== STEP 3: FIND TARGET =====
  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el => {
      const cleaned = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      return cleaned === val;
    });
  }

  // ===== STEP 4: CLICK BUY =====
  function findBuyBtn(el) {
    const row = el.closest(".x-row");
    if (!row) return null;

    return row.querySelector("button.van-button");
  }

  async function clickBuy(targets) {
    for (let t of targets) {
      const btn = findBuyBtn(t);

      if (btn) {
        btn.click();
        log("Clicked Buy");

        await sleep(SPEED);

        if (isPaymentPage()) return true;
      }
    }
    return false;
  }

  // ===== STEP 5: CHECK PAYMENT PAGE =====
  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  // ===== STEP 6: CLICK MOBIKWIK =====
  function clickMobiKwik() {
    const el = document.querySelector(".banklogo");

    if (el) {
      el.click();
      log("Clicked MobiKwik");
      return true;
    }
    return false;
  }

  // ===== STEP 7: SOUND =====
  function playPop() {
    const a = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    a.play();
  }

  function playChime() {
    const a = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    a.play();
  }

  // ===== STEP 8: REMOVE PAYMENT UI =====
  function removePaymentUI() {
    document.body.innerHTML = "<h2 style='text-align:center'>✅ DONE</h2>";
  }

  // ===== MAIN LOOP =====
  async function loop() {
    while (running) {

      // STEP A: CLICK DEFAULT ALWAYS FIRST
      clickDefault();

      await sleep(200);

      // STEP B: FILTER
      let count = filterAmount(TARGET_AMOUNT);

      if (count === 0) {
        log("No Match → Retry");
        resetFilter();
        await sleep(SPEED);
        continue;
      }

      log("Match Found");

      // STEP C: CLICK BUY
      let targets = findTargets(TARGET_AMOUNT);
      let success = await clickBuy(targets);

      if (!success) {
        log("Click failed → Retry");
        await sleep(SPEED);
        continue;
      }

      // STEP D: PAYMENT PAGE
      if (isPaymentPage()) {
        log("On Payment Page");

        playPop();

        await sleep(500);

        clickMobiKwik();

        await sleep(500);

        playChime();

        await sleep(500);

        removePaymentUI();

        running = false;
        return;
      }
    }
  }

  // ===== CONTROLS =====
  window.startAutoBuy = function (amount = "1000", speed = 400) {
    TARGET_AMOUNT = amount;
    SPEED = speed;
    running = true;

    log("Started with amount: " + amount);
    loop();
  };

  window.stopAutoBuy = function () {
    running = false;
    log("Stopped");
  };

})();
