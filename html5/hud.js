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

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function idValue(value, prefix) {
  if (typeof value === "string") return value.includes("/") ? value : `${prefix}/${value}`;
  if (typeof value === "number") return `${prefix}/${value}`;
  if (Array.isArray(value)) return idValue(value[0], prefix);
  if (value && typeof value === "object") return idValue(value[0] ?? value.id ?? value.value, prefix);
  return `${prefix}/0`;
}

function marketSection(title, rows, tab = "overview") {
  const section = document.createElement("section");
  section.className = "market-section";
  section.dataset.marketTab = tab;
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading, ...rows);
  return section;
}

export function renderHud(snapshot, { onTradeCommand } = {}) {
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

    const factionRows = (snapshot.market?.factions || []).map((faction) => {
      const row = document.createElement("div");
      row.className = "market-row faction-row";
      row.innerHTML = `
        <strong>${faction.name || faction.faction}</strong>
        <span>${faction.credits}cr · stations:${faction.owned_stations} · ships:${faction.owned_ships}</span>
      `;
      return row;
    });

    const offerRows = (snapshot.market?.offers || []).slice(0, 8).map((offer) => {
      const row = document.createElement("div");
      row.className = "market-row offer-row";
      row.innerHTML = `
        <strong>${offer.side} ${offer.ware}</strong>
        <span>${offer.station} · ${offer.price}cr · amt:${offer.amount}</span>
        <small>${offer.owner} · reserved:${offer.reserved || 0}</small>
      `;
      return row;
    });

    const competitionRows = (snapshot.market?.competition || []).map((competition) => {
      const row = document.createElement("div");
      row.className = "market-row competition-row";
      row.innerHTML = `
        <strong>${competition.ware} 競價</strong>
        <span>買 ${competition.best_buy_price || "--"} @ ${competition.best_buy_station || "--"} · 賣 ${competition.best_sell_price || "--"} @ ${competition.best_sell_station || "--"}</span>
        <small>spread:${competition.spread} · buyers:${competition.competing_buyers} · sellers:${competition.competing_sellers}</small>
      `;
      return row;
    });

    const queueRows = (snapshot.market?.build_queues || []).map((queue) => {
      const row = document.createElement("div");
      row.className = "market-row build-row";
      row.innerHTML = `
        <strong>${queue.station}</strong>
        <span>${queue.owner} building ${queue.blueprint} · ${formatPercent(queue.progress)}</span>
        <small>needs ${formatInventory(queue.required)} · missing ${formatInventory(queue.missing || {})} · ETA ${Number(queue.remaining_seconds || 0).toFixed(0)}s</small>
        <small>${queue.ready ? "材料已就緒" : "等待物流補料"}</small>
      `;
      return row;
    });

    const riskRows = (snapshot.market?.route_risks || []).slice(0, 6).map((risk) => {
      const row = document.createElement("div");
      row.className = "market-row risk-row";
      row.innerHTML = `
        <strong>${risk.from} → ${risk.to}</strong>
        <span>risk ${formatPercent(risk.risk)} · raids:${risk.recent_raids}</span>
        <small>patrol coverage ${Number(risk.patrol_coverage || 0).toFixed(2)}</small>
      `;
      return row;
    });

    const pirateImpactRows = (snapshot.market?.pirate_impacts || []).slice(0, 5).map((impact) => {
      const row = document.createElement("div");
      row.className = "market-row pirate-impact-row";
      row.innerHTML = `
        <strong>${impact.route}</strong>
        <span>pirate impact ${formatPercent(impact.risk)} · raids:${impact.recent_raids}</span>
        <small>affected offers:${impact.affected_offers} · premium:${impact.buy_price_premium}%</small>
      `;
      return row;
    });

    const historyRows = (snapshot.market?.history || []).slice(-6).map((sample) => {
      const row = document.createElement("div");
      row.className = "market-row history-row";
      row.innerHTML = `
        <strong>${sample.station} · ${sample.ware}</strong>
        <span>inv:${sample.inventory} · buy:${sample.buy_price} · sell:${sample.sell_price}</span>
        <small>shortage ticks:${sample.shortage_ticks}</small>
      `;
      return row;
    });

    const alertRows = (snapshot.market?.alerts || []).map((alert) => {
      const row = document.createElement("div");
      row.className = "market-row alert-row";
      row.innerHTML = `<strong>⚠ ${alert}</strong>`;
      return row;
    });

    const tradeRows = (snapshot.market?.selected_trade_options || []).slice(0, 4).map((option) => {
      const row = document.createElement("div");
      row.className = "market-row trade-command-row";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `下單 ${option.ware} ${option.amount}`;
      button.addEventListener("click", () => onTradeCommand?.({
        type: "AssignTrade",
        ship_id: idValue(option.ship_id, "ship"),
        source: idValue(option.source_poi, "poi"),
        destination: idValue(option.destination_poi, "poi"),
        ware: option.ware,
        amount: option.amount,
      }, `Manual trade ${option.ware} @ ${option.station}`));
      row.innerHTML = `
        <strong>${option.station}</strong>
        <span>${option.action} ${option.ware} · amt:${option.amount} · profit:${option.expected_profit}</span>
      `;
      row.append(button);
      return row;
    });

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
        <span>${station.kind} · ${station.owner} · cash:${station.credits}</span>
        <small>mods ${(station.modules || []).join(",") || "basic"}</small>
        <small>庫存 ${formatInventory(station.inventory)} / 容量 ${formatInventory(station.capacity)}</small>
        <small>保留 入:${reservedIn} · 出:${reservedOut}</small>
        <small>${[buy, sell].filter(Boolean).join(" ｜ ") || "無公開報價"}</small>
        <small>${tags || "供需平衡"}</small>
      `;
      return row;
    });

    market.replaceChildren(
      routeRow,
      marketSection("派系錢包", factionRows, "overview"),
      marketSection("市場競爭", competitionRows, "overview"),
      marketSection("手動交易", tradeRows.length ? tradeRows : [Object.assign(document.createElement("div"), { className: "market-row", textContent: "先選取玩家艦船以顯示可下單交易。" })], "trade"),
      marketSection("Order Book", offerRows, "orders"),
      marketSection("造船佇列", queueRows, "production"),
      marketSection("航線風險", riskRows, "risk"),
      marketSection("海盜衝擊", pirateImpactRows, "risk"),
      marketSection("市場警報", alertRows, "alerts"),
      marketSection("市場歷史", historyRows, "stations"),
      marketSection("站點", stationRows, "stations"),
    );
  }

  const chrono = snapshot.chronocam || {};
  document.querySelector("#chronocam-mode").textContent = chrono.mode || "--";
  document.querySelector("#chronocam-view-time").textContent = `${Number(chrono.view_time || 0).toFixed(1)}s`;
  document.querySelector("#chronocam-follow").textContent = chrono.follow_live ? "Live tail" : "Replay fixed";
  document.querySelector("#chronocam-panel")?.classList.toggle("replay", chrono.mode === "Replay");
}
