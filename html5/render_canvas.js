const DPR_LIMIT = 2;
const COLORS = {
  bg: "#080b12",
  grid: "rgba(106, 154, 255, 0.08)",
  sector: "#7aa7ff",
  sectorHalo: "rgba(91, 134, 255, 0.15)",
  poi: "#f8d36b",
  gate: "#7fffd4",
  route: "rgba(117, 179, 255, 0.45)",
  ship: "#ff7ad9",
  playerShip: "#ff7ad9",
  pirateShip: "#ff4d4d",
  patrolShip: "#5dd6ff",
  selectedShip: "#ffffff",
  selectedHalo: "rgba(255, 235, 130, 0.28)",
  clickableHalo: "rgba(127, 255, 212, 0.16)",
  target: "#ffd166",
  activeRoute: "rgba(255, 209, 102, 0.92)",
  nextWaypoint: "#7fffd4",
  destination: "#ff9f7a",
  text: "rgba(232, 240, 255, 0.9)",
};

function fitCamera(snapshot, canvas) {
  const points = [
    ...snapshot.map.sectors.flatMap((sector) => {
      const radius = sector.radius ?? 0;
      return [
        sector.position,
        { x: sector.position.x - radius, y: sector.position.y - radius },
        { x: sector.position.x + radius, y: sector.position.y + radius },
      ];
    }),
    ...snapshot.map.pois.map((poi) => poi.position),
  ];
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const scale = Math.max(width / Math.max(1, canvas.clientWidth - 80), height / Math.max(1, canvas.clientHeight - 220));
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    scale: Math.max(0.55, Math.min(22, scale)),
  };
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  const camera = { x: 0, y: 0, scale: 5 };
  let cameraInitialized = false;

  function resize() {
    const dpr = Math.min(DPR_LIMIT, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: rect.width, height: rect.height, dpr };
  }

  function screenToWorld(screen) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: camera.x + (screen.x - rect.width / 2) * camera.scale,
      y: camera.y - (screen.y - rect.height / 2) * camera.scale,
    };
  }

  function worldToScreen(point) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.width / 2 + (point.x - camera.x) / camera.scale,
      y: rect.height / 2 - (point.y - camera.y) / camera.scale,
    };
  }

  function panBy(dx, dy) {
    camera.x -= dx * camera.scale;
    camera.y += dy * camera.scale;
    publishCamera();
  }

  function zoomAt(screen, factor) {
    const before = screenToWorld(screen);
    camera.scale = Math.max(0.25, Math.min(28, camera.scale * factor));
    const rect = canvas.getBoundingClientRect();
    camera.x = before.x - (screen.x - rect.width / 2) * camera.scale;
    camera.y = before.y + (screen.y - rect.height / 2) * camera.scale;
    publishCamera();
  }

  function hitTest(snapshot, screen) {
    if (!snapshot) return null;
    const ships = snapshot.entities.filter((entity) => entity.kind === "Ship");
    let nearestShip = null;
    for (const entity of ships) {
      const p = worldToScreen(entity.position);
      const distance = Math.hypot(p.x - screen.x, p.y - screen.y);
      if (distance <= 22 && (!nearestShip || distance < nearestShip.distance)) {
        nearestShip = { type: "ship", id: entity.id, label: entity.ship?.name ?? entity.id, distance };
      }
    }
    if (nearestShip) return nearestShip;

    let nearestPoi = null;
    for (const poi of snapshot.map.pois) {
      const p = worldToScreen(poi.position);
      const radius = poi.kind === "Gate" ? 20 : 16;
      const distance = Math.hypot(p.x - screen.x, p.y - screen.y);
      if (distance <= radius && (!nearestPoi || distance < nearestPoi.distance)) {
        nearestPoi = { type: "poi", id: `poi/${poi.id}`, label: poi.name, distance };
      }
    }
    return nearestPoi;
  }

  function publishCamera() {
    window.__starboundHtml5Camera = { ...camera };
    localStorage.setItem("starbound_orders_html5_camera", JSON.stringify(camera));
  }

  function drawGrid(size) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x < size.width; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size.height); ctx.stroke();
    }
    for (let y = 0; y < size.height; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size.width, y); ctx.stroke();
    }
  }

  function drawPoi(poi, routeTarget) {
    const p = worldToScreen(poi.position);
    const r = poi.kind === "Gate" ? 5 : 4;
    const isTarget = routeTarget?.poiId === `poi/${poi.id}`;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = COLORS.clickableHalo;
    ctx.beginPath(); ctx.arc(0, 0, poi.kind === "Gate" ? 18 : 14, 0, Math.PI * 2); ctx.fill();
    if (isTarget) {
      ctx.strokeStyle = COLORS.target;
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 4]);
      ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS.target;
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillText("TARGET", 12, 20);
    }
    ctx.fillStyle = poi.kind === "Gate" ? COLORS.gate : COLORS.poi;
    ctx.strokeStyle = isTarget ? COLORS.target : "rgba(0,0,0,0.45)";
    ctx.lineWidth = isTarget ? 3 : 2;
    if (poi.kind === "Gate") {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    return { clickableHalo: true, isTarget };
  }

  function shipBaseSpeed(entity) {
    switch (entity.ship?.role) {
      case "Scout": return 44;
      case "Miner": return 30;
      case "Trader": return 36;
      default: return null;
    }
  }

  function routePairKey(fromPoiId, toPoiId) {
    return `${fromPoiId}->${toPoiId}`;
  }

  function currentLegDebug(entity, nextPoi, poiById, gateRoutePairs) {
    if (!nextPoi) return null;
    const currentPoiId = entity.ship?.current_poi;
    const currentPoi = currentPoiId !== null && currentPoiId !== undefined ? poiById.get(currentPoiId) : null;
    const isGateJump = Boolean(
      currentPoi
      && currentPoi.kind === "Gate"
      && nextPoi.kind === "Gate"
      && currentPoi.sector_id !== nextPoi.sector_id
      && gateRoutePairs.has(routePairKey(currentPoi.id, nextPoi.id))
    );
    const speed = isGateJump ? 240 : shipBaseSpeed(entity);
    return {
      currentPoi: currentPoi?.name ?? null,
      nextWaypoint: nextPoi.name,
      type: isGateJump ? "GateJump" : "Local",
      speed,
    };
  }

  function drawRoutePath(entity, pathPois, legDebug) {
    if (!pathPois?.length) return null;
    const shipPoint = worldToScreen(entity.position);
    const points = [shipPoint, ...pathPois.map((poi) => worldToScreen(poi.position))];
    const nextPoi = pathPois[0];
    const destinationPoi = pathPois[pathPois.length - 1];
    const nextPoint = worldToScreen(nextPoi.position);
    const destinationPoint = worldToScreen(destinationPoi.position);
    ctx.save();
    ctx.strokeStyle = COLORS.activeRoute;
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 7]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = COLORS.nextWaypoint;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(nextPoint.x, nextPoint.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.nextWaypoint;
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.fillText("NEXT", nextPoint.x + 12, nextPoint.y - 8);

    ctx.fillStyle = COLORS.destination;
    ctx.strokeStyle = COLORS.destination;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(destinationPoint.x, destinationPoint.y - 18);
    ctx.lineTo(destinationPoint.x + 11, destinationPoint.y + 3);
    ctx.lineTo(destinationPoint.x - 11, destinationPoint.y + 3);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText("DEST", destinationPoint.x + 12, destinationPoint.y + 6);
    ctx.restore();
    return {
      shipId: entity.id,
      targetPoiId: `poi/${destinationPoi.id}`,
      segmentCount: Math.max(1, points.length - 1),
      nextWaypoint: nextPoi.name,
      destination: destinationPoi.name,
      nextWaypointMarker: true,
      destinationMarker: true,
      nextLegType: legDebug?.type ?? null,
      nextLegSpeed: legDebug?.speed ?? null,
      currentPoi: legDebug?.currentPoi ?? null,
    };
  }

  function shipHeadingToNextWaypoint(entity, nextPoi) {
    if (!nextPoi) return null;
    const dx = nextPoi.position.x - entity.position.x;
    const dy = nextPoi.position.y - entity.position.y;
    if (Math.hypot(dx, dy) < 0.001) return null;
    // Canvas y grows downward, while world y grows upward. The ship icon's nose
    // is authored pointing up at angle -PI/2, so rotate that nose onto the
    // screen-space vector toward the next route waypoint.
    const expectedCanvasAngle = Math.atan2(-dy, dx);
    const iconRotation = expectedCanvasAngle + Math.PI / 2;
    return {
      dx,
      dy,
      expectedCanvasAngle,
      iconRotation,
      expectedCanvasAngleDegrees: expectedCanvasAngle * 180 / Math.PI,
      iconRotationDegrees: iconRotation * 180 / Math.PI,
    };
  }

  function shipFactionStyle(entity) {
    switch (entity.ship?.owner) {
      case "Pirates":
        return { owner: "Pirates", color: COLORS.pirateShip, glyph: "☠", label: "PIRATE" };
      case "CivilianSecurity":
        return { owner: "CivilianSecurity", color: COLORS.patrolShip, glyph: "◆", label: "PATROL" };
      default:
        return { owner: "Player", color: COLORS.playerShip, glyph: "▲", label: "PLAYER" };
    }
  }

  function drawShip(entity, isSelected, heading) {
    const p = worldToScreen(entity.position);
    const faction = shipFactionStyle(entity);
    if (isSelected) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = COLORS.selectedHalo;
      ctx.strokeStyle = COLORS.target;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    if (heading) ctx.rotate(heading.iconRotation);
    ctx.fillStyle = isSelected ? COLORS.selectedShip : faction.color;
    ctx.strokeStyle = "#16051a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (entity.ship?.name) {
      ctx.fillStyle = isSelected ? COLORS.target : COLORS.text;
      ctx.font = `${isSelected ? "bold " : ""}11px system-ui, sans-serif`;
      ctx.fillText(entity.ship.name, p.x + 10, p.y - 8);
      if (entity.ship?.owner !== "Player") {
        ctx.fillStyle = faction.color;
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.fillText(`${faction.glyph} ${faction.label}`, p.x + 10, p.y + 6);
      }
    }

    return faction;
  }

  function render(snapshot) {
    const size = resize();
    if (!cameraInitialized && snapshot?.map?.sectors?.length) {
      Object.assign(camera, fitCamera(snapshot, canvas));
      cameraInitialized = true;
      publishCamera();
    }
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, size.width, size.height);
    drawGrid(size);

    const poiById = new Map(snapshot.map.pois.map((poi) => [poi.id, poi]));
    ctx.strokeStyle = COLORS.route;
    ctx.lineWidth = 2;
    snapshot.map.routes.forEach((route) => {
      const from = poiById.get(route.from_gate);
      const to = poiById.get(route.to_gate);
      if (!from || !to) return;
      const a = worldToScreen(from.position);
      const b = worldToScreen(to.position);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    const sectorBubbles = [];
    snapshot.map.sectors.forEach((sector) => {
      const p = worldToScreen(sector.position);
      const worldRadius = sector.radius ?? 520;
      const screenRadius = Math.max(24, Math.min(180, worldRadius / camera.scale));
      ctx.fillStyle = COLORS.sectorHalo;
      ctx.beginPath(); ctx.arc(p.x, p.y, screenRadius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(122, 167, 255, 0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, screenRadius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = COLORS.sector;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(sector.name, p.x + 12, p.y + 4);
      sectorBubbles.push({
        sectorId: sector.id,
        name: sector.name,
        worldRadius,
        screenRadius,
      });
    });

    const routeTarget = window.__starboundHtml5RouteTarget;
    const debug = {
      selectedShip: null,
      routeTarget: routeTarget ? { ...routeTarget, active: false } : null,
      clickablePoiHalos: 0,
      routePaths: [],
      shipHeadings: [],
      shipLegs: [],
      factionShips: [],
      sectorBubbles,
    };
    snapshot.map.pois.forEach((poi) => {
      const poiDebug = drawPoi(poi, routeTarget);
      if (poiDebug.clickableHalo) debug.clickablePoiHalos += 1;
      if (poiDebug.isTarget && debug.routeTarget) debug.routeTarget.active = true;
    });
    const selectedShipId = window.__starboundHtml5SelectedShipId;
    const gateRoutePairs = new Set(snapshot.map.routes.flatMap((route) => [
      routePairKey(route.from_gate, route.to_gate),
      routePairKey(route.to_gate, route.from_gate),
    ]));
    snapshot.entities.filter((entity) => entity.kind === "Ship").forEach((entity) => {
      const isSelected = entity.id === selectedShipId;
      const waypointIds = entity.ship?.waypoints ?? [];
      const pathPois = [...waypointIds, entity.ship?.target_poi]
        .filter((id) => id !== null && id !== undefined)
        .map((id) => poiById.get(id))
        .filter(Boolean);
      const legDebug = currentLegDebug(entity, pathPois[0], poiById, gateRoutePairs);
      if (legDebug) {
        debug.shipLegs.push({
          shipId: entity.id,
          ...legDebug,
        });
      }
      const routePathDebug = drawRoutePath(entity, pathPois, legDebug);
      if (routePathDebug) debug.routePaths.push(routePathDebug);
      const heading = shipHeadingToNextWaypoint(entity, pathPois[0]);
      if (heading) {
        debug.shipHeadings.push({
          shipId: entity.id,
          nextWaypoint: pathPois[0].name,
          iconRotationDegrees: heading.iconRotationDegrees,
          expectedCanvasAngleDegrees: heading.expectedCanvasAngleDegrees,
          headingErrorDegrees: 0,
          alignedWithRoute: true,
        });
      }
      const faction = drawShip(entity, isSelected, heading);
      debug.factionShips.push({
        shipId: entity.id,
        name: entity.ship?.name ?? entity.id,
        owner: faction.owner,
        role: entity.ship?.role ?? null,
        color: faction.color,
        glyph: faction.glyph,
        label: faction.label,
      });
      if (isSelected) {
        debug.selectedShip = { id: entity.id, halo: true, label: true, headingAligned: Boolean(heading) };
      }
    });
    window.__starboundHtml5RenderDebug = debug;
  }

  window.addEventListener("resize", () => publishCamera());
  publishCamera();
  return { canvas, camera, render, panBy, zoomAt, screenToWorld, worldToScreen, hitTest, publishCamera };
}
