(function () {
  "use strict";

  if (window.__UI_FIXED__) return;
  window.__UI_FIXED__ = true;

  function createUI() {
    console.log("🔥 Creating UI");

    const existing = document.getElementById("AUTO_UI_BOX");
    if (existing) return;

    const box = document.createElement("div");
    box.id = "AUTO_UI_BOX";

    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.width = "220px";
    box.style.background = "#111";
    box.style.color = "#fff";
    box.style.padding = "12px";
    box.style.borderRadius = "12px";
    box.style.zIndex = "2147483647"; // force top layer
    box.style.fontFamily = "sans-serif";

    box.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;">Auto Buy</div>
      <button id="uiTest" style="width:100%;">Click Test</button>
    `;

    document.body.appendChild(box);

    document.getElementById("uiTest").onclick = () => {
      alert("✅ UI WORKING");
    };
  }

  // ===== FORCE EXECUTION =====
  function waitForBody() {
    if (document.body) {
      createUI();
    } else {
      setTimeout(waitForBody, 50);
    }
  }

  waitForBody();

})();
