// ==UserScript==
// @name         SDO BMSTU: PDF fullscreen + download
// @match        https://sdo.bmstu.ru/mod/resource/view.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  "use strict";
  const style = document.createElement("style");
  style.textContent = `
    .pdf2-wrap{position:relative}
    .pdf2-bar{position:absolute;bottom:10px;right:10px;z-index:30;display:flex;gap:6px;
      opacity:0;pointer-events:none;transition:opacity .18s}
    .pdf2-wrap:hover .pdf2-bar,.pdf2-wrap:fullscreen .pdf2-bar{opacity:1;pointer-events:auto}
    .pdf2-bar button,.pdf2-bar a{display:inline-flex;align-items:center;justify-content:center;
      width:32px;height:32px;border:0;border-radius:6px;background:rgba(0,0,0,.6);color:#fff;
      font:600 16px/1 system-ui,sans-serif;cursor:pointer;text-decoration:none}
    .pdf2-bar button:hover,.pdf2-bar a:hover{background:rgba(0,0,0,.85)}
    .pdf2-wrap:fullscreen{background:#111}
    .pdf2-wrap:fullscreen>object,.pdf2-wrap:fullscreen>embed{
      width:100vw!important;height:100vh!important;border:0}
  `;
  document.head.appendChild(style);

  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;

  document.addEventListener("fullscreenchange", () => {
    document.querySelectorAll(".pdf2-wrap").forEach(w => {
      const b = w.querySelector(".pdf2-bar button");
      if (b) b.textContent = fsEl() === w ? "✕" : "⛶";
    });
  });

  function enhance(pdf) {
    if (pdf.dataset.pdf2) return;
    pdf.dataset.pdf2 = "1";
    const wrap = document.createElement("div");
    wrap.className = "pdf2-wrap";
    pdf.parentNode.insertBefore(wrap, pdf);
    wrap.appendChild(pdf);

    const bar = document.createElement("div");
    bar.className = "pdf2-bar";

    const bFs = document.createElement("button");
    bFs.type = "button";
    bFs.textContent = "⛶";
    bFs.title = "Во весь экран (Esc — выйти)";
    bFs.onclick = () => (fsEl() === wrap ? document.exitFullscreen() : wrap.requestFullscreen());

    const url = pdf.getAttribute("data") || pdf.getAttribute("src") || "";
    const bDl = document.createElement("a");
    bDl.textContent = "⬇";
    bDl.title = "Скачать PDF";
    bDl.href = url;
    bDl.download = url.split("/").pop() || "file.pdf";

    bar.append(bFs, bDl);
    wrap.appendChild(bar);
  }

  const scan = () => document.querySelectorAll(
    'object[type="application/pdf"], embed[type="application/pdf"]'
  ).forEach(enhance);
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
