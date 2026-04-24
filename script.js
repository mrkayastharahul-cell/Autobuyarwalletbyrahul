(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;

  // ===== UI =====
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:220px;
    background:#111;
    color:#fff;
    padding:12px;
    border-radius:12px;
    z-index:999999;
    font-family:sans-serif;
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
      <span>Auto Buy</span>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <div style="font-size:13px;margin:6px 0;">Target: ₹1000</div>

    <button id="start">Start</button>
    <button id="stop">Stop</button>

    <div id="status">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");
  const light = document.getElementById("light");

  document.getElementById("start").onclick = () => {
    running = true;
    status.innerText = "Running";
    light.style.background = "lime";
    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    status.innerText = "Stopped";
    light.style.background = "red";
  };

  function beep() {
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
  }

  function findTargets() {
    return Array.from(document.querySelectorAll("*"))
      .filter(el => {
        let text = el.innerText?.replace(/\s+/g, "");
        return text === "₹1000" || text === "1000";
      });
  }

  function findBuyButton(el) {
    let parent = el.closest("div");

    while (parent && parent !== document.body) {
      let btn = [...parent.querySelectorAll("button, span, div")]
        .find(b => b.innerText.toLowerCase().includes("buy"));

      if (btn) return btn;

      parent = parent.parentElement;
    }

    return null;
  }

  function clickDefault() {
    let btn = [...document.querySelectorAll("*")]
      .find(e => e.innerText.toLowerCase().includes("default"));

    if (btn) btn.click();
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment") ||
           document.body.innerText.includes("Select Payment Method");
  }

  function clickMobiKwik() {
    let el = [...document.querySelectorAll("*")]
      .find(e => e.innerText.toLowerCase().includes("mobikwik"));

    if (el) el.click();
  }

  async function loop() {
    while (running) {

      if (isPaymentPage()) {
        beep();
        clickMobiKwik();
        running = false;
        status.innerText = "Done";
        return;
      }

      let targets = findTargets();

      if (targets.length === 0) {
        status.innerText = "No match → Default";
        clickDefault();
        await sleep(1000);
        continue;
      }

      status.innerText = "Match found";

      let count = 0;

      for (let t of targets) {
        if (count >= 3) break;

        let btn = findBuyButton(t);

        if (btn) {
          btn.click();
          count++;
          await sleep(600);
        }
      }

      await sleep(2000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
