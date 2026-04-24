(function () {
  if (window.__AR_FINAL__) return;
  window.__AR_FINAL__ = true;

  let targetAmount = "";
  let running = false;

  const paymentSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang.ogg");
  const successSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

  function updateStatus(msg, color = "#fff") {
    status.innerText = msg;
    status.style.color = color;
  }

  function getAllItems() {
    return [...document.querySelectorAll("div, li, section")];
  }

  function findMatches() {
    return getAllItems().filter(el => el.innerText?.trim() === targetAmount);
  }

  function filterView(matches) {
    let all = getAllItems();
    all.forEach(el => {
      el.style.display = matches.includes(el) ? "" : "none";
    });
  }

  function resetView() {
    getAllItems().forEach(el => el.style.display = "");
  }

  function clickBuy(el) {
    let btn = el.closest("div")?.querySelector("button");
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  function clickDefault() {
    let el = [...document.querySelectorAll("*")]
      .find(e => e.innerText?.toLowerCase().includes("default"));
    if (el) {
      el.click();
      return true;
    }
    return false;
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickMobiKwik() {
    let el = [...document.querySelectorAll("*")]
      .find(e => e.innerText?.toLowerCase().includes("mobikwik"));
    if (el) {
      el.click();
      return true;
    }
    return false;
  }

  async function process() {
    if (!running) return;

    updateStatus("🔍 Scanning...", "#00d4ff");

    let matches = findMatches();

    if (matches.length === 0) {
      updateStatus("❌ No match → Default", "#ff4d4d");

      resetView();
      clickDefault();

      setTimeout(process, 1000);
      return;
    }

    updateStatus(`💰 Found ${matches.length}`, "#00ff88");

    filterView(matches);

    let count = 0;

    for (let el of matches) {
      if (count >= 3) break;

      let clicked = clickBuy(el);
      if (clicked) {
        count++;
        updateStatus(`🖱️ Click ${count}`, "#00ff88");
        await new Promise(r => setTimeout(r, 500));
      }
    }

    await new Promise(r => setTimeout(r, 2000));

    if (isPaymentPage()) {
      updateStatus("✅ Payment detected", "#00ff88");
      paymentSound.play();

      setTimeout(() => {
        if (clickMobiKwik()) {
          successSound.play();
          updateStatus("💳 MobiKwik clicked", "#00ff88");
        } else {
          updateStatus("⚠️ MobiKwik not found", "#ffaa00");
        }
      }, 800);

      running = false;
      startBtn.innerText = "START";
      return;
    }

    setTimeout(process, 1000);
  }

  // UI
  let panel = document.createElement("div");
  panel.style = `
    position:fixed;
    top:20px;
    right:20px;
    width:240px;
    background:#111;
    color:#fff;
    padding:15px;
    border-radius:12px;
    z-index:99999;
    font-family:sans-serif;
  `;

  let input = document.createElement("input");
  input.placeholder = "Enter Amount";
  input.style = "width:100%;margin-bottom:10px;padding:6px;border-radius:6px;border:none;";

  let startBtn = document.createElement("button");
  startBtn.innerText = "START";
  startBtn.style = "width:100%;padding:8px;background:#00d4ff;border:none;border-radius:6px;font-weight:bold;";

  let status = document.createElement("div");
  status.innerText = "Idle";
  status.style = "margin-top:10px;text-align:center;font-size:13px;";

  startBtn.onclick = () => {
    if (!running) {
      targetAmount = input.value.trim();
      if (!targetAmount) return alert("Enter amount");

      running = true;
      startBtn.innerText = "STOP";
      updateStatus("🚀 Running...", "#00ff88");

      process();
    } else {
      running = false;
      startBtn.innerText = "START";
      updateStatus("⏹ Stopped", "#ffaa00");
      resetView();
    }
  };

  panel.appendChild(input);
  panel.appendChild(startBtn);
  panel.appendChild(status);

  document.body.appendChild(panel);
})();
