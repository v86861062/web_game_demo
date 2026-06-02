const TAP_DRAG_THRESHOLD = 8;

export function installInput(renderer, { onTap } = {}) {
  const canvas = renderer.canvas;
  const pointers = new Map();
  const starts = new Map();
  const moved = new Set();
  let lastPinchDistance = null;
  let lastPanPoint = null;

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    const point = localPoint(event);
    pointers.set(event.pointerId, point);
    starts.set(event.pointerId, point);
    lastPanPoint = pointers.size === 1 ? point : null;
    lastPinchDistance = null;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    const point = localPoint(event);
    const start = starts.get(event.pointerId);
    if (start && Math.hypot(point.x - start.x, point.y - start.y) > TAP_DRAG_THRESHOLD) {
      moved.add(event.pointerId);
    }
    pointers.set(event.pointerId, point);

    if (pointers.size === 1 && lastPanPoint) {
      const dx = point.x - lastPanPoint.x;
      const dy = point.y - lastPanPoint.y;
      renderer.panBy(dx, dy);
      lastPanPoint = point;
    } else if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      if (lastPinchDistance !== null) {
        renderer.zoomAt(midpoint, lastPinchDistance / distance);
      }
      lastPinchDistance = distance;
      lastPanPoint = null;
    }
  });

  function release(event) {
    const point = localPoint(event);
    const wasTap = pointers.size === 1 && starts.has(event.pointerId) && !moved.has(event.pointerId);
    pointers.delete(event.pointerId);
    starts.delete(event.pointerId);
    moved.delete(event.pointerId);
    lastPinchDistance = null;
    lastPanPoint = pointers.size === 1 ? [...pointers.values()][0] : null;
    if (wasTap) onTap?.(point);
  }

  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("lostpointercapture", release);

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const factor = event.deltaY < 0 ? 0.88 : 1.14;
    renderer.zoomAt(point, factor);
  }, { passive: false });
}
