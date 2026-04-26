(function () {
  "use strict";

  if (window.__AUTO_BUY_FINAL__) return;
  window.__AUTO_BUY_FINAL__ = true;

  let running = false;
  let TARGET_AMOUNT = "1000";
  let SPEED = 400;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ================= UI =================
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:240px;
    background:#111;
    color:#fff;
    padding:12px;
    border-radius:12px;
    z-index:999999;
    font-family:sans-serif;
    box-shadow:0 8px 20px rgba(0,0,0,0.4);
    cursor:move;
  `;

  box.innerHTML = `
    <div id="drag" style="font-weight:bold;margin-bottom:6px;display:flex;justify-content:space-between;">
      Auto Buy
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amt" value="1000" 
      style="width:100%;padding:6px;margin-bottom:6px;border-radius:6px;border:none;" />

    <select id="spd" style="width:100%;margin-bottom:6px;padding:6px;border-radius:6px;">
      <option value="200">⚡ Fast</option>
      <option value="400" selected>⚖️ Normal</option>
      <option value="800">🐢 Slow</option>
    </select>

    <div style="display:flex;gap:6px;margin-bottom:6px;">
      <button id="startBtn" style="flex:1;background:#22c55e;border:none;padding:6px;border-radius:6px;color:#fff;">Start</button>
      <button id="stopBtn" style="flex:1;background:#ef4444;border:none;padding:6px;border-radius:6px;color:#fff;">Stop</button>
    </div>

    <div style="font-size:12px;display:flex;justify-content:space-between;">
      <span>Matches: <b id="m">0</b></span>
      <span>Clicks: <b id="c">0</b></span>
    </div>

    <div id="status" style="margin-top:6px;font-size:12px;text-align:center;">Idle</div>
  `;

  document.body.appendChild(box);

  // ===== DRAG =====
  let drag = false, x, y;

  document.getElementById("drag").onmousedown = (e) => {
    drag = true;
    x = e.clientX - box.offsetLeft;
    y = e.clientY - box.offsetTop;
  };

  document.onmousemove = (e) => {
    if (drag) {
      box.style.left = e.clientX - x + "px";
      box.style.top = e.clientY - y + "px";
      box.style.bottom = "auto";
      box.style.right = "auto";
    }
  };

  document.onmouseup = () => drag = false;

  // ===== UI REFS =====
  const status = document.getElementById("status");
  const light = document.getElementById("light");
  const mEl = document.getElementById("m");
  const cEl = document.getElementById("c");

  let matches = 0;
  let clicks = 0;

  function setStatus(text, color) {
    status.innerText = text;
    light.style.background = color;
  }

  function updateMatches(n) {
    matches = n;
    mEl.innerText = n;
  }

  function addClick() {
    clicks++;
    cEl.innerText = clicks;
  }

  // ================= CORE =================

  function clickDefault() {
    const el = [...document.querySelectorAll("p.txt")]
      .find(e => e.innerText.trim().toLowerCase() === "default");
    if (el) el.click();
  }

  function filterAmount(val) {
    let count = 0;

    document.querySelectorAll(".ml10").forEach(el => {
      const num = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      const row = el.closest(".x-row");

      if (!row) return;

      if (num === val) {
        row.style.display = "";
        count++;
      } else {
        row.style.display = "none";
      }
    });

    updateMatches(count);
    return count;
  }

  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el => {
      const num = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      return num === val;
    });
  }

  function findBuy(el) {
    return el.closest(".x-row")?.querySelector("button.van-button");
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickMobiKwik() {
    const el = document.querySelector(".banklogo");
    if (el) el.click();
  }

  function playPop() {
    new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play();
  }

  function playChime() {
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
  }

  function removePaymentUI() {
    document.body.innerHTML = "<h2 style='text-align:center'>✅ DONE</h2>";
  }

  // ================= LOOP =================

  async function loop() {
    while (running) {

      clickDefault();
      await sleep(150);

      let count = filterAmount(TARGET_AMOUNT);

      if (count === 0) {
        setStatus("Searching...", "orange");
        await sleep(SPEED);
        continue;
      }

      setStatus("Match Found", "blue");

      let targets = findTargets(TARGET_AMOUNT);

      for (let t of targets) {
        let btn = findBuy(t);

        if (btn) {
          btn.click();
          addClick();

          setStatus("Clicked Buy", "yellow");

          await sleep(SPEED);

          if (isPaymentPage()) {
            setStatus("Payment Page", "green");

            playPop();
            await sleep(400);

            clickMobiKwik();
            await sleep(400);

            playChime();
            await sleep(400);

            removePaymentUI();

            running = false;
            return;
          }
        }
      }

      await sleep(SPEED);
    }
  }

  // ================= BUTTONS =================

  document.getElementById("startBtn").onclick = () => {
    TARGET_AMOUNT = document.getElementById("amt").value.trim();
    SPEED = parseInt(document.getElementById("spd").value);

    matches = 0;
    clicks = 0;
    updateMatches(0);
    cEl.innerText = 0;

    running = true;
    setStatus("Running", "lime");

    loop();
  };

  document.getElementById("stopBtn").onclick = () => {
    running = false;
    setStatus("Stopped", "red");
  };

})();
