(function () {
  "use strict";

  if (window.__AR_FINAL__) return;
  window.__AR_FINAL__ = true;

  let running = false;
  let audioCtx;

  // ===== UI =====
  const box = document.createElement("div");
  box.style = `
    position:fixed; bottom:20px; right:20px;
    width:240px; background:#f3f4f6; padding:14px;
    border-radius:14px; z-index:999999;
    font-family:sans-serif; box-shadow:0 8px 20px rgba(0,0,0,0.25);
  `;

  box.innerHTML = `
    <div id="dragHandle" style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <b>AR Wallet</b>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amount" value="1000"
      style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px;border:1px solid #ccc;" />

    <select id="speed" style="width:100%;margin-bottom:8px;">
      <option value="200">⚡ Fast</option>
      <option value="500" selected>Normal</option>
      <option value="1000">Slow</option>
    </select>

    <div style="display:flex;justify-content:space-between;font-size:12px;">
      <span>Matches: <b id="m">0</b></span>
      <span>Clicks: <b id="c">0</b></span>
    </div>

    <div style="display:flex;gap:6px;margin-top:8px;">
      <button id="start" style="flex:1;background:#22c55e;color:#fff;">Start</button>
      <button id="stop" style="flex:1;background:#ef4444;color:#fff;">Stop</button>
    </div>

    <div id="status" style="margin-top:6px;text-align:center;font-size:12px;">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");
  const light = document.getElementById("light");
  const amountInput = document.getElementById("amount");
  const speedSelect = document.getElementById("speed");
  const matchEl = document.getElementById("m");
  const clickEl = document.getElementById("c");

  let STATE = { matches: 0, clicks: 0, speed: 500 };

  // ===== STATUS =====
  function setStatus(type, txt) {
    status.innerText = txt;

    const colors = {
      idle: "gray",
      running: "lime",
      searching: "orange",
      found: "blue",
      success: "green",
      fail: "red"
    };

    light.style.background = colors[type] || "gray";
  }

  function updateMatches(n) {
    STATE.matches = n;
    matchEl.innerText = n;
  }

  function addClick() {
    STATE.clicks++;
    clickEl.innerText = STATE.clicks;
  }

  speedSelect.onchange = () => {
    STATE.speed = +speedSelect.value;
  };

  // ===== AUDIO =====
  function unlockAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function playPop() {
    if (!audioCtx) return;
    let o = audioCtx.createOscillator();
    let g = audioCtx.createGain();
    o.frequency.value = 1000;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    setTimeout(() => o.stop(), 300);
  }

  function playChime() {
    if (!audioCtx) return;
    let o = audioCtx.createOscillator();
    let g = audioCtx.createGain();
    o.frequency.value = 700;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    setTimeout(() => o.stop(), 600);
  }

  // ===== HELPERS =====
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickDefault() {
    document.querySelectorAll(".txt").forEach(el => {
      if (el.innerText.trim().toLowerCase() === "default") {
        el.click();
      }
    });
  }

  function filter(val) {
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

    if (count > 0) setStatus("found", "Match Found");
    else setStatus("searching", "Searching");

    return count;
  }

  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el =>
      el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "") === val
    );
  }

  function findBuy(el) {
    return el.closest(".x-row")?.querySelector("button.van-button");
  }

  function clickMobiKwik() {
    const el = document.querySelector(".banklogo");
    if (el) {
      el.click();
      playPop();
    }
  }

  // ===== CORE LOOP =====
  async function loop() {
    while (running) {

      // Step 1: Default
      clickDefault();

      // Step 2: Filter
      let val = amountInput.value.trim();
      let count = filter(val);

      // Step 3: No match → repeat
      if (count === 0) {
        setStatus("fail", "No Match");
        await sleep(STATE.speed);
        continue;
      }

      // Step 4: Click Buy
      let targets = findTargets(val);

      for (let t of targets) {
        let btn = findBuy(t);

        if (btn) {
          btn.click();
          addClick();

          await sleep(STATE.speed);

          // Step 5: Payment page?
          if (isPaymentPage()) {

            setStatus("success", "Payment Page");

            // Step 6: POP
            playPop();

            // Step 7: Click Mobikwik
            await sleep(800);
            clickMobiKwik();

            // Step 8: Chime
            await sleep(1000);
            playChime();

            // Step 9: Remove UI
            box.remove();

            running = false;
            return;
          }
        }
      }

      await sleep(STATE.speed);
    }
  }

  // ===== BUTTONS =====
  document.getElementById("start").onclick = () => {
    unlockAudio();

    STATE.matches = 0;
    STATE.clicks = 0;
    updateMatches(0);
    clickEl.innerText = 0;

    running = true;
    setStatus("running", "Running");

    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    setStatus("idle", "Stopped");
  };

})();
