function formatInventory(inventory = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(inventory)) {
    if (value) parts.push(`${key}:${value}`);
  }
  return parts.length ? parts.join(" · ") : "empty";
}

function formatPriceLines(prefix, prices = {}) {
  return Object.entries(prices)
    .filter(([, value]) => value)
    .map(([ware, value]) => `${prefix} ${ware}:${value}`)
    .join(" · ");
}

export function renderHud(snapshot) {
  if (!snapshot) return;
  document.querySelector("#credits").textContent = String(snapshot.hud.credits);
  document.querySelector("#resource-summary").textContent = formatInventory(snapshot.hud.resources);
  document.querySelector("#time-summary").textContent = `${snapshot.time.toFixed(1)}s · ${snapshot.hud.paused ? "paused" : `${snapshot.hud.speed}x`}`;
  document.querySelector("#latest-event").textContent = snapshot.hud.latest_event || "--";

  const ships = document.querySelector("#ship-list");
  ships.replaceChildren(...snapshot.hud.ships.map((ship, index) => {
    const row = document.createElement("div");
    row.className = "ship-row";
    row.dataset.shipIndex = String(index);
    row.innerHTML = `
      <strong>${ship.name}</strong>
      <span>${ship.role} · ${ship.order}</span>
      <small>${ship.sector}${ship.target ? ` → ${ship.target}` : ""}</small>
    `;
    return row;
  }));

  const missions = document.querySelector("#mission-list");
  missions.replaceChildren(...snapshot.hud.missions.map((mission) => {
    const row = document.createElement("div");
    row.className = `mission ${mission.completed ? "completed" : ""}`;
    row.innerHTML = `<span>${mission.completed ? "✓" : "○"}</span><strong>${mission.description}</strong><small>${mission.reward} credits</small>`;
    return row;
  }));

  const market = document.querySelector("#market-list");
  if (market) {
    market.replaceChildren(...(snapshot.market?.stations || []).map((station) => {
      const row = document.createElement("div");
      row.className = "market-row";
      const buy = formatPriceLines("買", station.buy_prices);
      const sell = formatPriceLines("賣", station.sell_prices);
      row.innerHTML = `
        <strong>${station.name}</strong>
        <span>${station.kind} · cash:${station.credits}</span>
        <small>庫存 ${formatInventory(station.inventory)} / 容量 ${formatInventory(station.capacity)}</small>
        <small>${[buy, sell].filter(Boolean).join(" ｜ ") || "無公開報價"}</small>
      `;
      return row;
    }));
  }

  const chrono = snapshot.chronocam || {};
  document.querySelector("#chronocam-mode").textContent = chrono.mode || "--";
  document.querySelector("#chronocam-view-time").textContent = `${Number(chrono.view_time || 0).toFixed(1)}s`;
  document.querySelector("#chronocam-follow").textContent = chrono.follow_live ? "Live tail" : "Replay fixed";
  document.querySelector("#chronocam-panel")?.classList.toggle("replay", chrono.mode === "Replay");
}
