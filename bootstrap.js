import init from "./out/starbound_orders.js";

const commandStatus = document.getElementById("command-status");
const perfStats = document.getElementById("perf-stats");
const focusStatus = document.getElementById("focus-status");
let lastCommandAt = 0;
let lastShownEvent = "";
let lastShownPerf = "";

function setStatus(message) {
  if (commandStatus) {
    commandStatus.textContent = message;
  }
}

setStatus("JS 已啟動");

function updateFocusStatus() {
  if (!focusStatus) {
    return;
  }

  const throttled = document.hidden || !document.hasFocus();
  focusStatus.hidden = !throttled;
}

document.addEventListener("visibilitychange", updateFocusStatus);
window.addEventListener("focus", updateFocusStatus);
window.addEventListener("blur", updateFocusStatus);
updateFocusStatus();

setInterval(() => {
  const event = localStorage.getItem("starbound_orders_event");
  if (event && event !== lastShownEvent) {
    lastShownEvent = event;
    setStatus(event);
  }
}, 300);

setInterval(() => {
  const perf = localStorage.getItem("starbound_orders_perf");
  if (perfStats && perf && perf !== lastShownPerf) {
    lastShownPerf = perf;
    perfStats.textContent = perf;
  }
}, 500);

function sendCommand(button) {
  const now = performance.now();
  if (now - lastCommandAt < 120) {
    return;
  }
  lastCommandAt = now;

  const command = button.dataset.command;
  localStorage.setItem("starbound_orders_command", command);
  setStatus(`已送出：${button.dataset.label}`);

  button.dataset.pressed = "true";
  setTimeout(() => {
    delete button.dataset.pressed;
  }, 180);
}

for (const button of document.querySelectorAll("[data-command]")) {
  button.addEventListener("pointerup", (event) => {
    event.preventDefault();
    sendCommand(button);
  });
  button.addEventListener("click", (event) => {
    event.preventDefault();
    sendCommand(button);
  });
}

init().then(() => {
  setStatus("模擬執行中");
}).catch((error) => {
  if (String(error).includes("Using exceptions for control flow")) {
    setStatus("模擬執行中");
    return;
  }

  setStatus("WASM 啟動失敗");
  const message = document.createElement("pre");
  message.textContent = String(error);
  message.style.cssText =
    "position:fixed;inset:16px;z-index:10;white-space:pre-wrap;color:#ffd0d0";
  document.body.appendChild(message);
});
