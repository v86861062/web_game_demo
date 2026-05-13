const urlParams = new URLSearchParams(window.location.search);
const assetVersion = urlParams.get("deploy") ?? "";
const assetSuffix = assetVersion ? `?deploy=${encodeURIComponent(assetVersion)}` : "";
const pinchMode = ["follow", "fixed", "soft"].includes(urlParams.get("pinch"))
  ? urlParams.get("pinch")
  : "follow";
const pinchAnchorMode = ["exact", "sector", "auto"].includes(urlParams.get("anchor"))
  ? urlParams.get("anchor")
  : "exact";
const wasmModulePromise = import(`./out/starbound_orders.js${assetSuffix}`);

const commandStatus = document.getElementById("command-status");
const perfStats = document.getElementById("perf-stats");
const focusStatus = document.getElementById("focus-status");
const creditsOutput = document.getElementById("credits");
const resourceSummary = document.getElementById("resource-summary");
const missionList = document.getElementById("mission-list");
const shipList = document.getElementById("ship-list");
const shipPanel = document.getElementById("ship-panel");
const missionPanel = document.getElementById("mission-panel");
const moreControls = document.getElementById("more-controls");
const pinchDebugMarker = document.getElementById("pinch-debug-marker");
const pinchDebugLabel = document.getElementById("pinch-debug-label");
const pinchAnchorDebugMarker = document.getElementById("pinch-anchor-debug-marker");
const pinchAnchorDebugLabel = document.getElementById("pinch-anchor-debug-label");
const pinchSectorDebugMarker = document.getElementById("pinch-sector-debug-marker");
const pinchSectorDebugLabel = document.getElementById("pinch-sector-debug-label");
const pinchFingerOneMarker = document.getElementById("pinch-finger-one-marker");
const pinchFingerOneLabel = document.getElementById("pinch-finger-one-label");
const pinchFingerOneAnchorMarker = document.getElementById("pinch-finger-one-anchor-marker");
const pinchFingerOneAnchorLabel = document.getElementById("pinch-finger-one-anchor-label");
const pinchFingerTwoMarker = document.getElementById("pinch-finger-two-marker");
const pinchFingerTwoLabel = document.getElementById("pinch-finger-two-label");
const pinchFingerTwoAnchorMarker = document.getElementById("pinch-finger-two-anchor-marker");
const pinchFingerTwoAnchorLabel = document.getElementById("pinch-finger-two-anchor-label");
const pinchScalePanel = document.getElementById("pinch-scale-panel");
const pinchScaleDistance = document.getElementById("pinch-scale-distance");
const pinchScaleRatio = document.getElementById("pinch-scale-ratio");
const pinchScaleCamera = document.getElementById("pinch-scale-camera");
const pinchScaleDrift = document.getElementById("pinch-scale-drift");
const pinchScaleInput = document.getElementById("pinch-scale-input");
const bevyCanvas = document.getElementById("bevy-canvas");
let lastCommandAt = 0;
let lastShownEvent = "";
let lastShownPerf = "";
let lastShownHud = "";
let lastShownPinchDebug = "";
let lastShownPinchAnchorDebug = "";
let clientPinchStart = null;
let clientPinchStartDistance = 0;
let lastTouchGestureAt = 0;
let lastAnchorDebugAt = 0;
let touchGestureSeq = 0;

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

function formatMission(mission) {
  const state = mission.completed ? "✓" : "○";
  const reward = mission.reward > 0 ? ` +${mission.reward}` : "";
  return `${state} ${mission.description}${reward}`;
}

function cargoSummary(cargo) {
  const parts = [];
  if (cargo?.energy) {
    parts.push(`Energy ${cargo.energy}`);
  }
  if (cargo?.ore) {
    parts.push(`Ore ${cargo.ore}`);
  }
  if (cargo?.metal) {
    parts.push(`Metal ${cargo.metal}`);
  }
  return parts.length ? parts.join(" · ") : "Cargo empty";
}

function formatShip(ship) {
  const location = ship.target
    ? `${ship.sector} → ${ship.target}`
    : `${ship.sector}${ship.poi ? ` · ${ship.poi}` : ""}`;
  return `${ship.name} · ${ship.order} · ${location} · ${cargoSummary(ship.cargo)}`;
}

function replaceChildrenWithRows(container, rows) {
  if (!container) {
    return;
  }

  container.replaceChildren(...rows);
}

function setActiveDrawer(name) {
  const panels = {
    ships: shipPanel,
    missions: missionPanel,
  };
  const nextDrawer = document.body.dataset.drawer === name ? "" : name;
  document.body.dataset.drawer = nextDrawer;

  for (const [drawerName, panel] of Object.entries(panels)) {
    if (!panel) {
      continue;
    }
    const isOpen = nextDrawer === drawerName;
    panel.dataset.open = String(isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
  }

  for (const button of document.querySelectorAll("[data-drawer]")) {
    button.setAttribute("aria-expanded", String(button.dataset.drawer === nextDrawer));
  }
}

function toggleMoreControls() {
  const expanded = document.body.dataset.controlsExpanded !== "true";
  document.body.dataset.controlsExpanded = String(expanded);
  moreControls?.setAttribute("aria-expanded", String(expanded));
}

function updateHudFromSnapshot(hud) {
  if (creditsOutput) {
    creditsOutput.textContent = String(hud.credits ?? "--");
  }

  if (resourceSummary && hud.resources) {
    resourceSummary.textContent =
      `Energy ${hud.resources.energy ?? 0} · Ore ${hud.resources.ore ?? 0} · Metal ${hud.resources.metal ?? 0}`;
  }

  if (Array.isArray(hud.missions)) {
    const rows = hud.missions.map((mission) => {
      const row = document.createElement("div");
      row.className = `mission ${mission.completed ? "done" : "pending"}`;
      row.textContent = formatMission(mission);
      return row;
    });
    replaceChildrenWithRows(missionList, rows);
  }

  if (Array.isArray(hud.ships)) {
    const rows = hud.ships.map((ship) => {
      const row = document.createElement("div");
      row.className = "ship-row";
      row.textContent = formatShip(ship);
      return row;
    });
    replaceChildrenWithRows(shipList, rows);
  }

  if (hud.latest_event && hud.latest_event !== lastShownEvent) {
    lastShownEvent = hud.latest_event;
    setStatus(hud.latest_event);
  }
}

setInterval(() => {
  const event = localStorage.getItem("starbound_orders_event");
  if (event && event !== lastShownEvent) {
    lastShownEvent = event;
    setStatus(event);
  }
}, 300);

setInterval(() => {
  const hudValue = localStorage.getItem("starbound_orders_hud");
  if (!hudValue || hudValue === lastShownHud) {
    return;
  }

  try {
    const hud = JSON.parse(hudValue);
    lastShownHud = hudValue;
    updateHudFromSnapshot(hud);
  } catch (error) {
    console.warn("Ignoring invalid HUD snapshot", error);
  }
}, 300);

setInterval(() => {
  const perf = localStorage.getItem("starbound_orders_perf");
  if (perfStats && perf && perf !== lastShownPerf) {
    lastShownPerf = perf;
    perfStats.textContent = perf;
  }
}, 500);

function updatePinchDebugMarker(debug) {
  if (!pinchDebugMarker) {
    return;
  }

  if (!debug?.active) {
    pinchDebugMarker.dataset.active = "false";
    return;
  }

  pinchDebugMarker.dataset.active = "true";
  pinchDebugMarker.style.transform = `translate(${debug.x}px, ${debug.y}px) translate(-50%, -50%)`;
  if (pinchDebugLabel) {
    const dx = debug.x - debug.start_x;
    const dy = debug.y - debug.start_y;
    pinchDebugLabel.textContent = `粉紅兩指中點 ${Math.round(debug.x)},${Math.round(debug.y)} · 起點偏移 ${Math.round(dx)},${Math.round(dy)}`;
  }
}

function setMarker(marker, x, y, active = true) {
  if (!marker) {
    return;
  }
  marker.dataset.active = String(active);
  if (active) {
    marker.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }
}

function hideFingerPointDebugMarkers() {
  for (const marker of [
    pinchFingerOneMarker,
    pinchFingerOneAnchorMarker,
    pinchFingerTwoMarker,
    pinchFingerTwoAnchorMarker,
  ]) {
    setMarker(marker, 0, 0, false);
  }
}

function updateFingerPointDebugMarkers(debug) {
  if (!debug?.active) {
    hideFingerPointDebugMarkers();
    return;
  }

  setMarker(pinchFingerOneMarker, debug.first_finger_x, debug.first_finger_y);
  setMarker(pinchFingerOneAnchorMarker, debug.first_anchor_x, debug.first_anchor_y);
  setMarker(pinchFingerTwoMarker, debug.second_finger_x, debug.second_finger_y);
  setMarker(pinchFingerTwoAnchorMarker, debug.second_anchor_x, debug.second_anchor_y);

  if (pinchFingerOneLabel) {
    pinchFingerOneLabel.textContent = `紫色手指1 ${Math.round(debug.first_finger_x)},${Math.round(debug.first_finger_y)}`;
  }
  if (pinchFingerOneAnchorLabel) {
    pinchFingerOneAnchorLabel.textContent = `橘色手指1地圖點 ${Math.round(debug.first_anchor_x)},${Math.round(debug.first_anchor_y)} · 漂移 ${debug.first_drift.toFixed(1)}px`;
  }
  if (pinchFingerTwoLabel) {
    pinchFingerTwoLabel.textContent = `綠色手指2 ${Math.round(debug.second_finger_x)},${Math.round(debug.second_finger_y)}`;
  }
  if (pinchFingerTwoAnchorLabel) {
    pinchFingerTwoAnchorLabel.textContent = `藍色手指2地圖點 ${Math.round(debug.second_anchor_x)},${Math.round(debug.second_anchor_y)} · 漂移 ${debug.second_drift.toFixed(1)}px`;
  }
}

function updatePinchAnchorDebugMarker(debug) {
  if (!pinchAnchorDebugMarker) {
    return;
  }

  if (!debug?.active) {
    pinchAnchorDebugMarker.dataset.active = "false";
    if (pinchSectorDebugMarker) {
      pinchSectorDebugMarker.dataset.active = "false";
    }
    hideFingerPointDebugMarkers();
    updatePinchScalePanel(debug);
    return;
  }

  updateFingerPointDebugMarkers(debug);
  lastAnchorDebugAt = performance.now();
  updatePinchScalePanel(debug);

  pinchAnchorDebugMarker.dataset.active = "true";
  pinchAnchorDebugMarker.style.transform = `translate(${debug.anchor_x}px, ${debug.anchor_y}px) translate(-50%, -50%)`;
  if (pinchAnchorDebugLabel) {
    pinchAnchorDebugLabel.textContent = `黃色地圖錨點 ${Math.round(debug.anchor_x)},${Math.round(debug.anchor_y)} · 漂移 ${debug.drift.toFixed(1)}px`;
  }

  if (!pinchSectorDebugMarker) {
    return;
  }

  if (debug.sector_id === null || debug.sector_id === undefined) {
    pinchSectorDebugMarker.dataset.active = "false";
    return;
  }

  pinchSectorDebugMarker.dataset.active = "true";
  pinchSectorDebugMarker.style.transform = `translate(${debug.sector_x}px, ${debug.sector_y}px) translate(-50%, -50%)`;
  if (pinchSectorDebugLabel) {
    const sectorName = debug.sector_name ?? `#${debug.sector_id}`;
    pinchSectorDebugLabel.textContent = `青色星區中心 ${sectorName} ${Math.round(debug.sector_x)},${Math.round(debug.sector_y)} · 距手指 ${debug.sector_drift.toFixed(1)}px`;
  }
}

function publishClientPinchDebug(debug) {
  const value = JSON.stringify(debug);
  localStorage.setItem("starbound_orders_pinch_debug", value);
  lastShownPinchDebug = value;
  updatePinchDebugMarker(debug);
}

function hideClientPinchAnchorDebug() {
  const debug = {
    active: false,
    finger_x: 0,
    finger_y: 0,
    anchor_x: 0,
    anchor_y: 0,
    drift: 0,
    map_x: 0,
    map_y: 0,
    sector_id: null,
    sector_name: null,
    sector_x: 0,
    sector_y: 0,
    sector_drift: 0,
  };
  const value = JSON.stringify(debug);
  localStorage.setItem("starbound_orders_pinch_anchor_debug", value);
  lastShownPinchAnchorDebug = value;
  updatePinchAnchorDebugMarker(debug);
}

function touchMidpoint(touches) {
  const first = touches[0];
  const second = touches[1];
  return {
    x: (first.clientX + second.clientX) * 0.5,
    y: (first.clientY + second.clientY) * 0.5,
  };
}

function touchDistance(touches) {
  const first = touches[0];
  const second = touches[1];
  if (!first || !second) {
    return 0;
  }
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function formatNumber(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "--";
}

function updatePinchScalePanel(debug) {
  if (!pinchScalePanel) {
    return;
  }

  if (!debug?.active) {
    pinchScalePanel.dataset.active = "false";
    pinchScalePanel.setAttribute("aria-hidden", "true");
    return;
  }

  const now = performance.now();
  const jsAge = lastTouchGestureAt > 0 ? now - lastTouchGestureAt : NaN;
  const rustAge = lastAnchorDebugAt > 0 ? now - lastAnchorDebugAt : NaN;
  pinchScalePanel.dataset.active = "true";
  pinchScalePanel.setAttribute("aria-hidden", "false");

  if (pinchScaleDistance) {
    pinchScaleDistance.textContent = `距離 ${formatNumber(debug.start_distance, 1)} → ${formatNumber(debug.current_distance, 1)} px`;
  }
  if (pinchScaleRatio) {
    pinchScaleRatio.textContent = `ratio ${formatNumber(debug.zoom_ratio, 3)} · 手指距離 ${formatNumber(clientPinchStartDistance, 1)} → ${formatNumber(debug.current_distance, 1)}`;
  }
  if (pinchScaleCamera) {
    pinchScaleCamera.textContent = `camera scale ${formatNumber(debug.start_scale, 3)} → ${formatNumber(debug.current_scale, 3)} · Δ ${formatNumber(debug.scale_delta, 3)}`;
  }
  if (pinchScaleDrift) {
    pinchScaleDrift.textContent = `漂移 中心 ${formatNumber(debug.drift, 1)} · 手指 ${formatNumber(debug.first_drift, 1)} / ${formatNumber(debug.second_drift, 1)} px`;
  }
  if (pinchScaleInput) {
    pinchScaleInput.textContent = `更新延遲 JS ${formatNumber(jsAge, 0)}ms · Rust ${formatNumber(rustAge, 0)}ms · seq ${touchGestureSeq}`;
  }
}

function publishTouchGesture(touches, active = true) {
  touchGestureSeq += 1;
  lastTouchGestureAt = performance.now();
  const distance = active && touches.length >= 2 ? touchDistance(touches) : 0;
  const points = Array.from(touches).slice(0, 2).map((touch) => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
  }));
  localStorage.setItem("starbound_orders_touch_gesture", JSON.stringify({
    seq: touchGestureSeq,
    active,
    mode: pinchMode,
    anchor_mode: pinchAnchorMode,
    distance,
    start_distance: clientPinchStartDistance,
    client_time_ms: lastTouchGestureAt,
    touches: active ? points : [],
  }));
}

bevyCanvas?.addEventListener("touchstart", (event) => {
  if (event.touches.length >= 2) {
    event.preventDefault();
    clientPinchStart = touchMidpoint(event.touches);
    clientPinchStartDistance = touchDistance(event.touches);
    publishTouchGesture(event.touches, true);
    publishClientPinchDebug({
      active: true,
      x: clientPinchStart.x,
      y: clientPinchStart.y,
      start_x: clientPinchStart.x,
      start_y: clientPinchStart.y,
    });
  }
}, { passive: false });

bevyCanvas?.addEventListener("touchmove", (event) => {
  if (event.touches.length < 2) {
    return;
  }
  event.preventDefault();
  clientPinchStart ??= touchMidpoint(event.touches);
  if (clientPinchStartDistance <= 0) {
    clientPinchStartDistance = touchDistance(event.touches);
  }
  publishTouchGesture(event.touches, true);
  const midpoint = touchMidpoint(event.touches);
  publishClientPinchDebug({
    active: true,
    x: midpoint.x,
    y: midpoint.y,
    start_x: clientPinchStart.x,
    start_y: clientPinchStart.y,
  });
}, { passive: false });

for (const eventName of ["touchend", "touchcancel"]) {
  bevyCanvas?.addEventListener(eventName, (event) => {
    if (clientPinchStart) {
      event.preventDefault();
    }
    clientPinchStart = null;
    clientPinchStartDistance = 0;
    publishTouchGesture([], false);
    publishClientPinchDebug({ active: false, x: 0, y: 0, start_x: 0, start_y: 0 });
    hideClientPinchAnchorDebug();
  }, { passive: false });
}

setInterval(() => {
  const debugValue = localStorage.getItem("starbound_orders_pinch_debug");
  if (!debugValue || debugValue === lastShownPinchDebug) {
    return;
  }

  try {
    const debug = JSON.parse(debugValue);
    lastShownPinchDebug = debugValue;
    updatePinchDebugMarker(debug);
  } catch (error) {
    console.warn("Ignoring invalid pinch debug snapshot", error);
  }
}, 50);

setInterval(() => {
  const debugValue = localStorage.getItem("starbound_orders_pinch_anchor_debug");
  if (!debugValue || debugValue === lastShownPinchAnchorDebug) {
    return;
  }

  try {
    const debug = JSON.parse(debugValue);
    lastShownPinchAnchorDebug = debugValue;
    updatePinchAnchorDebugMarker(debug);
  } catch (error) {
    console.warn("Ignoring invalid pinch anchor debug snapshot", error);
  }
}, 50);

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

for (const button of document.querySelectorAll("[data-drawer]")) {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveDrawer(button.dataset.drawer);
  });
}

moreControls?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleMoreControls();
});

wasmModulePromise.then(({ default: init }) => init({
  module_or_path: `./out/starbound_orders_bg.wasm${assetSuffix}`,
})).then(() => {
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
