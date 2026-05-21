import init, { StarboundHeadlessEngine } from "./out/starbound_orders.js";
import { createRenderer } from "./render_canvas.js";
import { installInput } from "./input.js";
import { renderHud } from "./hud.js";

const TICK_SECONDS = 1 / 30;
const COMMAND_PROTOCOL_VERSION = 1;

let engine;
let renderer;
let lastFrame = performance.now();
let commandSeq = 0;
let speedMultiplier = 1;
let latestSnapshot = null;
let selectedShipId = "ship/scout-01";

function status(message) {
  const node = document.querySelector("#command-status");
  if (node) node.textContent = message;
}

function commandEnvelope(command) {
  commandSeq += 1;
  return JSON.stringify({
    protocol_version: COMMAND_PROTOCOL_VERSION,
    id: `html5-${Date.now()}-${commandSeq}`,
    issued_at_frontend_time: performance.now() / 1000,
    target_sim_time: latestSnapshot?.time ?? 0,
    source: "WebOverlay",
    command,
  });
}

export function applyCommand(command, label = command.type) {
  try {
    engine.apply_command_json(commandEnvelope(command));
    if (command.type === "SelectShip") selectedShipId = command.ship_id;
    publishSnapshot();
    status(`已送出：${label}`);
  } catch (error) {
    console.error(error);
    status(`命令失敗：${error}`);
  }
}

function seekChronoCam(seconds) {
  engine.seek(seconds);
  publishSnapshot();
  status(`ChronoCam 回看 ${seconds.toFixed(1)}s`);
}

function returnChronoCamLive() {
  engine.return_to_live();
  publishSnapshot();
  status("ChronoCam 已回到 Live");
}

function publishSnapshot() {
  latestSnapshot = JSON.parse(engine.view_snapshot_json());
  window.__starboundLatestSnapshot = latestSnapshot;
  localStorage.setItem("starbound_orders_html5_snapshot", JSON.stringify(latestSnapshot));
  return latestSnapshot;
}

function handleMapTap(point) {
  const hit = renderer.hitTest(latestSnapshot, point);
  window.__starboundHtml5LastHit = hit;
  if (!hit) {
    status("未命中星圖物件");
    return;
  }
  if (hit.type === "ship") {
    selectedShipId = hit.id;
    applyCommand({ type: "SelectShip", ship_id: hit.id }, `Select ${hit.label}`);
  } else if (hit.type === "poi") {
    applyCommand({ type: "AssignMove", ship_id: selectedShipId, target: hit.id }, `${selectedShipId} → ${hit.label}`);
  }
}

function frame(now) {
  const elapsed = Math.min(0.12, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  engine.tick(elapsed * speedMultiplier);
  const snapshot = publishSnapshot();
  renderHud(snapshot);
  renderer.render(snapshot);
  requestAnimationFrame(frame);
}

function setMobileSheetTab(tab) {
  const sheet = document.querySelector("#mobile-sheet");
  if (!sheet) return;
  sheet.dataset.activeTab = tab;
  document.querySelectorAll("#mobile-sheet-tabs [data-sheet-tab]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.sheetTab === tab));
  });
}

function setMobileSheetCollapsed(collapsed) {
  const sheet = document.querySelector("#mobile-sheet");
  const toggle = document.querySelector("#mobile-sheet-toggle");
  if (!sheet || !toggle) return;
  sheet.dataset.collapsed = String(collapsed);
  toggle.textContent = collapsed ? "展開" : "收合";
  toggle.setAttribute("aria-expanded", String(!collapsed));
}

function wireMobileSheet() {
  document.querySelectorAll("#mobile-sheet-tabs [data-sheet-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setMobileSheetCollapsed(false);
      setMobileSheetTab(button.dataset.sheetTab);
    });
  });
  document.querySelector("#mobile-sheet-toggle")?.addEventListener("click", () => {
    const sheet = document.querySelector("#mobile-sheet");
    setMobileSheetCollapsed(sheet?.dataset.collapsed !== "true");
  });
  setMobileSheetTab(document.querySelector("#mobile-sheet")?.dataset.activeTab || "ships");
  setMobileSheetCollapsed(document.querySelector("#mobile-sheet")?.dataset.collapsed === "true");
}

function wireControls() {
  document.querySelectorAll("button[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.command;
      if (command === "toggle_pause") {
        applyCommand({ type: "TogglePause" }, "TogglePause");
      } else if (command === "speed_1") {
        speedMultiplier = 1;
        applyCommand({ type: "SetSpeed", speed: 1 }, "SetSpeed 1x");
      } else if (command === "speed_3") {
        speedMultiplier = 3;
        applyCommand({ type: "SetSpeed", speed: 3 }, "SetSpeed 3x");
      } else if (command === "select_scout") {
        selectedShipId = "ship/scout-01";
        applyCommand({ type: "SelectShip", ship_id: "ship/scout-01" }, "Select Scout");
      } else if (command === "enter_north_gate") {
        applyCommand({ type: "AssignMove", ship_id: "ship/scout-01", target: "poi/2" }, "Scout → North Gate");
      } else if (command === "chrono_rewind_5") {
        const liveTime = latestSnapshot?.time ?? 0;
        seekChronoCam(Math.max(0, liveTime - 5));
      } else if (command === "chrono_live") {
        returnChronoCamLive();
      } else if (command === "reset") {
        engine.reset();
        speedMultiplier = 1;
        publishSnapshot();
        status("已重置");
      }
    });
  });
}

async function main() {
  status("載入 Rust WASM headless engine...");
  await init();
  engine = new StarboundHeadlessEngine();
  renderer = createRenderer(document.querySelector("#star-map"));
  installInput(renderer, { onTap: handleMapTap });
  wireControls();
  wireMobileSheet();
  publishSnapshot();
  renderHud(latestSnapshot);
  renderer.render(latestSnapshot);
  window.__starboundHtml5Ready = true;
  window.__starboundHtml5Engine = engine;
  status("HTML5 frontend 已連線 Rust headless engine");
  requestAnimationFrame(frame);
}

main().catch((error) => {
  console.error(error);
  status(`啟動失敗：${error}`);
});
