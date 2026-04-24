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

    <div style="margin:6px 0;">Target: ₹1000</div>

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

  // ===== NEW TARGET FINDER (NO HARD DEPENDENCY) =====
  function findTargets() {
    return Array.from(document.querySelectorAll("*"))
      .filter(el => {
        let text = el.innerText?.replace(/\s+/g, "");
        return text === "₹1000" || text === "1000";
      });
  }

  function highlight(el) {
    el.style.outline = "2px solid red";
  }

  function findBuyText(startEl) {
    let current = startEl;

    while (current && current !== document.body) {
      let btn = [...current.querySelectorAll("button, span, div")]
        .find(el => el.innerText?.toLowerCase().includes("buy"));

      if (btn) return btn;

      current = current.parentElement;
    }

    return null;
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Payment Method") ||
           document.body.innerText.includes("Select Method Payment");
  }

  async function clickTargets(targets) {
    if (targets.length === 0) return false;

    let count = 0;

    for (let t of targets) {
      if (count >= 3) break;

      highlight(t);

      let buyText = findBuyText(t);

      if (buyText) {
        buyText.click();
        count++;

        await sleep(500);

        if (isPaymentPage()) {
          running = false;
          status.innerText = "Stopped (Payment Page)";
          light.style.background = "red";
          return true;
        }
      }
    }

    return false;
  }

  async function loop() {
    while (running) {

      if (isPaymentPage()) {
        running = false;
        status.innerText = "Stopped (Payment Page)";
        light.style.background = "red";
        return;
      }

      await sleep(500);

      let targets = findTargets();

      if (targets.length > 0) {
        let success = await clickTargets(targets);
        if (success) return;
      }

      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
