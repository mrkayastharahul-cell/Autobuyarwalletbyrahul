(function () {
  "use strict";

  if (window.__AR_FINAL__) return;
  window.__AR_FINAL__ = true;

  let running = false;
  let REMOVED_ROWS = [];
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
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
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

  function setStatus(type, txt) {
    status.innerText = txt;
    const colors = {
      idle: "gray",
      running: "lime",
      searching: "orange",
      found: "blue",
      success: "green"
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

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickDefault() {
    document.querySelectorAll(".txt").forEach(el => {
      if (el.innerText.trim().toLowerCase() === "default") el.click();
    });
  }

  function restoreRemoved() {
    REMOVED_ROWS.forEach(item => item.parent.appendChild(item.element));
    REMOVED_ROWS = [];
  }

  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el =>
      el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "") === val
    );
  }

  function findBuy(el) {
    return el.closest(".x-row")?.querySelector("button.van-button");
  }

  function realClick(el) {
    el.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function hardRemoveExcept(target) {
    document.querySelectorAll(".ml10").forEach(el => {
      const row = el.closest(".x-row");
      if (!row) return;

      if (row !== target.closest(".x-row")) {
        REMOVED_ROWS.push({ parent: row.parentNode, element: row });
        row.remove();
      }
    });
  }

  function clickMobiKwik() {
    const el = document.querySelector(".banklogo");
    if (el) {
      realClick(el);
      playPop();
    }
  }

  // ===== LOOP =====
  async function loop() {
    while (running) {

      clickDefault();

      let val = amountInput.value.trim();
      let targets = findTargets(val);

      updateMatches(targets.length);

      if (!targets.length) {
        setStatus("searching", "Searching");
        await sleep(STATE.speed);
        continue;
      }

      setStatus("found", "Match Found");

      for (let t of targets) {
        let btn = findBuy(t);

        if (btn) {
          realClick(btn);
          addClick();

          // REMOVE AFTER CLICK
          hardRemoveExcept(t);

          await sleep(STATE.speed);

          if (isPaymentPage()) {
            setStatus("success", "Payment");

            await sleep(600);
            clickMobiKwik();

            await sleep(1000);
            playChime();

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
    restoreRemoved();
    setStatus("idle", "Stopped");
  };

})();
