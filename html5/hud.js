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

function formatSeconds(value) {
  const seconds = Math.max(0, Number(value || 0));
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds >= 60) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds)}s`;
}

function formatAssignment(value) {
  return String(value || "Idle").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function idValue(value, prefix) {
  if (typeof value === "string") return value.includes("/") ? value : `${prefix}/${value}`;
  if (typeof value === "number") return `${prefix}/${value}`;
  if (Array.isArray(value)) return idValue(value[0], prefix);
  if (value && typeof value === "object") return idValue(value[0] ?? value.id ?? value.value, prefix);
  return `${prefix}/0`;
}

const FLEET_ACTIONS = [
  { label: "最佳交易", assignment: "auto_trade_best_profit", risk_policy: "balanced", hint: "讓系統自動找最高利潤物流" },
  { label: "採礦補給", assignment: "auto_mine_and_sell", risk_policy: "safe", hint: "採礦並補足生產短缺" },
  { label: "巡邏風險", assignment: "patrol_route_risk", risk_policy: "safe", hint: "壓低高風險航線" },
  { label: "補船塢", assignment: "supply_shipyard", risk_policy: "balanced", hint: "優先處理 Shipyard 材料瓶頸" },
  { label: "待命", assignment: "idle", risk_policy: "balanced", hint: "停止例行任務" },
];

function chooseAlertAction(alert, cards = []) {
  const text = `${alert?.kind || ""} ${alert?.message || ""}`.toLowerCase();
  if (text.includes("risk") || text.includes("pirate")) {
    return { ...FLEET_ACTIONS[2], card: cards.find((card) => /patrol/i.test(card.status) || /patrol/i.test(card.name)) || cards[0] };
  }
  if (text.includes("production") || text.includes("shipyard") || text.includes("bottleneck")) {
    return { ...FLEET_ACTIONS[3], card: cards.find((card) => /trader/i.test(card.name) || /miner/i.test(card.name)) || cards[0] };
  }
  if (text.includes("market") || text.includes("route") || text.includes("shortage")) {
    return { ...FLEET_ACTIONS[0], card: cards.find((card) => /trader/i.test(card.name)) || cards[0] };
  }
  return { ...FLEET_ACTIONS[0], card: cards[0] };
}

function commandAssignment(value) {
  const map = {
    Idle: "idle",
    AutoTradeBestProfit: "auto_trade_best_profit",
    AutoMineAndSell: "auto_mine_and_sell",
    PatrolRouteRisk: "patrol_route_risk",
    EscortHighValueTrade: "escort_high_value_trade",
    SupplyShipyard: "supply_shipyard",
  };
  return map[value] || value || "idle";
}

function fleetAssignmentButton(action, card, onAssignmentCommand, labelPrefix = card?.name || "Fleet") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = action.label;
  button.title = action.hint || action.detail || "";
  button.addEventListener("click", () => onAssignmentCommand?.({
    type: "SetFleetAssignment",
    ship_id: idValue(card?.ship_id ?? action.target_ship_id, "ship"),
    assignment: commandAssignment(action.assignment),
    risk_policy: action.risk_policy || "balanced",
  }, `${labelPrefix} ${action.label}`));
  return button;
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

function commandCenterSection(title, rows, className = "") {
  const section = document.createElement("section");
  section.className = `command-center-section ${className}`.trim();
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading, ...rows);
  return section;
}

function textRow(text, className = "command-center-row") {
  const row = document.createElement("div");
  row.className = className;
  row.textContent = text;
  return row;
}

export function renderHud(snapshot, { onTradeCommand, onUpgradeCommand, onAssignmentCommand, onAcknowledgeOfflineReport } = {}) {
  if (!snapshot) return;
  document.querySelector("#credits").textContent = String(snapshot.hud.credits);
  document.querySelector("#resource-summary").textContent = formatInventory(snapshot.hud.resources);
  document.querySelector("#time-summary").textContent = `${snapshot.time.toFixed(1)}s · ${snapshot.hud.paused ? "paused" : `${snapshot.hud.speed}x`}`;
  document.querySelector("#latest-event").textContent = snapshot.hud.latest_event || "--";

  const ships = document.querySelector("#ship-list");
  const dashboard = snapshot.fleet_dashboard || {};
  const fleetCards = dashboard.cards || [];
  const commandCenter = document.querySelector("#fleet-command-center");
  if (commandCenter) {
    const rates = dashboard.resource_rates || {};
    const incomeRows = [
      textRow(`${Math.round(dashboard.credits_per_hour_estimate || 0)} cr/h · ${Math.round(rates.ore_per_hour || 0)} ore/h · ${Math.round(rates.metal_per_hour || 0)} metal/h`, "command-center-kpi"),
      textRow(dashboard.top_route ? `最佳物流：${dashboard.top_route}` : "最佳物流：等待正利潤路線"),
    ];
    const resultRows = (dashboard.recent_results || []).slice(0, 3).map((result) => textRow(result));
    const bottleneckRows = (dashboard.bottlenecks || []).slice(0, 3).map((bottleneck) => textRow(bottleneck, "command-center-row bottleneck"));
    const actionRows = (dashboard.recommended_actions || []).slice(0, 4).map((action) => {
      const row = document.createElement("div");
      row.className = "command-center-action";
      const copy = document.createElement("span");
      copy.innerHTML = `<strong>${action.label}</strong><small>${action.detail || ""}</small>`;
      const card = fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(action.target_ship_id, "ship")) || fleetCards[0];
      row.append(copy, fleetAssignmentButton({ ...action, risk_policy: "balanced" }, card, onAssignmentCommand, "建議行動"));
      return row;
    });
    commandCenter.replaceChildren(
      (() => {
        const title = document.createElement("h2");
        title.textContent = "艦隊指揮中心";
        return title;
      })(),
      textRow(`收益 ${Math.round(dashboard.credits_per_hour_estimate || 0)}cr/h · ${Math.round(rates.ore_per_hour || 0)}ore/h · ${Math.round(rates.metal_per_hour || 0)}metal/h`, "command-center-kpi"),
      textRow(`最近成果：${(dashboard.recent_results || [])[0] || "等待第一輪自動任務"}`),
      textRow(`瓶頸：${(dashboard.bottlenecks || [])[0] || "目前沒有重大瓶頸"}`, "command-center-row bottleneck"),
      textRow(`建議：${(dashboard.recommended_actions || [])[0]?.label || "等待可執行策略"} · 下一目標：${dashboard.next_goal || "累積資源準備擴張"}`),
      commandCenterSection("收益", incomeRows),
      commandCenterSection("最近成果", resultRows.length ? resultRows : [textRow("等待艦隊完成第一輪自動任務")]),
      commandCenterSection("目前瓶頸", bottleneckRows.length ? bottleneckRows : [textRow("目前沒有重大瓶頸")]),
      commandCenterSection("建議行動", actionRows.length ? actionRows : [textRow("暫無建議行動")]),
      commandCenterSection("下一目標", [textRow(dashboard.next_goal || "累積資源，準備下一輪擴張")]),
    );
  }
  const fleetSummary = document.querySelector("#fleet-summary");
  if (fleetSummary) {
    const kpis = [
      ["總艦船", dashboard.total_ships ?? snapshot.hud.ships.length],
      ["派工中", dashboard.active_assignments ?? 0],
      ["閒置", dashboard.idle_ships ?? 0],
      ["估計收益", `${Math.round(dashboard.credits_per_hour_estimate || 0)} cr/h`],
      ["瓶頸", dashboard.current_bottleneck || "--"],
    ];
    fleetSummary.replaceChildren(...kpis.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "fleet-kpi";
      row.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
      return row;
    }));
  }
  const fleetAlerts = document.querySelector("#fleet-alerts");
  if (fleetAlerts) {
    fleetAlerts.replaceChildren(...(snapshot.alerts || []).slice(0, 3).map((alert) => {
      const row = document.createElement("div");
      row.className = "fleet-alert";
      const message = document.createElement("span");
      message.textContent = `${alert.kind}: ${alert.message}`;
      row.append(message);
      const suggested = chooseAlertAction(alert, fleetCards);
      if (suggested.card) {
        const button = fleetAssignmentButton(suggested, suggested.card, onAssignmentCommand, "一鍵處理");
        button.textContent = `一鍵處理：${suggested.label}`;
        row.append(button);
      }
      return row;
    }));
  }
  ships.replaceChildren(...snapshot.hud.ships.map((ship, index) => {
    const row = document.createElement("div");
    row.className = "ship-row";
    row.dataset.shipIndex = String(index);
    const cargo = formatInventory(ship.cargo || {});
    const card = fleetCards[index];
    const assignment = card?.assignment || ship.order;
    const plan = ship.trade_plan
      ? `${ship.trade_plan.ware} ${ship.trade_plan.amount} · POI ${ship.trade_plan.source_poi} → ${ship.trade_plan.destination_poi}`
      : "";
    row.innerHTML = `
      <strong>${ship.name}</strong>
      <span>${ship.role} · ${formatAssignment(assignment)} · ${card?.risk_policy || "Balanced"}${cargo !== "empty" ? ` · cargo ${cargo}` : ""}</span>
      <small>${ship.sector}${ship.target ? ` → ${ship.target}` : ""}${plan ? ` · ${plan}` : ""}</small>
      ${card?.alert ? `<small>⚠ ${card.alert}</small>` : ""}
    `;
    if (card?.ship_id !== undefined && card?.ship_id !== null) {
      const actions = document.createElement("div");
      actions.className = "fleet-actions";
      actions.append(...FLEET_ACTIONS.map((action) => fleetAssignmentButton(action, card, onAssignmentCommand, ship.name)));
      row.append(actions);
    }
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

    const factionPressureRows = (snapshot.faction_pressure || []).map((pressure) => {
      const row = document.createElement("div");
      row.className = "market-row faction-pressure-row";
      row.innerHTML = `
        <strong>${pressure.name || pressure.faction} · ${pressure.stance}</strong>
        <span>勢力壓力 ${formatPercent(pressure.pressure_score)} · trade ${formatPercent(pressure.trade_activity)} · security ${formatPercent(pressure.security_coverage)} · pirate ${formatPercent(pressure.pirate_pressure)}</span>
        <small>${pressure.doctrine}</small>
        <small>${pressure.headline}</small>
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

    const report = snapshot.latest_offline_report;
    const reportRows = [];
    if (report) {
      const row = document.createElement("div");
      row.className = "market-row report-row offline-report-row";
      const ack = document.createElement("button");
      ack.type = "button";
      ack.textContent = "收起報告";
      ack.addEventListener("click", () => onAcknowledgeOfflineReport?.({ type: "AcknowledgeOfflineReport" }, "Acknowledge offline report"));
      row.innerHTML = `
        <strong>離線收益報告</strong>
        <span>${formatSeconds(report.simulated_seconds)} · net ${report.net_credits}cr · cargo ${formatInventory(report.delivered_cargo)}</span>
        <small>cap ${formatSeconds(report.capped_seconds)} · incidents:${report.pirate_incidents?.length || 0} · stalls:${report.production_stalls?.length || 0}</small>
      `;
      row.append(ack);
      reportRows.push(row);
    }
    for (const summary of snapshot.report_history || []) {
      const row = document.createElement("div");
      row.className = "market-row report-row";
      row.innerHTML = `<strong>${summary.headline}</strong><span>${formatSeconds(summary.simulated_seconds)} · ${summary.net_credits}cr</span>`;
      reportRows.push(row);
    }

    const upgradeRows = (snapshot.available_upgrades || []).map((upgrade) => {
      const row = document.createElement("div");
      row.className = "market-row upgrade-row";
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = !upgrade.affordable;
      button.textContent = upgrade.affordable ? `購買 ${upgrade.name}` : `${upgrade.name} 不足額`;
      button.addEventListener("click", () => onUpgradeCommand?.({
        type: "BuyUpgrade",
        upgrade: upgrade.id,
      }, `Buy ${upgrade.name}`));
      row.innerHTML = `
        <strong>${upgrade.name} Lv.${upgrade.level}</strong>
        <span>${upgrade.cost}cr · ${upgrade.effect}</span>
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
      marketSection("勢力態勢", factionPressureRows, "overview"),
      routeRow,
      marketSection("派系錢包", factionRows, "overview"),
      marketSection("市場競爭", competitionRows, "overview"),
      marketSection("手動交易", tradeRows.length ? tradeRows : [Object.assign(document.createElement("div"), { className: "market-row", textContent: "先選取玩家艦船以顯示可下單交易。" })], "trade"),
      marketSection("Order Book", offerRows, "orders"),
      marketSection("造船佇列", queueRows, "production"),
      marketSection("航線風險", riskRows, "risk"),
      marketSection("海盜衝擊", pirateImpactRows, "risk"),
      marketSection("市場警報", alertRows, "alerts"),
      marketSection("升級", upgradeRows, "upgrades"),
      marketSection("離線報告", reportRows.length ? reportRows : [Object.assign(document.createElement("div"), { className: "market-row", textContent: "目前沒有未讀離線報告。" })], "reports"),
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
