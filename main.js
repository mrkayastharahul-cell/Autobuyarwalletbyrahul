(function () {
  "use strict";

  if (window.__AUTO_UI__) return;
  window.__AUTO_UI__ = true;

  function init() {

    console.log("🔥 UI INIT");

    // ===== UI =====
    const box = document.createElement("div");
    box.id = "auto-ui-box";

    box.style = `
      position:fixed !important;
      bottom:20px !important;
      right:20px !important;
      width:240px;
      background:#111;
      color:#fff;
      padding:12px;
      border-radius:12px;
      z-index:99999999;
      font-family:sans-serif;
      display:block !important;
    `;

    box.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px;">Auto Buy UI</div>
      <button id="testBtn" style="width:100%;">Test UI</button>
    `;

    document.body.appendChild(box);

    document.getElementById("testBtn").onclick = () => {
      alert("UI WORKING ✅");
    };
  }

  // ===== WAIT FOR DOM =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
