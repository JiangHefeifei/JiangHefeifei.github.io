/* =========================================================================
   cover-robotics.js — animated robotic cover background for #intro.
   Two planar 3-link manipulators (CCD inverse kinematics) reach toward a
   drifting target that the pointer can steer; their end-effectors leave
   fading trajectories over a perspective floor grid and a sparse sensor
   network. Pure canvas, no dependencies. Respects prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";

  const canvas = document.getElementById("cover-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const intro = document.getElementById("intro");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ACCENT = "96, 165, 250";   // blue  (matches --accent dark)
  const CYAN   = "34, 211, 238";   // cyan  (end-effector / target)
  const AMBER  = "251, 191, 36";   // warm  (joints)

  let W = 0, H = 0, DPR = 1, t0 = performance.now();
  let pointer = { x: 0.5, y: 0.45, active: false, lastMove: 0 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = intro.clientWidth; H = intro.clientHeight;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildArms();
  }

  /* ---------------- Arms ---------------- */
  let arms = [];
  function buildArms() {
    const s = Math.min(W, H), narrow = W < 640;
    const L = (narrow ? [0.19, 0.15, 0.10] : [0.26, 0.20, 0.13]).map((k) => k * s);   // link lengths
    const bx = narrow ? 0.10 : 0.14;
    arms = [
      { base: { x: W * bx,       y: H * 0.86 }, L, ang: [-1.2, 0.6, 0.4], trail: [], mirror: 1,  phase: 0 },
      { base: { x: W * (1 - bx), y: H * 0.86 }, L, ang: [-1.9, -0.6, -0.4], trail: [], mirror: -1, phase: Math.PI },
    ];
  }

  function fk(arm) {
    const pts = [{ x: arm.base.x, y: arm.base.y }];
    let a = 0, x = arm.base.x, y = arm.base.y;
    for (let i = 0; i < arm.L.length; i++) {
      a += arm.ang[i];
      x += Math.cos(a) * arm.L[i]; y += Math.sin(a) * arm.L[i];
      pts.push({ x, y });
    }
    return pts;
  }

  // Cyclic Coordinate Descent, a few sweeps per frame, with joint damping
  function ccd(arm, target) {
    for (let sweep = 0; sweep < 3; sweep++) {
      for (let j = arm.L.length - 1; j >= 0; j--) {
        const pts = fk(arm);
        const jp = pts[j], ee = pts[pts.length - 1];
        const a1 = Math.atan2(ee.y - jp.y, ee.x - jp.x);
        const a2 = Math.atan2(target.y - jp.y, target.x - jp.x);
        let d = a2 - a1;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        arm.ang[j] += d * 0.35;                       // damping → smooth motion
      }
    }
    // keep the shoulder from swinging below the floor
    arm.ang[0] = Math.max(-Math.PI + 0.15, Math.min(-0.15, arm.ang[0]));
  }

  function targetFor(arm, time) {
    // slow Lissajous drift inside the arm's workspace
    const reach = arm.L[0] + arm.L[1] + arm.L[2];
    const cx = arm.base.x + arm.mirror * reach * 0.42;
    const cy = arm.base.y - reach * 0.62;
    const p = arm.phase;
    let tx = cx + Math.sin(time * 0.00045 + p) * reach * 0.30;
    let ty = cy + Math.sin(time * 0.00072 + p * 0.5) * reach * 0.22;
    // pointer steering (fades out 2.5 s after the last move)
    const since = time - pointer.lastMove;
    const w = pointer.active ? Math.max(0, 1 - since / 2500) : 0;
    if (w > 0) {
      const px = pointer.x * W, py = pointer.y * H;
      // only pull toward the pointer if it is on this arm's half
      const side = arm.mirror > 0 ? px < W * 0.55 : px > W * 0.45;
      if (side) { tx += (px - tx) * 0.85 * w; ty += (py - ty) * 0.85 * w; }
    }
    // clamp inside reachable disc
    const dx = tx - arm.base.x, dy = ty - arm.base.y, d = Math.hypot(dx, dy), max = reach * 0.93;
    if (d > max) { tx = arm.base.x + dx / d * max; ty = arm.base.y + dy / d * max; }
    ty = Math.min(ty, arm.base.y - reach * 0.08);
    return { x: tx, y: ty };
  }

  /* ---------------- Sensor network ---------------- */
  let nodes = [];
  function buildNodes() {
    const n = Math.round((W * H) / 26000);
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.78,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.08,
      r: 1 + Math.random() * 1.4,
    }));
  }

  /* ---------------- Drawing ---------------- */
  function drawGrid(time) {
    // perspective floor grid
    const horizon = H * 0.58, floorY = H;
    ctx.save();
    ctx.lineWidth = 1;
    const cols = 18;
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const xTop = W * 0.5 + (u - 0.5) * W * 0.55;
      const xBot = W * 0.5 + (u - 0.5) * W * 2.4;
      ctx.strokeStyle = `rgba(${ACCENT}, ${0.05 + 0.06 * (1 - Math.abs(u - 0.5) * 2)})`;
      ctx.beginPath(); ctx.moveTo(xTop, horizon); ctx.lineTo(xBot, floorY); ctx.stroke();
    }
    const rows = 9, scroll = (time * 0.00012) % 1;
    for (let i = 0; i < rows; i++) {
      const v = ((i + scroll) / rows);
      const y = horizon + Math.pow(v, 2.2) * (floorY - horizon);
      const a = 0.03 + 0.11 * Math.pow(v, 1.5);
      ctx.strokeStyle = `rgba(${ACCENT}, ${a})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // horizon glow
    const g = ctx.createLinearGradient(0, horizon - 40, 0, horizon + 60);
    g.addColorStop(0, `rgba(${ACCENT}, 0)`); g.addColorStop(0.5, `rgba(${ACCENT}, 0.10)`); g.addColorStop(1, `rgba(${ACCENT}, 0)`);
    ctx.fillStyle = g; ctx.fillRect(0, horizon - 40, W, 100);
    ctx.restore();
  }

  function drawNodes(time) {
    ctx.save();
    for (const n of nodes) {
      if (!reduce) { n.x += n.vx; n.y += n.vy; }
      if (n.x < 0) n.x += W; if (n.x > W) n.x -= W;
      if (n.y < 0) n.y += H * 0.78; if (n.y > H * 0.78) n.y -= H * 0.78;
    }
    const maxD = Math.min(W, H) * 0.14;
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxD) {
          ctx.strokeStyle = `rgba(${ACCENT}, ${0.16 * (1 - d / maxD)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const pulse = 0.55 + 0.45 * Math.sin(time * 0.002 + n.x * 0.01);
      ctx.fillStyle = `rgba(${ACCENT}, ${0.35 + 0.4 * pulse})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawArm(arm, target, time) {
    const pts = fk(arm);
    const ee = pts[pts.length - 1];

    // trajectory trail
    arm.trail.push({ x: ee.x, y: ee.y });
    if (arm.trail.length > 140) arm.trail.shift();
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let i = 1; i < arm.trail.length; i++) {
      const k = i / arm.trail.length;
      ctx.strokeStyle = `rgba(${CYAN}, ${0.02 + 0.45 * k * k})`;
      ctx.lineWidth = 0.6 + 1.8 * k;
      ctx.beginPath(); ctx.moveTo(arm.trail[i - 1].x, arm.trail[i - 1].y); ctx.lineTo(arm.trail[i].x, arm.trail[i].y); ctx.stroke();
    }

    // base plate
    ctx.fillStyle = `rgba(${ACCENT}, 0.18)`;
    ctx.strokeStyle = `rgba(${ACCENT}, 0.55)`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(arm.base.x - 26, arm.base.y - 6, 52, 12, 4); ctx.fill(); ctx.stroke();

    // links (dark core + glowing edge)
    const widths = [12, 9, 6];
    for (let i = 0; i < arm.L.length; i++) {
      const a = pts[i], b = pts[i + 1];
      ctx.strokeStyle = `rgba(${ACCENT}, 0.28)`; ctx.lineWidth = widths[i] + 6;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.95)"; ctx.lineWidth = widths[i];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${ACCENT}, 0.85)`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // joints
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], r = 8 - i * 1.5;
      ctx.fillStyle = "rgba(15, 23, 42, 1)"; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${AMBER}, 0.9)`; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = `rgba(${AMBER}, 0.9)`; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.35, 0, Math.PI * 2); ctx.fill();
    }
    // gripper
    const aEnd = arm.ang[0] + arm.ang[1] + arm.ang[2];
    const open = 5 + 3 * Math.sin(time * 0.004 + arm.phase);
    ctx.save();
    ctx.translate(ee.x, ee.y); ctx.rotate(aEnd);
    ctx.strokeStyle = `rgba(${CYAN}, 0.95)`; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -open); ctx.lineTo(0, open); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -open); ctx.lineTo(11, -open + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, open); ctx.lineTo(11, open - 1); ctx.stroke();
    ctx.restore();
    // end-effector glow
    const gl = ctx.createRadialGradient(ee.x, ee.y, 0, ee.x, ee.y, 22);
    gl.addColorStop(0, `rgba(${CYAN}, 0.22)`); gl.addColorStop(1, `rgba(${CYAN}, 0)`);
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ee.x, ee.y, 22, 0, Math.PI * 2); ctx.fill();

    // target reticle
    ctx.strokeStyle = `rgba(${CYAN}, 0.55)`; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(target.x, target.y, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(target.x - 14, target.y); ctx.lineTo(target.x - 5, target.y);
    ctx.moveTo(target.x + 5, target.y); ctx.lineTo(target.x + 14, target.y);
    ctx.moveTo(target.x, target.y - 14); ctx.lineTo(target.x, target.y - 5);
    ctx.moveTo(target.x, target.y + 5); ctx.lineTo(target.x, target.y + 14);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------- Loop ---------------- */
  let raf = 0, running = true;
  function frame(now) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    drawGrid(now);
    drawNodes(now);
    for (const arm of arms) {
      const tg = targetFor(arm, now);
      if (!reduce) ccd(arm, tg);
      drawArm(arm, tg, now);
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  }

  intro.addEventListener("pointermove", (e) => {
    const r = intro.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = (e.clientY - r.top) / r.height;
    pointer.active = true; pointer.lastMove = performance.now();
  });
  intro.addEventListener("pointerleave", () => { pointer.active = false; });

  // pause when the cover is off-screen or the tab is hidden
  const io = new IntersectionObserver((es) => {
    const vis = es[0].isIntersecting;
    if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
    if (!vis) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(intro);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (!running) { running = true; raf = requestAnimationFrame(frame); }
  });

  window.addEventListener("resize", () => { resize(); buildNodes(); });
  resize(); buildNodes();
  // settle the arms onto their targets before first paint
  for (let i = 0; i < 40; i++) arms.forEach((a) => ccd(a, targetFor(a, performance.now())));
  arms.forEach((a) => (a.trail.length = 0));
  raf = requestAnimationFrame(frame);
})();
