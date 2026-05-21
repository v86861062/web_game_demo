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
    publishSnapshot();
    status(`已送出：${label}`);
  } catch (error) {
    console.error(error);
    status(`命令失敗：${error}`);
  }
}

function publishSnapshot() {
  latestSnapshot = JSON.parse(engine.view_snapshot_json());
  window.__starboundLatestSnapshot = latestSnapshot;
  localStorage.setItem("starbound_orders_html5_snapshot", JSON.stringify(latestSnapshot));
  return latestSnapshot;
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
        applyCommand({ type: "SelectShip", ship_id: "ship/scout-01" }, "Select Scout");
      } else if (command === "enter_north_gate") {
        applyCommand({ type: "AssignMove", ship_id: "ship/scout-01", target: "poi/2" }, "Scout → North Gate");
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
  installInput(renderer);
  wireControls();
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
