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
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <b>AR Wallet</b>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amount" value="1000"
      style="width:100%;padding:8px;margin-bottom:8px;border-radius:8px;border:1px solid #ccc;" />

    <div style="display:flex;gap:6px;">
      <button id="start" style="flex:1;background:#22c55e;color:#fff;">Start</button>
      <button id="stop" style="flex:1;background:#ef4444;color:#fff;">Stop</button>
    </div>

    <div id="status" style="margin-top:6px;text-align:center;font-size:12px;">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");
  const light = document.getElementById("light");
  const amountInput = document.getElementById("amount");

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

  // ===== HIGHLIGHT SYSTEM =====
  function clearHighlights() {
    document.querySelectorAll(".ar-highlight").forEach(el => {
      el.classList.remove("ar-highlight");
      el.style.outline = "";
      el.style.background = "";
    });
  }

  function highlightMatches(val) {
    clearHighlights();

    let matches = [];

    document.querySelectorAll(".ml10").forEach(el => {
      const num = el.innerText.replace(/[^0-9]/g, "").replace(/^0+/, "");
      const row = el.closest(".x-row");

      if (!row) return;

      if (num === val) {
        row.classList.add("ar-highlight");
        row.style.outline = "2px solid lime";
        row.style.background = "#eaffea";
        matches.push(row);
      }
    });

    return matches;
  }

  function findBuy(row) {
    return [...row.querySelectorAll("button")]
      .find(btn => btn.innerText.trim().toLowerCase() === "buy");
  }

  function ensureVisible(el) {
    el.scrollIntoView({ block: "center", behavior: "instant" });
  }

  function realClick(el) {
    const rect = el.getBoundingClientRect();

    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(type => {
      el.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      }));
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
      let matches = highlightMatches(val);

      if (!matches.length) {
        setStatus("searching", "Searching");
        await sleep(400);
        continue;
      }

      setStatus("found", "Match Found");

      for (let row of matches) {
        let btn = findBuy(row);

        if (btn) {
          ensureVisible(btn);
          await sleep(100);

          realClick(btn);

          await sleep(500);

          if (isPaymentPage()) {
            setStatus("success", "Payment");

            await sleep(500);
            clickMobiKwik();

            await sleep(800);
            playChime();

            box.remove();
            running = false;
            return;
          }
        }
      }

      await sleep(400);
    }
  }

  // ===== BUTTONS =====
  document.getElementById("start").onclick = () => {
    unlockAudio();
    running = true;
    setStatus("running", "Running");
    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    clearHighlights();
    setStatus("idle", "Stopped");
  };

})();
