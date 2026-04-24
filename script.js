(function () {
  if (window.__FINAL__) return;
  window.__FINAL__ = true;

  let running = false;

  // ===== UI =====
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    top:200px;
    left:200px;
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
    <div id="dragHandle" style="display:flex;justify-content:space-between;margin-bottom:8px;cursor:move;">
      <span style="font-weight:600;font-size:13px;">AR Wallet</span>
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
  function playSound() {
    const a = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    a.play().catch(() => {});
  }

  // ===== HELPERS =====
  function clickDefault() {
    [...document.querySelectorAll("*")].forEach(el => {
      if (el.innerText?.trim().toLowerCase() === "default") el.click();
    });
  }

  function findTargets(val) {
    return [...document.querySelectorAll(".ml10")].filter(el => {
      const text = el.innerText.replace(/\s+/g, '');
      return text.includes(val);
    });
  }

  function highlight(el) {
    el.style.outline = "2px solid red";
  }

  function findBuy(el) {
    let parent = el;
    while (parent && parent !== document.body) {
      let btn = parent.querySelector(".van-button__text");
      if (btn && btn.innerText.trim().toLowerCase().includes("buy")) {
        return btn;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment") ||
           document.body.innerText.includes("Select Payment Method");
  }

  function clickMobiKwik() {
    const els = [...document.querySelectorAll("*")];

    for (let el of els) {
      if (el.innerText?.toLowerCase().includes("mobikwik")) {
        let parent = el;

        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent);

          if (
            parent.onclick ||
            parent.tagName === "BUTTON" ||
            parent.getAttribute("role") === "button" ||
            style.cursor === "pointer"
          ) {
            parent.click();
            return true;
          }

          parent = parent.parentElement;
        }
      }
    }

    return false;
  }

  async function clickTargets(targets) {
    let count = 0;

    for (let t of targets) {
      if (count >= 3) break;

      highlight(t);

      let btn = findBuy(t);
      if (btn) {
        btn.click();
        count++;

        await sleep(500);

        if (isPaymentPage()) {
          setTimeout(() => {
            playSound();
            clickMobiKwik();
            status.innerText = "Done";
          }, 1000);

          running = false;
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
        setTimeout(() => {
          playSound();
          clickMobiKwik();
        }, 1000);

        running = false;
        status.innerText = "Done";
        light.style.background = "red";
        return;
      }

      clickDefault();

      await sleep(300);

      const val = amountInput.value.trim();
      let targets = findTargets(val);

      if (targets.length > 0) {
        let done = await clickTargets(targets);
        if (done) return;
      }

      await sleep(700);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ===== BUTTONS =====
  document.getElementById("start").onclick = () => {
    const val = amountInput.value.trim();
    if (!val) return;

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

})();
