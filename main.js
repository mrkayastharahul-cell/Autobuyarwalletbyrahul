(function () {
  "use strict";

  if (window.__AUTO_FINAL__) return;
  window.__AUTO_FINAL__ = true;

  let running = false;
  let TARGET = "1000";
  let SPEED = 400;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ===== CREATE UI =====
  function createUI() {
    if (document.getElementById("AUTO_BOX")) return;

    const box = document.createElement("div");
    box.id = "AUTO_BOX";

    box.style = `
      position:fixed;
      bottom:20px;
      right:20px;
      width:240px;
      background:#111;
      color:#fff;
      padding:12px;
      border-radius:12px;
      z-index:2147483647;
      font-family:sans-serif;
      box-shadow:0 8px 20px rgba(0,0,0,0.5);
    `;

    box.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px;">Auto Buy</div>

      <input id="amt" value="1000"
        style="width:100%;padding:6px;margin-bottom:6px;border-radius:6px;" />

      <select id="spd" style="width:100%;margin-bottom:6px;padding:6px;">
        <option value="200">Fast</option>
        <option value="400" selected>Normal</option>
        <option value="800">Slow</option>
      </select>

      <div style="display:flex;gap:6px;margin-bottom:6px;">
        <button id="start" style="flex:1;">Start</button>
        <button id="stop" style="flex:1;">Stop</button>
      </div>

      <div style="font-size:12px;">
        Matches: <b id="m">0</b> | Clicks: <b id="c">0</b>
      </div>

      <div id="status" style="margin-top:6px;font-size:12px;">Idle</div>
    `;

    document.body.appendChild(box);

    setupLogic();
  }

  // ===== CORE LOGIC =====
  function setupLogic() {

    const status = document.getElementById("status");
    const mEl = document.getElementById("m");
    const cEl = document.getElementById("c");

    let matches = 0;
    let clicks = 0;

    function setStatus(t){ status.innerText = t; }
    function setMatches(n){ matches=n; mEl.innerText=n; }
    function addClick(){ clicks++; cEl.innerText=clicks; }

    function clickDefault(){
      const el=[...document.querySelectorAll("p.txt")]
        .find(e=>e.innerText.trim().toLowerCase()==="default");
      if(el) el.click();
    }

    function filter(val){
      let count=0;
      document.querySelectorAll(".ml10").forEach(el=>{
        const num=el.innerText.replace(/[^0-9]/g,"").replace(/^0+/,"");
        const row=el.closest(".x-row");
        if(!row)return;

        if(num===val){ row.style.display=""; count++; }
        else row.style.display="none";
      });
      setMatches(count);
      return count;
    }

    function targets(val){
      return [...document.querySelectorAll(".ml10")].filter(el=>{
        const num=el.innerText.replace(/[^0-9]/g,"").replace(/^0+/,"");
        return num===val;
      });
    }

    function buyBtn(el){
      return el.closest(".x-row")?.querySelector("button.van-button");
    }

    function paymentPage(){
      return document.body.innerText.includes("Select Method Payment");
    }

    function mobikwik(){
      const el=document.querySelector(".banklogo");
      if(el) el.click();
    }

    async function loop(){
      while(running){

        clickDefault();
        await sleep(150);

        let count=filter(TARGET);

        if(count===0){
          setStatus("Searching...");
          await sleep(SPEED);
          continue;
        }

        setStatus("Match Found");

        let t=targets(TARGET);

        for(let el of t){
          let btn=buyBtn(el);

          if(btn){
            btn.click();
            addClick();

            setStatus("Clicked Buy");

            await sleep(SPEED);

            if(paymentPage()){
              setStatus("Payment Page");

              mobikwik();

              setStatus("Done");
              running=false;
              return;
            }
          }
        }

        await sleep(SPEED);
      }
    }

    document.getElementById("start").onclick=()=>{
      TARGET=document.getElementById("amt").value.trim();
      SPEED=parseInt(document.getElementById("spd").value);

      matches=0;
      clicks=0;
      setMatches(0);
      cEl.innerText=0;

      running=true;
      setStatus("Running");

      loop();
    };

    document.getElementById("stop").onclick=()=>{
      running=false;
      setStatus("Stopped");
    };
  }

  // ===== FORCE LOAD UI (IMPORTANT FIX) =====
  function ensureUI(){
    createUI();
  }

  // run multiple times to bypass site re-render
  const interval = setInterval(ensureUI, 1000);

  // also run once immediately
  if (document.readyState === "complete") {
    ensureUI();
  } else {
    window.addEventListener("load", ensureUI);
  }

})();
