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

function formatTags(label, values = []) {
  return values.length ? `${label} ${values.join(",")}` : "";
}

function formatTradePlan(plan) {
  if (!plan) return "";
  return `${plan.ware} ${plan.amount} · ${plan.source} → ${plan.destination} · +${plan.profit}cr`;
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
    const cargo = formatInventory(ship.cargo || {});
    const plan = ship.trade_plan
      ? `${ship.trade_plan.ware} ${ship.trade_plan.amount} · POI ${ship.trade_plan.source_poi} → ${ship.trade_plan.destination_poi}`
      : "";
    row.innerHTML = `
      <strong>${ship.name}</strong>
      <span>${ship.role} · ${ship.order}${cargo !== "empty" ? ` · cargo ${cargo}` : ""}</span>
      <small>${ship.sector}${ship.target ? ` → ${ship.target}` : ""}${plan ? ` · ${plan}` : ""}</small>
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
    const route = snapshot.market?.best_route;
    const routeRow = document.createElement("div");
    routeRow.className = "market-row best-route";
    routeRow.innerHTML = route
      ? `<strong>最佳物流</strong><span>${formatTradePlan(route)}</span><small>依站點庫存/價格/容量自動評估</small>`
      : `<strong>最佳物流</strong><span>暫無正利潤路線</span><small>等待庫存、需求或價格變化</small>`;
    const stationRows = (snapshot.market?.stations || []).map((station) => {
      const row = document.createElement("div");
      row.className = "market-row";
      const buy = formatPriceLines("買", station.buy_prices);
      const sell = formatPriceLines("賣", station.sell_prices);
      const reservedIn = formatInventory(station.reserved_incoming || {});
      const reservedOut = formatInventory(station.reserved_outgoing || {});
      const tags = [
        formatTags("缺", station.shortages || []),
        formatTags("餘", station.surpluses || []),
      ].filter(Boolean).join(" ｜ ");
      row.innerHTML = `
        <strong>${station.name}</strong>
        <span>${station.kind} · cash:${station.credits}</span>
        <small>庫存 ${formatInventory(station.inventory)} / 容量 ${formatInventory(station.capacity)}</small>
        <small>保留 入:${reservedIn} · 出:${reservedOut}</small>
        <small>${[buy, sell].filter(Boolean).join(" ｜ ") || "無公開報價"}</small>
        <small>${tags || "供需平衡"}</small>
      `;
      return row;
    });
    market.replaceChildren(routeRow, ...stationRows);
  }

  const chrono = snapshot.chronocam || {};
  document.querySelector("#chronocam-mode").textContent = chrono.mode || "--";
  document.querySelector("#chronocam-view-time").textContent = `${Number(chrono.view_time || 0).toFixed(1)}s`;
  document.querySelector("#chronocam-follow").textContent = chrono.follow_live ? "Live tail" : "Replay fixed";
  document.querySelector("#chronocam-panel")?.classList.toggle("replay", chrono.mode === "Replay");
}
