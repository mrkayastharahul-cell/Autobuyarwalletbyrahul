(function () {
  if (window.__FINAL__) return;
  window.__FINAL__ = true;

  let running = false;
  let audioCtx;

  // ===== UI =====
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:220px;
    background:#f3f4f6;
    color:#111;
    padding:14px;
    border-radius:14px;
    z-index:999999;
    font-family:sans-serif;
    box-shadow:0 8px 20px rgba(0,0,0,0.25);
    cursor:move;
  `;

  box.innerHTML = `
    <div id="dragHandle" style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;">AR Wallet</span>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amount" value="1000"
      style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;" />

    <div style="display:flex;gap:8px;">
      <button id="start" style="flex:1;background:#22c55e;color:#fff;border:none;padding:7px;border-radius:8px;">Start</button>
      <button id="stop" style="flex:1;background:#ef4444;color:#fff;border:none;padding:7px;border-radius:8px;">Stop</button>
    </div>

    <div id="status" style="margin-top:8px;text-align:center;font-size:12px;">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");
  const light = document.getElementById("light");
  const amountInput = document.getElementById("amount");

  // ===== DRAG =====
  let isDragging = false, offsetX, offsetY;

  document.getElementById("dragHandle").onmousedown = (e) => {
    isDragging = true;
    const rect = box.getBoundingClientRect();

    box.style.left = rect.left + "px";
    box.style.top = rect.top + "px";
    box.style.right = "auto";
    box.style.bottom = "auto";

    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
  };

  document.onmousemove = (e) => {
    if (isDragging) {
      box.style.left = (e.clientX - offsetX) + "px";
      box.style.top = (e.clientY - offsetY) + "px";
    }
  };

  document.onmouseup = () => isDragging = false;

  // ===== SOUND =====
  function unlockAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function playChime() {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 800;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    setTimeout(() => o.stop(), 600);
  }

  function playPop() {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 1200;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    setTimeout(() => o.stop(), 300);
  }

  // ===== FILTER =====
  function filterResults(val) {
    let found = false;

    document.querySelectorAll(".ml10").forEach(el => {
      const cleaned = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      const row = el.closest(".x-row");

      if (!row) return;

      if (cleaned === val) {
        row.style.display = "";
        found = true;
      } else {
        row.style.display = "none";
      }
    });

    return found;
  }

  function resetResults() {
    document.querySelectorAll(".ml10").forEach(el => {
      const row = el.closest(".x-row");
      if (row) row.style.display = "";
    });
  }

  // ===== FIND TARGET =====
  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el => {
      const cleaned = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      return cleaned === val;
    });
  }

  // ===== LOCKED BUY BUTTON =====
  function findBuy(el) {
    const row = el.closest(".x-row");
    if (!row) return null;

    return row.querySelector("button.van-button");
  }

  function click(el) {
    el.click();
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment") ||
           document.body.innerText.includes("Select Payment Method");
  }

  function clickMobiKwik() {
    const el = document.querySelector(".bgmobikwik");
    if (el) {
      el.click();
      playPop();
      return true;
    }
    return false;
  }

  // ===== MULTI CLICK =====
  async function clickTargets(targets) {
    let count = 0;

    for (let t of targets) {
      if (count >= 3) break;

      let btn = findBuy(t);

      if (btn) {
        click(btn);
        count++;

        await sleep(500);

        if (isPaymentPage()) {
          setTimeout(() => {
            playChime();
            clickMobiKwik();
            status.innerText = "Done";
          }, 1200);

          running = false;
          light.style.background = "red";
          return true;
        }
      }
    }

    return false;
  }

  // ===== LOOP =====
  async function loop() {
    while (running) {

      if (isPaymentPage()) {
        setTimeout(() => {
          playChime();
          clickMobiKwik();
        }, 1200);

        running = false;
        status.innerText = "Done";
        light.style.background = "red";
        return;
      }

      const val = amountInput.value.trim();

      let found = filterResults(val);

      if (!found) {
        resetResults();
        clickDefault();
        await sleep(700);
        continue;
      }

      await sleep(300);

      let targets = findTargets(val);

      if (targets.length) {
        let done = await clickTargets(targets);
        if (done) return;
      }

      await sleep(700);
    }
  }

  function clickDefault() {
    document.querySelectorAll("*").forEach(el => {
      if (el.innerText?.toLowerCase().trim() === "default") {
        el.click();
      }
    });
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ===== BUTTONS =====
  document.getElementById("start").onclick = () => {
    const val = amountInput.value.trim();
    if (!val) return;

    unlockAudio();

    running = true;
    status.innerText = "Running";
    light.style.background = "lime";

    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    status.innerText = "Stopped";
    light.style.background = "red";
    resetResults();
  };

})();
