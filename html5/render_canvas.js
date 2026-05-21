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
  text: "rgba(232, 240, 255, 0.9)",
};

function fitCamera(snapshot, canvas) {
  const points = [
    ...snapshot.map.sectors.map((sector) => sector.position),
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
    scale: Math.max(0.55, Math.min(16, scale)),
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

  function drawPoi(poi) {
    const p = worldToScreen(poi.position);
    const r = poi.kind === "Gate" ? 5 : 4;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = poi.kind === "Gate" ? COLORS.gate : COLORS.poi;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    if (poi.kind === "Gate") {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function drawShip(entity) {
    const p = worldToScreen(entity.position);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = COLORS.ship;
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
    if (entity.ship?.name) {
      ctx.fillStyle = COLORS.text;
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText(entity.ship.name, 10, -8);
    }
    ctx.restore();
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

    snapshot.map.sectors.forEach((sector) => {
      const p = worldToScreen(sector.position);
      ctx.fillStyle = COLORS.sectorHalo;
      ctx.beginPath(); ctx.arc(p.x, p.y, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.sector;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(sector.name, p.x + 12, p.y + 4);
    });

    snapshot.map.pois.forEach(drawPoi);
    snapshot.entities.filter((entity) => entity.kind === "Ship").forEach(drawShip);
  }

  window.addEventListener("resize", () => publishCamera());
  publishCamera();
  return { canvas, camera, render, panBy, zoomAt, screenToWorld, worldToScreen, publishCamera };
}
