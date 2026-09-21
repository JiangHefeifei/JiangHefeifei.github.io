/* =========================================================================
   cover-robotics.js — point-cloud robot-learning scene for the #intro cover.

   A 6-axis manipulator, a table and a few objects are rendered as a single
   height-colored point cloud (depth-camera look). The arm runs an analytic
   IK pick-and-place loop; before every reach it samples a handful of
   candidate trajectories ("policy rollouts"), keeps the lowest-cost one and
   executes it while the end-effector leaves a trail. A LiDAR-style sweep
   passes through the cloud and cyan wireframe boxes mark detected objects.

   Requires THREE (three.min.js) loaded before this file. No build step.
   Respects prefers-reduced-motion (static frame) and pauses off-screen.
   ========================================================================= */
(function () {
  "use strict";
  const canvas = document.getElementById("cover-canvas");
  const intro = document.getElementById("intro");
  if (!canvas || !intro || !window.THREE) return;
  const T = window.THREE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- renderer / camera ---------------- */
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, 0.1, 50);
  const camTarget = new T.Vector3(0.25, 1.02, 0);
  const camOrbit = 0.62, camPitch = 0.36; let camDist = 3.1;
  const pointer = { x: 0, y: 0 };

  function resize() {
    const w = intro.clientWidth, h = intro.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camDist = w < 640 ? 4.6 : w < 1024 ? 3.7 : 3.1;
  }

  /* ---------------- point-cloud material ---------------- */
  const uniforms = { uSweep: { value: -9 }, uSize: { value: 2.4 * Math.min(window.devicePixelRatio || 1, 1.5) }, uAlpha: { value: 0.9 } };
  const pointMat = new T.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `
      uniform float uSweep; uniform float uSize;
      attribute float aDim;
      varying vec3 vColor; varying float vBoost; varying float vDim;
      vec3 ramp(float t) {
        t = clamp(t, 0.0, 1.0);
        vec3 a = vec3(0.16, 0.36, 0.95);
        vec3 b = vec3(0.20, 0.85, 0.95);
        vec3 c = vec3(1.00, 0.82, 0.30);
        return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, (t - 0.5) * 2.0);
      }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vColor = ramp((wp.y - 0.62) / 0.75);
        vBoost = smoothstep(0.10, 0.0, abs(wp.x - uSweep));
        vDim = aDim;
        vec4 mv = viewMatrix * wp;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (3.0 / -mv.z) * (1.0 + vBoost * 0.8);
      }`,
    fragmentShader: `
      uniform float uAlpha;
      varying vec3 vColor; varying float vBoost; varying float vDim;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        if (dot(c, c) > 0.25) discard;
        vec3 col = mix(vColor, vec3(1.0), vBoost * 0.85);
        gl_FragColor = vec4(col, uAlpha * (1.0 - vDim) * (0.55 + 0.45 * vBoost));
      }`,
  });

  /* ---------------- sampling helpers ---------------- */
  const rnd = Math.random;
  function cloud(positions, dim) {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setAttribute("aDim", new T.BufferAttribute(new Float32Array(positions.length / 3).fill(dim || 0), 1));
    return new T.Points(g, pointMat);
  }
  function cylX(r, len, n, out) {                 // cylinder along +X, 0..len
    for (let i = 0; i < n; i++) { const a = rnd() * 6.2832; out.push(rnd() * len, r * Math.cos(a), r * Math.sin(a)); }
    return out;
  }
  function cylY(r, h, n, out, x0, y0, z0) {       // cylinder along +Y with top cap
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.2832;
      if (rnd() < 0.25) { const rr = r * Math.sqrt(rnd()); out.push(x0 + rr * Math.cos(a), y0 + h, z0 + rr * Math.sin(a)); }
      else out.push(x0 + r * Math.cos(a), y0 + rnd() * h, z0 + r * Math.sin(a));
    }
    return out;
  }
  function boxSurf(w, h, d, n, out, cx, cy, cz) { // box surface, 5 visible faces
    for (let i = 0; i < n; i++) {
      const f = Math.floor(rnd() * 5);
      let x = (rnd() - 0.5) * w, y = rnd() * h, z = (rnd() - 0.5) * d;
      if (f === 0) y = h; else if (f === 1) x = -w / 2; else if (f === 2) x = w / 2; else if (f === 3) z = -d / 2; else z = d / 2;
      out.push(cx + x, cy + y, cz + z);
    }
    return out;
  }

  /* ---------------- floor + table ---------------- */
  { const p = []; for (let i = 0; i < 9000; i++) p.push((rnd() - 0.5) * 7, 0, (rnd() - 0.5) * 7); scene.add(cloud(p, 0.45)); }
  const TABLE = { x: 0.15, z: 0, w: 1.7, d: 1.0, h: 0.72 };
  {
    const p = [];
    for (let i = 0; i < 9000; i++) p.push(TABLE.x + (rnd() - 0.5) * TABLE.w, TABLE.h, TABLE.z + (rnd() - 0.5) * TABLE.d);
    for (let i = 0; i < 1400; i++) { const e = rnd() < 0.5 ? -1 : 1; p.push(TABLE.x + e * TABLE.w / 2, TABLE.h - rnd() * 0.06, TABLE.z + (rnd() - 0.5) * TABLE.d); }
    for (let i = 0; i < 1400; i++) { const e = rnd() < 0.5 ? -1 : 1; p.push(TABLE.x + (rnd() - 0.5) * TABLE.w, TABLE.h - rnd() * 0.06, TABLE.z + e * TABLE.d / 2); }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => cylY(0.03, TABLE.h - 0.06, 600, p, TABLE.x + sx * (TABLE.w / 2 - 0.08), 0, TABLE.z + sz * (TABLE.d / 2 - 0.08)));
    scene.add(cloud(p, 0.12));
  }

  /* ---------------- arm (base yaw, shoulder, elbow, wrist pitch, gripper) ---------------- */
  const L = { base: 0.10, l1: 0.34, l2: 0.30, l3: 0.11, grip: 0.06 };
  const BASE = new T.Vector3(-0.45, TABLE.h, 0.05);
  const arm = new T.Group(); arm.position.copy(BASE); scene.add(arm);
  { const p = []; cylY(0.09, L.base, 1400, p, 0, 0, 0); cylY(0.055, 0.06, 500, p, 0, L.base, 0); arm.add(cloud(p)); }
  const j0 = new T.Group(); j0.position.y = L.base + 0.06; arm.add(j0);      // yaw about Y
  const j1 = new T.Group(); j0.add(j1);                                        // shoulder about Z
  { const p = []; cylX(0.045, L.l1, 2200, p); for (let i = 0; i < 500; i++) { const a = rnd() * 6.2832; p.push(0, 0.06 * Math.cos(a), 0.06 * Math.sin(a)); } j1.add(cloud(p)); }
  const j2 = new T.Group(); j2.position.x = L.l1; j1.add(j2);                 // elbow about Z
  { const p = []; cylX(0.038, L.l2, 1900, p); for (let i = 0; i < 400; i++) { const a = rnd() * 6.2832; p.push(0, 0.05 * Math.cos(a), 0.05 * Math.sin(a)); } j2.add(cloud(p)); }
  const j3 = new T.Group(); j3.position.x = L.l2; j2.add(j3);                 // wrist about Z
  { const p = []; cylX(0.03, L.l3, 900, p); j3.add(cloud(p)); }
  const j4 = new T.Group(); j4.position.x = L.l3; j3.add(j4);                 // gripper mount
  const fingerA = new T.Group(), fingerB = new T.Group(); j4.add(fingerA, fingerB);
  fingerA.add(cloud(boxSurf(L.grip, 0.014, 0.02, 500, [], L.grip / 2, -0.007, 0)));
  fingerB.add(cloud(boxSurf(L.grip, 0.014, 0.02, 500, [], L.grip / 2, -0.007, 0)));
  j4.add(cloud(boxSurf(0.03, 0.05, 0.06, 500, [], 0.015, -0.025, 0)));
  function setGrip(open) { fingerA.position.z = 0.012 + open * 0.03; fingerB.position.z = -(0.012 + open * 0.03); }
  let gripOpen = 1; setGrip(1);

  // analytic IK: fingertip at world `p`, gripper pointing straight down
  const tmp = new T.Vector3();
  function solveIK(p) {
    tmp.copy(p).sub(BASE); tmp.y -= (L.base + 0.06);
    const dx = tmp.x, dz = tmp.z;
    const yaw = Math.atan2(-dz, dx);
    const r = Math.hypot(dx, dz);
    const h = tmp.y + L.l3 + L.grip;                        // wrist joint sits above the fingertip
    const c2 = Math.max(-1, Math.min(1, (r * r + h * h - L.l1 * L.l1 - L.l2 * L.l2) / (2 * L.l1 * L.l2)));
    const a2 = -Math.acos(c2);                                // elbow-up
    const a1 = Math.atan2(h, r) - Math.atan2(L.l2 * Math.sin(a2), L.l1 + L.l2 * Math.cos(a2));
    const a3 = -Math.PI / 2 - a1 - a2;
    return { yaw, a1, a2, a3 };
  }
  const q = { yaw: 0, a1: 1.2, a2: -1.8, a3: 0 };
  function applyQ() { j0.rotation.y = q.yaw; j1.rotation.z = q.a1; j2.rotation.z = q.a2; j3.rotation.z = q.a3; }
  function lerpQ(target, k) { for (const key in target) q[key] += (target[key] - q[key]) * k; }

  /* ---------------- objects + drop-off zone ---------------- */
  const objects = [];
  function makeObject(kind, x, z) {
    const g = new T.Group(); g.position.set(x, TABLE.h, z);
    let size;
    if (kind === "box") { const s = 0.06 + rnd() * 0.03; g.add(cloud(boxSurf(s, s, s, 700, [], 0, 0, 0))); size = [s, s, s]; }
    else { const r = 0.028 + rnd() * 0.012, h = 0.07 + rnd() * 0.04; g.add(cloud(cylY(r, h, 700, [], 0, 0, 0))); size = [r * 2, h, r * 2]; }
    const edges = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(size[0] * 1.35, size[1] * 1.15, size[2] * 1.35)),
      new T.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55 }));
    edges.position.y = size[1] * 0.575; g.add(edges);
    g.userData = { size, home: new T.Vector3(x, TABLE.h, z), edges, done: false };
    scene.add(g); objects.push(g); return g;
  }
  makeObject("box", 0.05, -0.28); makeObject("cyl", 0.30, -0.10); makeObject("box", 0.42, 0.22); makeObject("cyl", 0.12, 0.30);
  const PLACE = new T.Vector3(0.68, TABLE.h, -0.30);
  { const p = []; for (let i = 0; i < 400; i++) { const a = rnd() * 6.2832, rr = 0.11 + rnd() * 0.01; p.push(PLACE.x + rr * Math.cos(a), TABLE.h + 0.002, PLACE.z + rr * Math.sin(a)); } scene.add(cloud(p, 0.1)); }

  /* ---------------- policy rollouts + end-effector trail ---------------- */
  const K = 14, SEG = 24;
  const rollouts = [];
  for (let i = 0; i < K; i++) {
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(3 * SEG), 3));
    const l = new T.Line(g, new T.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0 }));
    scene.add(l); rollouts.push({ line: l, ctrl: null });
  }
  let chosen = 0;
  function bezier(p0, c1, c2, p1, t, out) {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return out.set(a * p0.x + b * c1.x + c * c2.x + d * p1.x, a * p0.y + b * c1.y + c * c2.y + d * p1.y, a * p0.z + b * c1.z + c * c2.z + d * p1.z);
  }
  const v3 = new T.Vector3();
  function planRollouts(from, to) {
    const mid = from.clone().lerp(to, 0.5), lift = 0.16 + from.distanceTo(to) * 0.35;
    for (let i = 0; i < K; i++) {
      const c1 = from.clone().lerp(mid, 0.6); c1.y += lift * (0.7 + rnd() * 0.8); c1.x += (rnd() - 0.5) * 0.25; c1.z += (rnd() - 0.5) * 0.25;
      const c2 = to.clone().lerp(mid, 0.6);   c2.y += lift * (0.7 + rnd() * 0.8); c2.x += (rnd() - 0.5) * 0.25; c2.z += (rnd() - 0.5) * 0.25;
      const r = rollouts[i]; r.ctrl = [from.clone(), c1, c2, to.clone()];
      const pos = r.line.geometry.attributes.position;
      for (let s = 0; s < SEG; s++) { bezier(from, c1, c2, to, s / (SEG - 1), v3); pos.setXYZ(s, v3.x, v3.y, v3.z); }
      pos.needsUpdate = true; r.line.material.opacity = 0.16; r.line.material.color.setHex(0x60a5fa);
    }
    let best = 0, bestCost = 1e9;                             // keep the lowest-cost rollout
    for (let i = 0; i < K; i++) {
      const c = rollouts[i].ctrl, cost = c[0].distanceTo(c[1]) + c[1].distanceTo(c[2]) + c[2].distanceTo(c[3]) + Math.abs(c[1].y - c[2].y) * 2;
      if (cost < bestCost) { bestCost = cost; best = i; }
    }
    chosen = best; rollouts[best].line.material.opacity = 0.9; rollouts[best].line.material.color.setHex(0x22d3ee);
  }
  function fadeRollouts() { rollouts.forEach((r, i) => { r.line.material.opacity *= (i === chosen ? 0.985 : 0.95); }); }

  const TRAIL_N = 220;
  const trailGeo = new T.BufferGeometry();
  trailGeo.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(TRAIL_N * 3), 3));
  const trailCols = new Float32Array(TRAIL_N * 3); trailGeo.setAttribute("color", new T.BufferAttribute(trailCols, 3));
  scene.add(new T.Line(trailGeo, new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 })));
  const trailPts = [], eeWorld = new T.Vector3();
  function pushTrail() {
    j4.getWorldPosition(eeWorld);
    trailPts.push(eeWorld.clone()); if (trailPts.length > TRAIL_N) trailPts.shift();
    const pos = trailGeo.attributes.position, n = trailPts.length;
    for (let i = 0; i < TRAIL_N; i++) {
      const p = trailPts[Math.min(i, n - 1)]; pos.setXYZ(i, p.x, p.y, p.z);
      const c = n > 1 && i < n ? i / (n - 1) : 0;
      trailCols[i * 3] = 0.13 * c; trailCols[i * 3 + 1] = 0.83 * c; trailCols[i * 3 + 2] = 0.93 * c;
    }
    pos.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
  }

  /* ---------------- behaviour: plan → move → grasp → lift → plan → move → release ---------------- */
  const HOVER = 0.16;
  let state = "plan", stateT = 0, held = null, objIdx = 0, placed = 0, pathDur = 2;
  const cur = new T.Vector3(BASE.x + 0.35, TABLE.h + 0.35, BASE.z);
  const pathFrom = new T.Vector3(), pathTo = new T.Vector3();
  function nextObject() {
    for (let i = 0; i < objects.length; i++) { const o = objects[(objIdx + i) % objects.length]; if (!o.userData.done) { objIdx = (objIdx + i) % objects.length; return o; } }
    objects.forEach((o) => { o.userData.done = false; o.position.copy(o.userData.home); }); placed = 0; return objects[0];
  }
  let target = nextObject();
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function step(dt, now) {
    stateT += dt;
    if (state === "plan") {
      pathFrom.copy(cur); pathTo.set(target.position.x, TABLE.h + HOVER, target.position.z);
      planRollouts(pathFrom, pathTo); pathDur = 1.6 + pathFrom.distanceTo(pathTo) * 1.2; state = "wait"; stateT = 0;
    } else if (state === "wait") { if (stateT > 0.55) { state = "move"; stateT = 0; } }
    else if (state === "move") {
      const t = Math.min(1, stateT / pathDur), c = rollouts[chosen].ctrl;
      bezier(c[0], c[1], c[2], c[3], ease(t), cur); fadeRollouts();
      if (t >= 1) { state = held ? "lower2" : "lower"; stateT = 0; }
    } else if (state === "lower") {
      cur.y = TABLE.h + HOVER - Math.min(1, stateT / 0.8) * (HOVER - target.userData.size[1] * 0.55);
      if (stateT > 0.95) { state = "grasp"; stateT = 0; }
    } else if (state === "grasp") {
      gripOpen = Math.max(0.15, 1 - stateT / 0.5);
      if (stateT > 0.6) { held = target; state = "lift"; stateT = 0; }
    } else if (state === "lift") {
      const h0 = target.userData.size[1] * 0.55;
      cur.y = TABLE.h + h0 + Math.min(1, stateT / 0.8) * (HOVER + 0.06 - h0);
      if (stateT > 0.9) {
        pathFrom.copy(cur); const a = placed * 2.1;
        pathTo.set(PLACE.x + Math.cos(a) * 0.05 * placed, TABLE.h + HOVER + 0.06, PLACE.z + Math.sin(a) * 0.05 * placed);
        planRollouts(pathFrom, pathTo); pathDur = 1.6 + pathFrom.distanceTo(pathTo) * 1.2; state = "wait2"; stateT = 0;
      }
    } else if (state === "wait2") { if (stateT > 0.45) { state = "move"; stateT = 0; } }
    else if (state === "lower2") {
      const h0 = held.userData.size[1] * 0.55;
      cur.y = TABLE.h + HOVER + 0.06 - Math.min(1, stateT / 0.8) * (HOVER + 0.06 - h0);
      if (stateT > 0.95) { state = "release"; stateT = 0; }
    } else if (state === "release") {
      gripOpen = Math.min(1, 0.15 + stateT / 0.5);
      if (stateT > 0.3 && held) { held.userData.done = true; held.position.set(cur.x, TABLE.h, cur.z); held = null; placed++; }
      if (stateT > 0.6) { state = "retreat"; stateT = 0; }
    } else if (state === "retreat") {
      cur.y += (TABLE.h + HOVER + 0.10 - cur.y) * Math.min(1, dt * 4);
      if (stateT > 0.7) { target = nextObject(); state = "plan"; stateT = 0; }
    }
    lerpQ(solveIK(cur), Math.min(1, dt * 9)); applyQ(); setGrip(gripOpen);
    if (held) { j4.getWorldPosition(eeWorld); held.position.set(eeWorld.x, eeWorld.y - L.grip - held.userData.size[1] * 0.55, eeWorld.z); }
    objects.forEach((o, i) => { o.userData.edges.material.opacity = (o === target && !o.userData.done) ? 0.9 : 0.35 + 0.15 * Math.sin(now * 0.002 + i); });
  }

  /* ---------------- loop ---------------- */
  let last = performance.now(), sweep = -2.5, raf = 0, running = true;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) { step(dt, now); pushTrail(); }
    sweep += dt * 0.55; if (sweep > 2.6) sweep = -2.6; uniforms.uSweep.value = sweep;
    const orbit = camOrbit + Math.sin(now * 0.00012) * 0.18 + pointer.x * 0.16;
    const pitch = camPitch + pointer.y * 0.08;
    camera.position.set(
      camTarget.x + camDist * Math.cos(pitch) * Math.sin(orbit),
      camTarget.y + camDist * Math.sin(pitch),
      camTarget.z + camDist * Math.cos(pitch) * Math.cos(orbit));
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
    if (!reduce) raf = requestAnimationFrame(frame);
  }

  intro.addEventListener("pointermove", (e) => {
    const r = intro.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width - 0.5; pointer.y = (e.clientY - r.top) / r.height - 0.5;
  });
  function resume() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function pause() { running = false; cancelAnimationFrame(raf); }
  new IntersectionObserver((es) => (es[0].isIntersecting ? resume() : pause())).observe(intro);
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));
  window.addEventListener("resize", resize);
  resize();
  for (let i = 0; i < 60; i++) lerpQ(solveIK(cur), 0.3);
  applyQ();
  raf = requestAnimationFrame(frame);
})();
