(function () {
  if (window.__AR_FINAL_V2__) return;
  window.__AR_FINAL_V2__ = true;

  let running = false;
  let targetAmount = "";

  const paymentSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang.ogg");
  const successSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

  function updateStatus(msg) {
    status.innerText = msg;
  }

  function getBuyButtons() {
    return [...document.querySelectorAll("button")]
      .filter(b => b.innerText.toLowerCase().includes("buy"));
  }

  function rowContainsAmount(btn) {
    let row = btn.closest("div");
    if (!row) return false;

    return row.innerText.includes(targetAmount);
  }

  function getMatchingButtons() {
    let buyButtons = getBuyButtons();
    return buyButtons.filter(btn => rowContainsAmount(btn));
  }

  function clickDefault() {
    let btn = [...document.querySelectorAll("button")]
      .find(b => b.innerText.toLowerCase().includes("default"));

    if (btn) btn.click();
  }

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickMobiKwik() {
    let el = [...document.querySelectorAll("*")]
      .find(e => e.innerText.toLowerCase().includes("mobikwik"));

    if (el) {
      el.click();
      successSound.play();
      return true;
    }
    return false;
  }

  function highlight(el) {
    el.style.outline = "2px solid red";
  }

  async function process() {
    if (!running) return;

    updateStatus("Scanning...");

    // STEP 1: Find matching Buy buttons
    let matches = getMatchingButtons();

    if (matches.length === 0) {
      updateStatus("No match → Default");

      clickDefault();

      setTimeout(process, 1000);
      return;
    }

    updateStatus(`Found ${matches.length}`);

    // STEP 2: Limit to 3
    matches = matches.slice(0, 3);

    // STEP 3: Click each
    for (let btn of matches) {
      btn.scrollIntoView({ behavior: "smooth", block: "center" });
      highlight(btn);

      btn.focus();
      btn.click();

      await new Promise(r => setTimeout(r, 500));
    }

    // STEP 4: Wait for response
    await new Promise(r => setTimeout(r, 2000));

    // STEP 5: Check payment page
    if (isPaymentPage()) {
      updateStatus("Payment detected");

      paymentSound.play();

      setTimeout(() => {
        if (clickMobiKwik()) {
          updateStatus("MobiKwik clicked");
        } else {
          updateStatus("MobiKwik not found");
        }
      }, 1000);

      running = false;
      startBtn.innerText = "START";
      return;
    }

    // STEP 6: Retry loop
    setTimeout(process, 1000);
  }

  // UI
  let panel = document.createElement("div");
  panel.style = `
    position:fixed;
    top:20px;
    right:20px;
    width:220px;
    background:#111;
    color:#fff;
    padding:10px;
    z-index:99999;
    font-family:sans-serif;
  `;

  let input = document.createElement("input");
  input.placeholder = "Enter Amount";
  input.style = "width:100%;margin-bottom:10px;padding:5px;";

  let startBtn = document.createElement("button");
  startBtn.innerText = "START";
  startBtn.style = "width:100%;padding:6px;";

  let status = document.createElement("div");
  status.innerText = "Idle";

  startBtn.onclick = () => {
    if (!running) {
      targetAmount = input.value.trim();
      if (!targetAmount) return alert("Enter amount");

      running = true;
      startBtn.innerText = "STOP";
      process();
    } else {
      running = false;
      startBtn.innerText = "START";
      status.innerText = "Stopped";
    }
  };

  panel.appendChild(input);
  panel.appendChild(startBtn);
  panel.appendChild(status);

  document.body.appendChild(panel);
})();
