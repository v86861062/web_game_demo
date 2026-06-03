function formatWareLabel(key = "") {
  const labels = {
    energy: "能源 Energy",
    ore: "礦石 Ore",
    metal: "金屬 Metal",
    Energy: "能源 Energy",
    Ore: "礦石 Ore",
    Metal: "金屬 Metal",
  };
  return labels[key] || key;
}

function formatOfferSide(side = "") {
  const labels = {
    Buy: "買入",
    Sell: "賣出",
    buy: "買入",
    sell: "賣出",
  };
  return labels[side] || side;
}

function formatBlueprintLabel(blueprint = "") {
  const labels = {
    Trader: "交易船 Trader",
    CoreMiner: "核心採礦船 Core Miner",
    "Core Miner": "核心採礦船 Core Miner",
  };
  return labels[blueprint] || blueprint;
}

function formatShipRoleLabel(role = "") {
  const labels = {
    Trader: "交易船 Trader",
    Miner: "採礦船 Miner",
    Scout: "偵察船 Scout",
    Patrol: "巡邏艦 Patrol",
    Pirate: "海盜船 Pirate",
  };
  return labels[role] || role;
}

function formatRiskPolicyLabel(policy = "") {
  const labels = {
    Balanced: "均衡",
    Safe: "保守",
    Aggressive: "積極",
    safe: "保守",
    balanced: "均衡",
    aggressive: "積極",
  };
  return labels[policy] || policy;
}

function formatAlertKind(kind = "") {
  const labels = {
    Production: "生產",
    Market: "市場",
    Risk: "風險",
    production: "生產",
    market: "市場",
    risk: "風險",
  };
  return labels[kind] || kind;
}

function formatChronoModeLabel(mode = "") {
  const labels = {
    Live: "即時 Live",
    Replay: "回放 Replay",
  };
  return labels[mode] || mode || "--";
}

function formatChronoFollowLabel(chrono = {}) {
  if (chrono.follow_live) return "跟隨即時尾端";
  return chrono.mode === "Replay" ? "固定回放時間" : "不跟隨即時";
}

function formatMissionDescription(description = "") {
  const labels = {
    "Explore 3 sectors": "探索 3 個星區",
    "Complete first ore sale": "完成第一筆礦石 Ore 銷售",
    "Deliver energy to mine": "運送能源 Energy 到採礦站 Mine",
    "Reach 900 credits": "累積 900 銀河幣 credits 資金",
  };
  return labels[description] || description;
}

function formatMissionReward(reward = 0) {
  return `獎勵 ${reward} 銀河幣 credits`;
}

function formatFactionName(name = "") {
  const labels = {
    Player: "玩家 Player",
    FreeTradersGuild: "自由商會 Free Traders Guild",
    "Free Traders Guild": "自由商會 Free Traders Guild",
    CoreAuthority: "核心政權 Core Authority",
    "Core Authority": "核心政權 Core Authority",
    CivilianSecurity: "民防巡邏 Civilian Security",
    "Civilian Security": "民防巡邏 Civilian Security",
    Pirates: "海盜 Pirates",
  };
  return labels[name] || name;
}

function formatFactionStanceLabel(stance = "") {
  const labels = {
    Player: "玩家",
    Competitive: "競爭勢力",
    Authority: "權威勢力",
    Protective: "保護勢力",
    Hostile: "敵對勢力",
  };
  return labels[stance] || stance;
}

function formatStationKindLabel(kind = "") {
  const labels = {
    SolarPlant: "太陽能電廠 Solar Plant",
    MiningOutpost: "採礦前哨 Mining Outpost",
    Refinery: "精煉廠 Refinery",
    TradeStation: "交易站 Trade Station",
    Shipyard: "船塢 Shipyard",
  };
  return labels[kind] || kind;
}

function formatModuleLabel(module = "") {
  const labels = {
    SolarArray: "太陽能陣列 Solar Array",
    Mine: "採礦模組 Mine",
    Refinery: "精煉模組 Refinery",
    Storage: "倉儲 Storage",
    Dock: "泊位 Dock",
    Shipyard: "船塢 Shipyard",
  };
  return labels[module] || module;
}

function formatModuleList(modules = []) {
  return modules.length ? modules.map(formatModuleLabel).join("、") : "基礎模組";
}

function formatInventory(inventory = {}, emptyLabel = "無貨物") {
  const parts = [];
  for (const [key, value] of Object.entries(inventory)) {
    if (value) parts.push(`${formatWareLabel(key)} ×${value}`);
  }
  return parts.length ? parts.join(" · ") : emptyLabel;
}

function formatCredits(value, { signed = false } = {}) {
  const credits = Math.round(Number(value || 0));
  const sign = signed && credits >= 0 ? "+" : "";
  return `${sign}${credits} 銀河幣 credits`;
}

function formatUnitPrice(value) {
  if (value === undefined || value === null || value === "" || value === "--") return "--";
  return `${Math.round(Number(value || 0))} 銀河幣 credits`;
}

function formatPriceLines(prefix, prices = {}) {
  return Object.entries(prices)
    .filter(([, value]) => value)
    .map(([ware, value]) => `${prefix} ${formatWareLabel(ware)} ${formatUnitPrice(value)}`)
    .join(" · ");
}

function formatTags(label, values = []) {
  return values.length ? `${label} ${values.join(",")}` : "";
}

function formatTradePlan(plan) {
  if (!plan) return "最佳物流：等待正利潤路線";
  return `${formatWareLabel(plan.ware)} ${plan.amount} · ${plan.source} → ${plan.destination} · +${plan.profit} 銀河幣 credits`;
}

function formatResourceRate(value, key) {
  return `${Math.round(value || 0)} ${formatWareLabel(key)}/小時`;
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

function inventoryTotal(inventory = {}) {
  return Object.values(inventory || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function formatSignedCredits(value) {
  return formatCredits(value, { signed: true });
}

function bestReportShip(report = {}) {
  const ships = report.ship_summaries || [];
  return ships.reduce((best, ship) => {
    const score = Number(ship.earned_credits || 0) + inventoryTotal(ship.delivered_cargo) * 2 - inventoryTotal(ship.lost_cargo) * 3;
    const bestScore = best ? Number(best.earned_credits || 0) + inventoryTotal(best.delivered_cargo) * 2 - inventoryTotal(best.lost_cargo) * 3 : -Infinity;
    return score > bestScore ? ship : best;
  }, null);
}

function formatReportBestShip(report = {}) {
  const ship = bestReportShip(report);
  if (!ship) return "最佳艦：尚無單艦成果";
  const cargo = formatInventory(ship.delivered_cargo || {});
  return `最佳艦：${ship.name} · ${formatAssignment(ship.assignment)} · ${formatSignedCredits(ship.earned_credits)} · 貨物 ${cargo}`;
}

function formatReportBottleneck(report = {}) {
  const stall = (report.production_stalls || [])[0];
  if (stall) return `瓶頸：${stall.station} ${stall.reason}`;
  const alert = (report.alerts || [])[0];
  return alert ? `瓶頸：${alert.message}` : "瓶頸：暫無重大卡點";
}

function formatReportShipyard(report = {}) {
  const update = (report.shipyard_updates || [])[0];
  if (!update) return "船塢：目前沒有建造佇列";
  const missing = formatInventory(update.missing || {}, "材料已備齊");
  return `船塢：${update.station} · 剩餘 ${formatSeconds(update.eta_seconds)} · 缺 ${missing}`;
}

function formatReportRecommendation(report = {}) {
  if ((report.production_stalls || []).length) return "建議：優先補足短缺站點，讓生產鏈恢復運轉。";
  if ((report.pirate_incidents || []).length) return "建議：派巡邏或護航壓低高風險航線。";
  if (inventoryTotal(report.delivered_cargo) > 0) return "建議：把本輪貨物流向下一個瓶頸或升級貨艙。";
  return "建議：跑最佳交易，讓艦隊先建立穩定現金流。";
}

function formatAssignment(value) {
  const labels = {
    Idle: "閒置",
    AutoTradeBestProfit: "自動最佳交易",
    AutoMineAndSell: "自動採礦補給",
    PatrolRouteRisk: "巡邏風險",
    SupplyShipyard: "補船塢",
    EscortHighValueTrade: "護航高價交易",
  };
  const key = String(value || "Idle");
  return labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2");
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
  { label: "護航交易", assignment: "escort_high_value_trade", risk_policy: "balanced", hint: "保護高價貨物並降低貨損" },
  { label: "補船塢", assignment: "supply_shipyard", risk_policy: "balanced", hint: "優先處理船塢 Shipyard 材料瓶頸" },
  { label: "待命", assignment: "idle", risk_policy: "balanced", hint: "停止例行任務" },
];

function fleetActionByAssignment(assignment) {
  return FLEET_ACTIONS.find((action) => action.assignment === assignment) || FLEET_ACTIONS[0];
}

function chooseAlertAction(alert, cards = []) {
  const text = `${alert?.kind || ""} ${alert?.message || ""}`.toLowerCase();
  if (text.includes("risk") || text.includes("pirate")) {
    return { ...fleetActionByAssignment("patrol_route_risk"), card: cards.find((card) => /patrol/i.test(card.status) || /patrol/i.test(card.name)) || cards[0] };
  }
  if (text.includes("production") || text.includes("shipyard") || text.includes("bottleneck")) {
    return { ...fleetActionByAssignment("supply_shipyard"), card: cards.find((card) => /trader/i.test(card.name) || /miner/i.test(card.name)) || cards[0] };
  }
  if (text.includes("market") || text.includes("route") || text.includes("shortage")) {
    return { ...fleetActionByAssignment("auto_trade_best_profit"), card: cards.find((card) => /trader/i.test(card.name)) || cards[0] };
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

function localizeCommandCopy(text = "") {
  return String(text || "")
    .replaceAll("Cargo Hold 25%", "貨艙擴充 Cargo Hold 25%")
    .replaceAll("Risk Scanner 25%", "風險掃描器 Risk Scanner 25%")
    .replaceAll("Escort Protocol 25%", "護航協定 Escort Protocol 25%")
    .replaceAll("Mine / Shipyard", "採礦站 Mine / 船塢 Shipyard")
    .replaceAll("Shipyard / 採礦站 Mine", "船塢 Shipyard / 採礦站 Mine")
    .replaceAll("Shipyard 材料", "船塢 Shipyard 材料")
    .replaceAll("Shipyard 擴張", "船塢 Shipyard 擴張")
    .replaceAll("Shipyard 生產鏈", "船塢 Shipyard 生產鏈")
    .replaceAll("讓 Mine", "讓採礦站 Mine")
    .replaceAll("補 Ore", "補礦石 Ore")
    .replaceAll("12 Ore", "12 礦石 Ore")
    .replaceAll("8 Energy", "8 能源 Energy")
    .replace(/\+(\d+)\s*cr\b/g, "+$1 銀河幣 credits")
    .replace(/(\d+)\s*cr\/h\b/g, "$1 銀河幣 credits/小時")
    .replace(/(\d+)\s+cr\/h\b/g, "$1 銀河幣 credits/小時")
    .replace(/(\d+)\s*cr\/趟\b/g, "$1 銀河幣 credits/趟")
    .replace(/(\d+)\s*cr\b/g, "$1 銀河幣 credits")
    .replaceAll("cr/h", "銀河幣 credits/小時")
    .replaceAll("Ore/h", "Ore/小時")
    .replaceAll("Metal/h", "Metal/小時")
    .replace(/×\s*(\d+)\/h\b/g, "× $1/小時");
}

function localizeEventCopy(text = "") {
  return localizeCommandCopy(text)
    .replace(/^Mission complete:\s*/i, "任務完成：")
    .replace(/\s*\(\+(\d+)\s+credits\)\.?$/i, "（+$1 銀河幣 credits）。")
    .replace(/\s*\(\+(\d+)\s+銀河幣 credits\)\.?$/i, "（+$1 銀河幣 credits）。");
}

function textRow(text, className = "command-center-row") {
  const row = document.createElement("div");
  row.className = className;
  row.textContent = localizeCommandCopy(text);
  return row;
}

function idleHomeCard(label, value, detail = "", className = "") {
  const card = document.createElement("div");
  card.className = `idle-home-card ${className}`.trim();
  const title = document.createElement("strong");
  title.textContent = `${label}：`;
  const valueNode = document.createElement("span");
  valueNode.textContent = localizeCommandCopy(value);
  card.append(title, valueNode);
  if (detail) {
    const detailNode = document.createElement("small");
    detailNode.textContent = localizeCommandCopy(detail);
    card.append(detailNode);
  }
  return card;
}

function idleDetailSection(title, rows, className = "", open = false) {
  const section = document.createElement("details");
  section.className = `idle-detail-section ${className}`.trim();
  section.open = open;
  const summary = document.createElement("summary");
  summary.textContent = title;
  const body = document.createElement("div");
  body.className = "idle-detail-body";
  body.append(...rows);
  section.append(summary, body);
  return section;
}

function commandActionRow(action, card, onAssignmentCommand, labelPrefix, className = "command-center-action") {
  const row = document.createElement("div");
  row.className = className;
  const copy = document.createElement("span");
  const detailCopy = localizeCommandCopy(action.detail || "");
  const rawExpected = String(action.expected_effect || "");
  const expectedCopy = rawExpected ? localizeCommandCopy(rawExpected.startsWith("預期") ? rawExpected : `預期效果：${rawExpected}`) : "";
  copy.innerHTML = `<strong>${localizeCommandCopy(action.label)}</strong>${detailCopy ? `<small>｜ ${detailCopy}</small>` : ""}${expectedCopy ? `<small>｜ ${expectedCopy}</small>` : ""}`;
  row.append(copy, fleetAssignmentButton({ ...action, risk_policy: action.risk_policy || "balanced" }, card, onAssignmentCommand, labelPrefix));
  return row;
}

function returnHarvestCard(report = {}, onAcknowledgeOfflineReport, className = "", onSeekChronoCam) {
  const returnSummary = report.return_summary || {};
  const card = document.createElement("article");
  card.className = `return-harvest-card ${className}`.trim();
  card.setAttribute("aria-label", "回來收成果");

  const header = document.createElement("div");
  header.className = "return-harvest-header";
  header.innerHTML = `
    <span>回來收成果 · 離線收益報告</span>
    <strong>${formatSignedCredits(report.net_credits)} · 貨物 ${formatInventory(report.delivered_cargo)}</strong>
  `;

  const metrics = document.createElement("div");
  metrics.className = "return-harvest-metrics";
  const metricItems = [
    ["營運結算", `${formatSeconds(report.simulated_seconds)} · ${formatSignedCredits(report.net_credits)} · 貨物 ${formatInventory(report.delivered_cargo)}`],
    ["最大收益", returnSummary.top_gain || formatReportBestShip(report)],
    ["瓶頸", returnSummary.bottleneck_change || formatReportBottleneck(report)],
    ["下一步", returnSummary.next_best_action || formatReportRecommendation(report)],
  ];
  metrics.append(...metricItems.map(([label, value]) => {
    const metric = document.createElement("div");
    metric.className = "return-harvest-metric";
    metric.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    return metric;
  }));

  const bookmarkSummary = (report.chronocam_bookmarks || []).length
    ? `ChronoCam 書籤：${(report.chronocam_bookmarks || []).slice(0, 4).map((bookmark) => `${bookmark.label} @ ${formatSeconds(bookmark.time_seconds)} · ${bookmark.summary}`).join(" ｜ ")}`
    : "";
  const bookmarkActions = document.createElement("div");
  bookmarkActions.className = "chronocam-bookmark-actions";
  for (const bookmark of (report.chronocam_bookmarks || []).slice(0, 4)) {
    const seconds = Number(bookmark.time_seconds || 0);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chronocam-bookmark-button";
    button.dataset.seekSeconds = String(seconds);
    button.textContent = chronocamBookmarkButtonLabel(bookmark);
    button.disabled = !Number.isFinite(seconds) || seconds < 0;
    button.title = `${bookmark.label || "ChronoCam 書籤"} @ ${formatSeconds(seconds)}`;
    button.addEventListener("click", () => onSeekChronoCam?.(seconds, bookmark));
    bookmarkActions.append(button);
  }

  const footnote = document.createElement("small");
  footnote.className = "return-harvest-footnote";
  footnote.textContent = [
    bookmarkSummary,
    returnSummary.top_loss || "最大損失：無貨損",
    returnSummary.unlock_progress || formatReportShipyard(report),
    returnSummary.risk_summary || `風險摘要：${report.pirate_incidents?.length || 0} 起事件`,
    formatReportBestShip(report),
    formatReportShipyard(report),
    formatReportRecommendation(report),
    `風險事件:${report.pirate_incidents?.length || 0} · ${Number(report.capped_seconds || 0) > 0 ? `離線上限略過:${formatSeconds(report.capped_seconds)}` : "未受離線上限影響"}`,
  ].filter(Boolean).join(" · ");

  const detailPanel = document.createElement("section");
  detailPanel.className = `return-report-detail-panel ${globalThis.__starboundReturnReportDetailOpen ? "open" : ""}`.trim();
  detailPanel.setAttribute("aria-label", "完整離線報告");
  detailPanel.innerHTML = `
    <div class="return-report-detail-header">
      <strong>完整離線報告</strong>
      <button type="button" class="return-report-detail-close">關閉</button>
    </div>
    <div class="return-report-detail-body">
      <p><strong>營運結算</strong>${formatSeconds(report.simulated_seconds)} · ${formatSignedCredits(report.net_credits)} · 貨物 ${formatInventory(report.delivered_cargo)}</p>
      <p><strong>最大收益</strong>${returnSummary.top_gain || formatReportBestShip(report)}</p>
      <p><strong>最大損失</strong>${returnSummary.top_loss || "最大損失：無貨損"}</p>
      <p><strong>瓶頸變化</strong>${returnSummary.bottleneck_change || formatReportBottleneck(report)}</p>
      <p><strong>下一步</strong>${returnSummary.next_best_action || formatReportRecommendation(report)}</p>
      <p><strong>船塢解鎖進度</strong>${returnSummary.unlock_progress || formatReportShipyard(report)}</p>
      <p><strong>風險摘要</strong>${returnSummary.risk_summary || `風險摘要：${report.pirate_incidents?.length || 0} 起事件`}</p>
      <p><strong>最佳艦</strong>${formatReportBestShip(report)}</p>
      <p><strong>船塢</strong>${formatReportShipyard(report)}</p>
      <p><strong>離線上限</strong>${Number(report.capped_seconds || 0) > 0 ? `離線上限略過 ${formatSeconds(report.capped_seconds)}` : "未受離線上限影響"}</p>
      <p><strong>ChronoCam 書籤</strong>${bookmarkSummary || "ChronoCam 書籤：本輪沒有可回看書籤"}</p>
    </div>
  `;

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.className = "return-report-detail-button";
  detailButton.textContent = "查看完整報告";
  detailButton.addEventListener("click", () => {
    globalThis.__starboundReturnReportDetailOpen = true;
    detailPanel.classList.add("open");
  });
  detailPanel.querySelector(".return-report-detail-close")?.addEventListener("click", () => {
    globalThis.__starboundReturnReportDetailOpen = false;
    detailPanel.classList.remove("open");
  });

  const claim = document.createElement("button");
  claim.type = "button";
  claim.className = "return-harvest-claim-button";
  claim.textContent = "收取成果";
  claim.addEventListener("click", () => onAcknowledgeOfflineReport?.({ type: "AcknowledgeOfflineReport" }, "Acknowledge offline report"));

  const actions = document.createElement("div");
  actions.className = "return-harvest-actions";
  actions.append(detailButton, claim);

  card.append(header, metrics, ...(bookmarkActions.childElementCount ? [bookmarkActions] : []), footnote, actions, detailPanel);
  return card;
}

function reportHistoryRow(summary = {}) {
  const row = document.createElement("div");
  row.className = "market-row report-row report-history-row";
  const returnSummary = summary.return_summary || {};
  const bookmarks = summary.chronocam_bookmarks || [];
  const bookmarkSummary = bookmarks.length
    ? `ChronoCam 書籤：${bookmarks.slice(0, 4).map((bookmark) => `${bookmark.label} @ ${formatSeconds(bookmark.time_seconds)} · ${bookmark.summary}`).join(" ｜ ")}`
    : "ChronoCam 書籤：本筆歷史紀錄沒有可回看書籤";
  row.innerHTML = `
    <strong>${summary.headline || "離線收益紀錄"}</strong>
    <span>${formatSeconds(summary.simulated_seconds)} · ${formatSignedCredits(summary.net_credits || 0)}</span>
  `;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "report-history-detail-button";
  button.textContent = "查看紀錄摘要";
  const panel = document.createElement("div");
  const openHistoryId = globalThis.__starboundReportHistoryDetailOpenId;
  const historyId = String(summary.id || summary.headline || "latest-history");
  panel.className = `report-history-detail-panel ${openHistoryId === historyId ? "open" : ""}`.trim();
  panel.dataset.reportHistoryId = historyId;
  panel.innerHTML = `
    <div class="report-history-detail-header">
      <strong>歷史離線報告</strong>
      <button type="button" class="report-history-detail-close">收合</button>
    </div>
    <p><strong>最大收益</strong>${returnSummary.top_gain || summary.headline || "最大收益：等待紀錄"}</p>
    <p><strong>最大損失</strong>${returnSummary.top_loss || "最大損失：歷史摘要未保留細項"}</p>
    <p><strong>瓶頸變化</strong>${returnSummary.bottleneck_change || "瓶頸變化：歷史摘要未保留細項"}</p>
    <p><strong>下一步</strong>${returnSummary.next_best_action || "建議下一步：查看當前瓶頸"}</p>
    <p><strong>船塢解鎖進度</strong>${returnSummary.unlock_progress || "船塢解鎖進度：歷史摘要未保留細項"}</p>
    <p><strong>風險摘要</strong>${returnSummary.risk_summary || "風險摘要：歷史摘要未保留細項"}</p>
    <p><strong>ChronoCam 書籤</strong>${bookmarkSummary}</p>
  `;
  button.addEventListener("click", () => {
    globalThis.__starboundReportHistoryDetailOpenId = historyId;
    panel.classList.add("open");
  });
  panel.querySelector(".report-history-detail-close")?.addEventListener("click", () => {
    if (globalThis.__starboundReportHistoryDetailOpenId === historyId) {
      globalThis.__starboundReportHistoryDetailOpenId = null;
    }
    panel.classList.remove("open");
  });
  row.append(button, panel);
  return row;
}

function chronocamBookmarkButtonLabel(bookmark = {}) {
  const label = String(bookmark.label || "");
  if (label.includes("收益")) return "回看離線收益";
  if (label.includes("瓶頸")) return "回看瓶頸";
  if (label.includes("風險")) return "回看風險";
  if (label.includes("解鎖")) return "回看解鎖";
  return "回看書籤";
}

function returnHarvestHandoffCard(action, card, dashboard = {}, reportHistory = [], onAssignmentCommand) {
  const assignmentAction = action || { ...fleetActionByAssignment("supply_shipyard"), label: "補船塢", assignment: "supply_shipyard", risk_policy: "balanced" };
  const assignment = commandAssignment(assignmentAction.assignment);
  const isAssigned = commandAssignment(card?.assignment) === assignment;
  const hasProgress = Number(dashboard.bottlenecks_in_progress || 0) > 0;
  const isProcessing = isAssigned && hasProgress;
  const handoff = document.createElement("article");
  handoff.className = `return-harvest-handoff ${isProcessing ? "processing" : ""}`.trim();
  handoff.setAttribute("aria-label", "成果已收取後的下一步");
  const latestHistory = reportHistory[reportHistory.length - 1] || {};
  const bottleneck = dashboard.current_bottleneck || (dashboard.bottlenecks || [])[0] || "目前瓶頸待確認";
  const expectedEffect = localizeCommandCopy(assignmentAction?.expected_effect || "把剛收回來的資源轉成瓶頸處理，維持離線收益成長。");
  const relief = localizeCommandCopy(dashboard.bottleneck_relief_summary || `瓶頸處理中 ${Math.max(1, Number(dashboard.bottlenecks_in_progress || 0))}/${(dashboard.bottlenecks || []).length || 1}`);
  const rates = dashboard.resource_rates || {};
  const incomeLine = localizeCommandCopy(`收益預估：${Math.round(dashboard.credits_per_hour_estimate || 0)}cr/h · ${formatResourceRate(rates.ore_per_hour, "ore")} · ${formatResourceRate(rates.metal_per_hour, "metal")}`);
  const nextGoalLine = localizeCommandCopy(`下一個升級：${dashboard.next_goal || "累積資源，準備下一輪擴張"}`);

  const copy = document.createElement("span");
  copy.innerHTML = isProcessing ? `
    <strong>瓶頸處理中 · 已派工</strong>
    <small>剛剛的離線報告已收進紀錄${latestHistory?.net_credits !== undefined ? ` · ${formatSignedCredits(latestHistory.net_credits)}` : ""}</small>
    <small>已派工：${card?.name || "艦隊"} → ${assignmentAction.label || "補船塢"} · ${relief}</small>
    <small>預計改善：${expectedEffect}</small>
    <small>${incomeLine}</small>
    <small>${nextGoalLine}</small>
  ` : `
    <strong>成果已收取 · 下一步：修瓶頸</strong>
    <small>剛剛的離線報告已收進紀錄${latestHistory?.net_credits !== undefined ? ` · ${formatSignedCredits(latestHistory.net_credits)}` : ""}</small>
    <small>瓶頸：${bottleneck}</small>
    <small>預期效果：${expectedEffect}</small>
  `;

  const button = fleetAssignmentButton(assignmentAction, card, onAssignmentCommand, "成果已收取後修瓶頸");
  button.textContent = `${isProcessing ? "調整瓶頸" : "修瓶頸"}：${assignmentAction.label || "補船塢"}`;
  handoff.append(copy, button);
  return handoff;
}

export function renderHud(snapshot, { onTradeCommand, onUpgradeCommand, onAssignmentCommand, onAcknowledgeOfflineReport, onContractMilestoneCommand, onSeekChronoCam } = {}) {
  if (!snapshot) return;
  document.querySelector("#credits").textContent = formatCredits(snapshot.hud.credits);
  document.querySelector("#resource-summary").textContent = formatInventory(snapshot.hud.resources);
  document.querySelector("#time-summary").textContent = `${snapshot.time.toFixed(1)}秒 · ${snapshot.hud.paused ? "暫停" : `${snapshot.hud.speed}x`}`;
  document.querySelector("#latest-event").textContent = localizeEventCopy(snapshot.hud.latest_event || "尚無事件");

  const ships = document.querySelector("#ship-list");
  const dashboard = snapshot.fleet_dashboard || {};
  const fleetCards = dashboard.cards || [];
  const commandCenter = document.querySelector("#fleet-command-center");
  if (commandCenter) {
    const latestReport = snapshot.latest_offline_report;
    const reportOutcome = latestReport ? `離線結算：${formatSeconds(latestReport.simulated_seconds)} · ${formatSignedCredits(latestReport.net_credits)} · 貨物 ${formatInventory(latestReport.delivered_cargo)}` : null;
    const rates = dashboard.resource_rates || {};
    const firstSessionGoal = dashboard.first_session_goal || {};
    const firstSessionEta = (firstSessionGoal.shipyard_summary || "").match(/船塢(?: ETA|剩餘) ([^·]+)/)?.[1];
    const firstSessionEtaLabel = firstSessionEta ? `船塢剩餘 ${firstSessionEta}` : "船塢剩餘 --";
    const firstSessionReward = (firstSessionGoal.reward_summary || "下一個獎勵：+1 交易船 Trader").split("，")[0];
    const firstSessionRoute = firstSessionGoal.route_summary || "第一航線：等待最佳能源 Energy 航線";
    const incomeRows = [
      textRow(`${Math.round(dashboard.credits_per_hour_estimate || 0)} cr/h · ${formatResourceRate(rates.ore_per_hour, "ore")} · ${formatResourceRate(rates.metal_per_hour, "metal")}`, "command-center-kpi"),
      textRow(dashboard.top_route ? `最佳物流：${dashboard.top_route}` : "最佳物流：等待正利潤路線"),
    ];
    const resultRows = (dashboard.recent_results || []).slice(0, 3).map((result) => textRow(result));
    const progressionRows = (dashboard.progression || []).map((step) => textRow(
      `${step.label} ${Math.round(step.current || 0)}/${Math.round(step.target || 0)} · ${step.status || "--"} · ${step.detail || ""}`,
      `command-center-row progression ${step.complete ? "complete" : "pending"}`,
    ));
    const bottleneckRows = (dashboard.bottlenecks || []).slice(0, 3).map((bottleneck) => textRow(bottleneck, "command-center-row bottleneck"));
    const bottleneckProgressRow = dashboard.bottleneck_relief_summary
      ? textRow(dashboard.bottleneck_relief_summary, "command-center-kpi bottleneck-progress")
      : null;
    const riskStrategy = dashboard.risk_strategy || {};
    const riskSummaryLine = riskStrategy.high_risk_route
      ? `風險策略：${riskStrategy.high_risk_route} · ${riskStrategy.patrol_summary || "巡邏覆蓋：待評估"} · ${riskStrategy.escort_summary || "護航：待評估"}`
      : "風險策略：等待高風險航線資料";
    const riskStrategyRows = [
      textRow(riskStrategy.high_risk_route || "高風險航線：目前沒有明顯威脅"),
      textRow(riskStrategy.patrol_summary || "巡邏覆蓋：待評估"),
      textRow(riskStrategy.escort_summary || "護航：等待高價交易"),
      textRow(riskStrategy.expected_effect || "預期效果：派巡邏或護航後降低下一輪貨損風險"),
    ];
    const expansionCadence = dashboard.expansion_cadence || {};
    const expansionSummaryLine = expansionCadence.headline
      ? `${expansionCadence.headline} · ${expansionCadence.current_phase || expansionCadence.next_sector || "下一個星區：待評估"}`
      : "擴張節奏：下一個星區 → 物流合約 → 站點投資";
    const expansionStepRows = (expansionCadence.steps || []).map((step) => textRow(
      `${step.label} ${Math.round(step.current || 0)}/${Math.round(step.target || 0)} · ${step.status || "--"} · ${step.detail || ""}`,
      `command-center-row expansion ${step.complete ? "complete" : "pending"}`,
    ));
    const recurringContractRows = (expansionCadence.recurring_contract_rewards || []).slice(0, 3).map((contract) => textRow(
      `${contract.label || "週期合約"} · ${contract.reward_summary || "週期獎勵：待估"} · ${contract.cadence_summary || "等待合約節奏"} · ${contract.milestone_summary || "合約里程碑：等待第一趟"} · ${contract.streak_bonus_summary || "連跑加成：待建立"} · ${contract.expected_effect || "預期效果：累積擴張資金"}`,
      "command-center-row expansion-contract",
    ));
    const availableContractRows = (expansionCadence.available_contracts || []).slice(0, 3).map((contract) => {
      const row = document.createElement("div");
      row.className = "command-center-row available-contract-row";
      const copy = document.createElement("span");
      copy.innerHTML = `<strong>${localizeCommandCopy(contract.label || "可承接合約")}</strong><small>${localizeCommandCopy(`${contract.contract_type || "合約"} · ${contract.route || "待選航線"} · ${contract.reward_preview || "獎勵待估"}`)}</small><small>${localizeCommandCopy(`${contract.cadence_summary || "等待節奏"} · ${contract.risk_summary || "風險待評估"}`)}</small><small>${localizeCommandCopy(contract.expected_effect || "預期效果：累積擴張資金")}</small>`;
      const assignment = commandAssignment(contract.recommended_assignment);
      const card = fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(contract.target_ship_id, "ship")) || fleetCards[0];
      const button = fleetAssignmentButton({
        label: contract.action_label || "承接合約",
        assignment,
        target_ship_id: contract.target_ship_id,
        detail: contract.expected_effect,
        hint: `${contract.contract_type || "合約"} · ${contract.route || "待選航線"}`,
        risk_policy: assignment === "escort_high_value_trade" ? "safe" : "balanced",
      }, card, onAssignmentCommand, "承接合約");
      button.classList.add("available-contract-button");
      row.append(copy, button);
      return row;
    });
    const contractPayoffRows = (expansionCadence.contract_payoff_history || []).slice(0, 4).map((payoff) => textRow(
      `${payoff.contract_type || "合約成果"} · ${payoff.route || "航線待補"} · ${payoff.payoff_summary || "+0cr"} · ${payoff.cadence_summary || "等待合約成果"} · ${payoff.risk_summary || "風險回顧：待評估"}`,
      "command-center-row contract-payoff-row",
    ));
    const payoffStats = expansionCadence.contract_payoff_stats || [];
    const contractPayoffStatRows = payoffStats.slice(0, 4).map((stat) => textRow(
      `${stat.contract_type || "合約調校"} · 平均 ${Math.round(stat.average_credits_per_trip || 0)}cr/趟 · ${stat.completed_trips || 0} 趟 · ${stat.best_route || "航線待補"} · ${stat.tuning_recommendation || "合約調校：等待更多成果樣本"} · ${stat.next_action || "下一步：完成更多合約後調整節奏"} · ${stat.risk_recap || "風險回顧：待評估"}`,
      "command-center-row contract-payoff-stat-row",
    ));
    const contractTuningSummary = (() => {
      const recommendations = payoffStats
        .map((stat) => stat.tuning_recommendation || "")
        .filter(Boolean);
      const cleanSummaryFragment = (line, fallback) => String(line || fallback)
        .replace(/^合約調校：/, "")
        .replaceAll("payoff evidence", "樣本")
        .replaceAll("payoff data", "樣本")
        .replaceAll("payoff", "成果")
        .replaceAll("等待護航 樣本", "等待護航樣本")
        .replaceAll("等待採礦 樣本", "等待採礦樣本");
      const compactRiskSummary = (line) => cleanSummaryFragment(line, "風險溢價：等待護航樣本")
        .replace(/^風險溢價[：: ]*/, "");
      const compactMiningSummary = (line) => cleanSummaryFragment(line, "低於護航：等待採礦樣本")
        .replace(/^低於護航[：: ]*/, "");
      const riskPremiumLine = recommendations.find((line) => line.includes("風險溢價"));
      const miningGapLine = recommendations.find((line) => line.includes("低於護航"));
      const topTrade = payoffStats.find((stat) => String(stat.contract_type || "").includes("交易"));
      const tradeLine = topTrade
        ? `${Math.round(topTrade.average_credits_per_trip || 0)}cr/趟`
        : "等待成果";
      const row = document.createElement("section");
      row.className = "command-center-kpi contract-tuning-summary";
      const title = document.createElement("strong");
      title.textContent = "合約調校摘要";
      const detail = document.createElement("small");
      detail.textContent = localizeCommandCopy(`交易：${tradeLine} · 護航：風險溢價 ${compactRiskSummary(riskPremiumLine)} · 採礦：低於護航 ${compactMiningSummary(miningGapLine)}`);
      row.append(title, detail);
      return row;
    })();
    const contractTypeUnlockRows = (expansionCadence.contract_type_unlocks || []).slice(0, 3).map((unlock) => {
      const row = document.createElement("div");
      row.className = "command-center-action contract-type-unlock-row";
      const copy = document.createElement("span");
      copy.innerHTML = `<strong>${localizeCommandCopy(`${unlock.contract_type || "合約專精解鎖"} · ${unlock.status || "蒐集資料中"}`)}</strong><small>${localizeCommandCopy(`${unlock.unlock_summary || "等待更多成果樣本"} · ${Math.round(unlock.progress_percent || 0)}%`)}</small><small>${localizeCommandCopy(unlock.expected_effect || "預期效果：依合約類型解鎖投資分支")}</small><small>${localizeCommandCopy(unlock.active_modifier || "實際效果：等待專精樣本啟用")}</small>`;
      const assignment = commandAssignment(unlock.recommended_assignment);
      const card = fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(unlock.target_ship_id, "ship")) || fleetCards[0];
      const button = fleetAssignmentButton({
        label: unlock.status?.includes("已解鎖") ? `啟用${unlock.contract_type || "合約專精"}` : `累積${unlock.contract_type || "合約資料"}`,
        assignment,
        target_ship_id: unlock.target_ship_id,
        detail: unlock.unlock_summary,
        expected_effect: unlock.expected_effect,
        hint: unlock.status,
        risk_policy: assignment === "escort_high_value_trade" ? "safe" : "balanced",
      }, card, onAssignmentCommand, "合約專精解鎖");
      button.classList.add("contract-type-unlock-button");
      row.append(copy, button);
      return row;
    });
    const contractMilestoneRows = (expansionCadence.contract_milestones || []).slice(0, 3).map((milestone) => {
      const row = document.createElement("div");
      row.className = "command-center-row expansion-milestone";
      const copy = document.createElement("span");
      copy.textContent = localizeCommandCopy(`${milestone.label || "合約里程碑"} ${Math.round(milestone.current || 0)}/${Math.round(milestone.target || 0)} · ${milestone.milestone_reward || "獎勵預覽：待估"} · ${milestone.streak_bonus || "連跑加成：待建立"} · ${milestone.next_action || "派 Trader 跑週期合約"}`);
      row.append(copy);
      if (String(milestone.next_action || "").includes("可領取")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "contract-milestone-claim-button";
        button.textContent = "領取合約獎勵";
        button.addEventListener("click", () => onContractMilestoneCommand?.({
          type: "ClaimContractMilestone",
          target: Math.round(milestone.target || 0),
        }, `領取合約獎勵 ${Math.round(milestone.target || 0)} 趟`));
        row.append(button);
      }
      return row;
    });
    const midgameGoalRows = (expansionCadence.midgame_goal_chain || []).slice(0, 4).map((goal) => textRow(
      `${goal.label || "中期目標"} · ${goal.status || "等待狀態"} · ${goal.next_action || "等待下一步"} · ${goal.expected_effect || "預期效果：延續 midgame 節奏"}`,
      "command-center-row midgame-goal",
    ));
    const investmentChoices = (expansionCadence.station_investment_choices || []).slice(0, 3);
    const investmentButtonForChoice = (choice, compact = false) => {
      const assignment = commandAssignment(choice.recommended_assignment);
      const actionTemplate = fleetActionByAssignment(assignment);
      const preferredCard = fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(choice.target_ship_id, "ship"))
        || fleetCards.find((fleetCard) => assignment === "auto_mine_and_sell" ? /miner/i.test(fleetCard.name || "") : /trader/i.test(fleetCard.name || ""))
        || fleetCards[0];
      const button = fleetAssignmentButton({
        ...actionTemplate,
        label: compact ? actionTemplate.label : `投資：${actionTemplate.label}`,
        assignment,
        target_ship_id: choice.target_ship_id,
        risk_policy: "balanced",
        detail: choice.cost_summary,
        expected_effect: choice.expected_effect,
        hint: choice.expected_effect || actionTemplate.hint,
      }, preferredCard, onAssignmentCommand, `投資選擇 ${choice.label || "站點投資"}`);
      button.classList.add("investment-choice-button");
      return button;
    };
    const makeInvestmentQuickRow = () => {
      if (!investmentChoices.length) return null;
      const row = document.createElement("div");
      row.className = "expansion-investment-quick";
      const copy = document.createElement("span");
      copy.innerHTML = `<strong>投資選擇：補船塢 / 採礦補給 / 最佳交易</strong><small>${localizeCommandCopy(investmentChoices[0]?.expected_effect || "點選後直接派工並改善擴張瓶頸")}</small>`;
      const buttons = document.createElement("div");
      buttons.className = "expansion-investment-buttons";
      buttons.append(...investmentChoices.map((choice) => investmentButtonForChoice(choice, true)));
      row.append(copy, buttons);
      return row;
    };
    const investmentQuickRow = makeInvestmentQuickRow();
    const investmentChoiceRows = investmentChoices.map((choice) => {
      const row = document.createElement("div");
      row.className = "command-center-action expansion-investment-action";
      const copy = document.createElement("span");
      copy.innerHTML = `<strong>${localizeCommandCopy(`投資選擇：${choice.label || "站點投資"}`)}</strong><small>${localizeCommandCopy(`${choice.target || "下一輪擴張"} · ${choice.cost_summary || "材料待評估"}`)}</small><small>${localizeCommandCopy(`預期效果：${choice.expected_effect || "改善擴張瓶頸"}`)}</small>`;
      row.append(copy, investmentButtonForChoice(choice));
      return row;
    });
    const unlockReport = expansionCadence.sector_unlock_report || {};
    const unlockReportRows = unlockReport.summary
      ? [
          textRow(unlockReport.summary, "command-center-row expansion-unlock-report"),
          textRow(unlockReport.next_action || "Scout 行動：等待偵查指令", "command-center-row expansion-unlock-report"),
          textRow(unlockReport.expected_effect || "預期效果：解鎖新合約與站點投資", "command-center-row expansion-unlock-report"),
        ]
      : [];
    const topRecurringContract = (expansionCadence.recurring_contract_rewards || [])[0];
    const topInvestmentChoice = (expansionCadence.station_investment_choices || [])[0];
    const expansionDepthLine = `週期合約：${topRecurringContract?.reward_summary || "等待正利潤航線"} · 里程碑：${(expansionCadence.contract_milestones || [])[0]?.label || "連跑 3 趟"} · 中期：${(expansionCadence.midgame_goal_chain || [])[0]?.label || "+1 Trader"} · 投資選擇：${topInvestmentChoice?.label || "等待站點缺口"} · ${unlockReport.summary || "星區解鎖報告：待評估"}`;
    const expansionRows = [
      textRow(expansionCadence.current_phase || "下一個星區：派 Scout 開路後解鎖新航線"),
      textRow(expansionCadence.next_sector || "下一個星區：等待偵查目標"),
      textRow(expansionCadence.contract_summary || "物流合約：跑能源 Energy / 礦石 Ore 合約，累積擴張資金"),
      textRow(expansionCadence.station_investment || "站點投資：補 Forge / Shipyard 材料，把收益轉成艦隊規模"),
      textRow(expansionCadence.expected_unlock || "預期解鎖：更多航線、合約入口與艦隊容量"),
      ...(recurringContractRows.length ? recurringContractRows : [textRow("週期合約：等待正利潤航線，先補能源 Energy / 礦石 Ore 供應")]),
      textRow("可承接合約池：交易 / 採礦 / 護航", "command-center-row available-contract-summary"),
      ...(availableContractRows.length ? availableContractRows : [textRow("可承接合約池：等待市場、礦區或風險航線資料", "command-center-row available-contract-row")]),
      textRow("合約成果履歷：交易 / 採礦 / 護航收益", "command-center-row contract-payoff-summary"),
      ...(contractPayoffRows.length ? contractPayoffRows : [textRow("合約成果履歷：完成承接合約後會記錄收益、貨物與風險回顧", "command-center-row contract-payoff-row")]),
      textRow("合約調校：依成果履歷比較平均收益、最佳航線與風險下一步", "command-center-row contract-payoff-stat-summary"),
      ...(contractPayoffStatRows.length ? contractPayoffStatRows : [textRow("合約調校：等待交易 / 採礦 / 護航成果樣本，完成合約後會顯示平均收益與下一步", "command-center-row contract-payoff-stat-row")]),
      textRow("合約專精解鎖：交易 / 採礦 / 護航成果會開出投資分支", "command-center-row contract-type-unlock-summary"),
      ...(contractTypeUnlockRows.length ? contractTypeUnlockRows : [textRow("合約專精解鎖：等待更多成果樣本", "command-center-row contract-type-unlock-row")]),
      ...(contractMilestoneRows.length ? contractMilestoneRows : [textRow("合約里程碑：連跑 3 趟後解鎖連跑加成")]),
      ...(investmentChoiceRows.length ? investmentChoiceRows : [textRow("投資選擇：等待站點材料缺口或船塢佇列")]),
      textRow("中期目標鏈：+1 交易船 Trader → 雙線合約 → Cargo Hold → 下一星區", "command-center-row midgame-chain-summary"),
      ...(midgameGoalRows.length ? midgameGoalRows : [textRow("中期目標鏈：+1 交易船 Trader → 雙線合約 → Cargo Hold → 下一星區")]),
      ...(unlockReportRows.length ? unlockReportRows : [textRow("星區解鎖報告：等待偵查資料")]),
      ...expansionStepRows,
    ];
    const actionRows = (dashboard.recommended_actions || []).slice(0, 4).map((action) => {
      const card = fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(action.target_ship_id, "ship")) || fleetCards[0];
      return commandActionRow(action, card, onAssignmentCommand, "建議行動");
    });
    const primaryRecommendedAction = (dashboard.recommended_actions || [])[0];
    const primaryRecommendedCard = primaryRecommendedAction
      ? fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(primaryRecommendedAction.target_ship_id, "ship")) || fleetCards[0]
      : fleetCards[0];
    const bottleneckHandoffAction = (dashboard.recommended_actions || []).find((action) => {
      const assignment = commandAssignment(action.assignment);
      const label = String(action.label || "");
      return ["supply_shipyard", "auto_mine_and_sell"].includes(assignment) || label.includes("補船塢") || label.includes("採礦");
    }) || primaryRecommendedAction;
    const bottleneckHandoffCard = bottleneckHandoffAction
      ? fleetCards.find((fleetCard) => idValue(fleetCard.ship_id, "ship") === idValue(bottleneckHandoffAction.target_ship_id, "ship")) || fleetCards[0]
      : fleetCards[0];
    const primaryActionRows = primaryRecommendedAction
      ? [commandActionRow(primaryRecommendedAction, primaryRecommendedCard, onAssignmentCommand, "建議行動", "command-center-action idle-primary-action")]
      : [];
    const briefItems = [
      ["收益", `估計 ${Math.round(dashboard.credits_per_hour_estimate || 0)}cr/h`],
      ["瓶頸", (dashboard.bottlenecks || [])[0] || "目前順暢"],
      ["下一步", `建議行動：${(dashboard.recommended_actions || [])[0]?.label || "等待建議"}`],
      ["目標", dashboard.next_goal || "+1 交易船 Trader"],
    ];
    const idleBrief = (() => {
      const brief = document.createElement("section");
      brief.className = "idle-command-brief";
      brief.append(...briefItems.map(([label, value]) => {
        const pill = document.createElement("div");
        pill.className = "idle-brief-pill";
        pill.innerHTML = `<strong>${label}：</strong><span>${localizeCommandCopy(value)}</span>`;
        return pill;
      }));
      return brief;
    })();
    const idleHero = (() => {
      const hero = document.createElement("section");
      hero.className = "idle-command-hero";
      const header = document.createElement("div");
      header.className = "idle-hero-header";
      const title = document.createElement("strong");
      title.textContent = "營運首頁 · 現在按哪個";
      const scope = document.createElement("small");
      scope.textContent = "星圖是局勢，這裡是主操作";
      header.append(title, scope);
      const grid = document.createElement("div");
      grid.className = "idle-home-grid";
      grid.append(
        idleHomeCard(
          "收益",
          `估計收益 ${Math.round(dashboard.credits_per_hour_estimate || 0)}cr/h`,
          `${formatResourceRate(rates.ore_per_hour, "ore")} · ${formatResourceRate(rates.metal_per_hour, "metal")} · ${dashboard.income_estimate_basis || "等待第一筆交易"}`,
        ),
        idleHomeCard(
          "最近成果",
          reportOutcome || (dashboard.recent_results || [])[0] || "等待第一輪自動任務",
          firstSessionRoute,
        ),
        idleHomeCard(
          "目前瓶頸",
          (dashboard.bottlenecks || [])[0] || "目前沒有重大瓶頸",
          bottleneckProgressRow?.textContent || riskSummaryLine,
          "bottleneck",
        ),
        idleHomeCard(
          "下一目標",
          dashboard.next_goal || "累積資源準備擴張",
          `首分鐘目標：能源 Energy → 礦石 Ore → 金屬 Metal · ${firstSessionReward} · ${firstSessionEtaLabel}`,
          "first-session-goal",
        ),
      );
      hero.append(header, grid);
      return hero;
    })();
    const primaryActionsSection = (() => {
      const section = document.createElement("section");
      section.className = "idle-primary-actions";
      section.append(
        ...(primaryActionRows.length ? primaryActionRows : [textRow("建議行動：暫無可執行策略")]),
      );
      return section;
    })();
    const returnHarvestNextActions = latestReport ? (() => {
      const strip = document.createElement("section");
      strip.className = "return-harvest-next-actions";
      strip.setAttribute("aria-label", "回來收成果後可立即接續的操作");
      if (primaryRecommendedAction) {
        strip.append(commandActionRow(
          primaryRecommendedAction,
          primaryRecommendedCard,
          onAssignmentCommand,
          "建議行動",
          "command-center-action idle-primary-action",
        ));
      }
      const quickRow = makeInvestmentQuickRow();
      if (quickRow) strip.append(quickRow);
      return strip.childElementCount ? strip : null;
    })() : null;
    commandCenter.replaceChildren(
      (() => {
        const title = document.createElement("h2");
        title.textContent = "艦隊指揮中心 · 現在按哪個";
        return title;
      })(),
      contractTuningSummary,
      ...(latestReport ? [returnHarvestCard(latestReport, onAcknowledgeOfflineReport, "command-return-harvest", onSeekChronoCam)] : []),
      ...(returnHarvestNextActions ? [returnHarvestNextActions] : []),
      ...(!latestReport && (snapshot.report_history || []).length
        ? [returnHarvestHandoffCard(bottleneckHandoffAction, bottleneckHandoffCard, dashboard, snapshot.report_history, onAssignmentCommand)]
        : []),
      idleBrief,
      ...(!latestReport ? [primaryActionsSection] : []),
      ...(!latestReport && investmentQuickRow ? [investmentQuickRow] : []),
      idleHero,
      textRow(`第一航線：${firstSessionRoute.replace(/^第一航線：/, "")}`, "command-center-row first-route"),
      textRow("進度路線：能源 Energy → 礦石 Ore → 金屬 Metal → 下一艘交易船 Trader", "command-center-kpi progression-path"),
      idleDetailSection("進階：合約/擴張", [
        textRow(expansionSummaryLine, "command-center-kpi expansion-cadence"),
        textRow(expansionDepthLine, "command-center-kpi expansion-depth"),
        ...expansionRows,
      ], "expansion-detail"),
      idleDetailSection("進階：艦隊路線/風險", [
        ...incomeRows,
        textRow(riskSummaryLine, "command-center-kpi risk-strategy"),
        ...riskStrategyRows,
        ...(progressionRows.length ? progressionRows : [textRow("能源 Energy → 礦石 Ore → 金屬 Metal → 下一艘交易船 Trader")]),
      ], "fleet-detail"),
      idleDetailSection("進階：報告/瓶頸", [
        ...(reportOutcome ? [textRow(reportOutcome), ...resultRows.slice(0, 2)] : (resultRows.length ? resultRows : [textRow("等待艦隊完成第一輪自動任務")])),
        ...(bottleneckProgressRow ? [bottleneckProgressRow] : []),
        ...(bottleneckRows.length ? bottleneckRows : [textRow("目前沒有重大瓶頸")]),
        textRow(dashboard.next_goal || "累積資源，準備下一輪擴張"),
      ], "report-detail"),
      idleDetailSection("進階：建議行動", actionRows.length ? actionRows : [textRow("暫無建議行動")], "action-detail"),
    );
  }
  const fleetSummary = document.querySelector("#fleet-summary");
  if (fleetSummary) {
    const kpis = [
      ["總艦船", dashboard.total_ships ?? snapshot.hud.ships.length],
      ["派工中", dashboard.active_assignments ?? 0],
      ["閒置", dashboard.idle_ships ?? 0],
      ["估計收益", `${Math.round(dashboard.credits_per_hour_estimate || 0)} cr/h`],
      ["瓶頸處理", `${dashboard.bottlenecks_in_progress ?? 0}/${(dashboard.bottlenecks || []).length || 0}`],
      ["瓶頸", dashboard.current_bottleneck || "--"],
    ];
    fleetSummary.replaceChildren(...kpis.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "fleet-kpi";
      row.innerHTML = `<strong>${label}</strong><span>${localizeCommandCopy(value)}</span>`;
      return row;
    }));
  }
  const fleetAlerts = document.querySelector("#fleet-alerts");
  if (fleetAlerts) {
    fleetAlerts.replaceChildren(...(snapshot.alerts || []).slice(0, 3).map((alert) => {
      const row = document.createElement("div");
      row.className = "fleet-alert";
      const message = document.createElement("span");
      message.textContent = `${formatAlertKind(alert.kind)}：${alert.message}`;
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
      <span>${formatShipRoleLabel(ship.role)} · ${formatAssignment(assignment)} · ${formatRiskPolicyLabel(card?.risk_policy || "Balanced")}${cargo !== "無貨物" ? ` · 貨物 ${cargo}` : ""}</span>
      <small>${ship.sector}${ship.target ? ` → ${ship.target}` : ""}${plan ? ` · ${plan}` : ""}</small>
      ${card?.alert ? `<small>⚠ ${card.alert}</small>` : ""}
    `;
    if (card?.ship_id !== undefined && card?.ship_id !== null) {
      const details = document.createElement("details");
      details.className = "ship-actions-details";
      const summary = document.createElement("summary");
      summary.textContent = "進階派工 / 手動覆寫";
      const actions = document.createElement("div");
      actions.className = "fleet-actions";
      actions.append(...FLEET_ACTIONS.map((action) => fleetAssignmentButton(action, card, onAssignmentCommand, ship.name)));
      details.append(summary, actions);
      row.append(details);
    }
    return row;
  }));

  const missions = document.querySelector("#mission-list");
  missions.replaceChildren(...snapshot.hud.missions.map((mission, index) => {
    const row = document.createElement("div");
    row.className = `mission ${mission.completed ? "completed" : ""}`;
    const marker = `${index > 0 ? "— " : ""}${mission.completed ? "✓" : "○"}`;
    row.innerHTML = `<span>${marker}</span><strong>${formatMissionDescription(mission.description)}</strong><small>｜ ${formatMissionReward(mission.reward)}</small>`;
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
        <strong>${formatFactionName(faction.name || faction.faction)}</strong>
        <span>${formatCredits(faction.credits)} · 站點 ${faction.owned_stations} · 艦船 ${faction.owned_ships}</span>
      `;
      return row;
    });

    const factionPressureRows = (snapshot.faction_pressure || []).map((pressure) => {
      const row = document.createElement("div");
      row.className = "market-row faction-pressure-row";
      row.innerHTML = `
        <strong>${formatFactionName(pressure.name || pressure.faction)} · ${formatFactionStanceLabel(pressure.stance)}</strong>
        <span>勢力壓力 ${formatPercent(pressure.pressure_score)} · 交易 ${formatPercent(pressure.trade_activity)} · 治安 ${formatPercent(pressure.security_coverage)} · 海盜 ${formatPercent(pressure.pirate_pressure)}</span>
        <small>${pressure.doctrine}</small>
        <small>${pressure.headline}</small>
      `;
      return row;
    });

    const offerRows = (snapshot.market?.offers || []).slice(0, 8).map((offer) => {
      const row = document.createElement("div");
      row.className = "market-row offer-row";
      row.innerHTML = `
        <strong>${formatOfferSide(offer.side)} ${formatWareLabel(offer.ware)}</strong>
        <span>${offer.station} · ${formatUnitPrice(offer.price)} · 數量 ${offer.amount}</span>
        <small>${formatFactionName(offer.owner)} · 已保留 ${offer.reserved || 0}</small>
      `;
      return row;
    });

    const competitionRows = (snapshot.market?.competition || []).map((competition) => {
      const row = document.createElement("div");
      row.className = "market-row competition-row";
      row.innerHTML = `
        <strong>${formatWareLabel(competition.ware)} 競價</strong>
        <span>買 ${competition.best_buy_station ? formatUnitPrice(competition.best_buy_price) : "--"} @ ${competition.best_buy_station || "--"} · 賣 ${competition.best_sell_station ? formatUnitPrice(competition.best_sell_price) : "--"} @ ${competition.best_sell_station || "--"}</span>
        <small>價差 ${formatUnitPrice(competition.spread)} · 買方 ${competition.competing_buyers} · 賣方 ${competition.competing_sellers}</small>
      `;
      return row;
    });

    const queueRows = (snapshot.market?.build_queues || []).map((queue) => {
      const row = document.createElement("div");
      row.className = "market-row build-row";
      row.innerHTML = `
        <strong>${queue.station}</strong>
        <span>${formatFactionName(queue.owner)} 正在建造 ${formatBlueprintLabel(queue.blueprint)} · ${formatPercent(queue.progress)}</span>
        <small>需要 ${formatInventory(queue.required)} · 缺 ${formatInventory(queue.missing || {})} · 剩餘 ${formatSeconds(queue.remaining_seconds)}</small>
        <small>${queue.ready ? "材料已就緒" : "等待物流補料"}</small>
      `;
      return row;
    });

    const riskRows = (snapshot.market?.route_risks || []).slice(0, 6).map((risk) => {
      const row = document.createElement("div");
      row.className = "market-row risk-row";
      row.innerHTML = `
        <strong>${risk.strategy_summary || `${risk.from} → ${risk.to}`}</strong>
        <span>風險 ${formatPercent(risk.risk)} · 襲擊 ${risk.recent_raids} · 巡邏覆蓋 ${formatPercent(risk.patrol_coverage || 0)}</span>
        <small>${risk.escort_hint || "護航交易：等待高價貨物"}</small>
        <small>${risk.expected_effect || "預期效果：派巡邏或護航後降低下一輪貨損風險"}</small>
      `;
      const riskActions = document.createElement("div");
      riskActions.className = "fleet-actions risk-actions";
      const patrolCard = fleetCards.find((card) => card.assignment === "PatrolRouteRisk") || fleetCards[0];
      const escortCard = fleetCards.find((card) => /trader/i.test(card.name)) || fleetCards[0];
      if (patrolCard) {
        riskActions.append(fleetAssignmentButton({ label: "派巡邏", assignment: "patrol_route_risk", risk_policy: "safe", hint: risk.expected_effect }, patrolCard, onAssignmentCommand, "風險航線"));
      }
      if (escortCard) {
        riskActions.append(fleetAssignmentButton({ label: "護航交易", assignment: "escort_high_value_trade", risk_policy: "balanced", hint: risk.escort_hint }, escortCard, onAssignmentCommand, "風險航線"));
      }
      row.append(riskActions);
      return row;
    });

    const pirateImpactRows = (snapshot.market?.pirate_impacts || []).slice(0, 5).map((impact) => {
      const row = document.createElement("div");
      row.className = "market-row pirate-impact-row";
      row.innerHTML = `
        <strong>${impact.route}</strong>
        <span>海盜衝擊 ${formatPercent(impact.risk)} · 襲擊 ${impact.recent_raids}</span>
        <small>受影響報價 ${impact.affected_offers} · 風險溢價 ${impact.buy_price_premium}%</small>
      `;
      return row;
    });

    const historyRows = (snapshot.market?.history || []).slice(-6).map((sample) => {
      const row = document.createElement("div");
      row.className = "market-row history-row";
      row.innerHTML = `
        <strong>${sample.station} · ${formatWareLabel(sample.ware)}</strong>
        <span>庫存 ${sample.inventory} · 買價 ${sample.buy_price} · 賣價 ${sample.sell_price}</span>
        <small>短缺紀錄 ${sample.shortage_ticks} tick</small>
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
      button.textContent = `下單 ${formatWareLabel(option.ware)} ${option.amount}`;
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
        <span>${formatOfferSide(option.action)} ${formatWareLabel(option.ware)} · 數量 ${option.amount} · 預期利潤 ${formatCredits(option.expected_profit, { signed: true })}</span>
      `;
      row.append(button);
      return row;
    });

    const report = snapshot.latest_offline_report;
    const reportRows = [];
    if (report) {
      reportRows.push(returnHarvestCard(
        report,
        onAcknowledgeOfflineReport,
        "market-row report-row offline-report-row",
        onSeekChronoCam,
      ));
    } else {
      reportRows.push(Object.assign(document.createElement("div"), {
        className: "market-row report-row offline-report-empty",
        textContent: "目前沒有未讀離線報告。最近收益紀錄如下。",
      }));
    }
    for (const summary of snapshot.report_history || []) {
      reportRows.push(reportHistoryRow(summary));
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
      }, `購買 ${upgrade.name}`));
      row.innerHTML = `
        <strong>${upgrade.name} Lv.${upgrade.level}</strong>
        <span>${formatCredits(upgrade.cost)} · ${upgrade.effect}</span>
        <small>目前：${upgrade.current_value || "--"}</small>
        <small>升級後：${upgrade.next_value || "--"} · ${upgrade.delta_value || ""}</small>
        <small>${upgrade.expected_effect || "預期效果：購買後立即提升艦隊營運效率"}</small>
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
        <span>${formatStationKindLabel(station.kind)} · ${formatFactionName(station.owner)} · 現金 ${formatCredits(station.credits)}</span>
        <small>模組 ${formatModuleList(station.modules || [])}</small>
        <small>庫存 ${formatInventory(station.inventory)} / 容量 ${formatInventory(station.capacity)}</small>
        <small>保留：入 ${reservedIn} · 出 ${reservedOut}</small>
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
      marketSection("訂單簿", offerRows, "orders"),
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
  document.querySelector("#chronocam-mode").textContent = formatChronoModeLabel(chrono.mode);
  document.querySelector("#chronocam-view-time").textContent = `${Number(chrono.view_time || 0).toFixed(1)}s`;
  document.querySelector("#chronocam-follow").textContent = formatChronoFollowLabel(chrono);
  document.querySelector("#chronocam-panel")?.classList.toggle("replay", chrono.mode === "Replay");
}
