/* =========================================================================
   cover-field.js — flowing point-lattice surface for the #intro cover.

   A sparse 3D grid of points is displaced by layered sine waves in the
   vertex shader (GPU, no per-frame JS work). The pointer raises a soft bump
   where it hovers. Height maps to a blue → cyan → amber ramp. GSAP (main.js)
   animates window.COVER: amp (wave amplitude), alpha, dist (camera dolly)
   and orbit, for the entrance and the scrubbed scroll exit.

   Requires THREE (three.min.js) loaded first. Honors prefers-reduced-motion
   (static frame) and pauses when the cover is off-screen or the tab hidden.
   ========================================================================= */
window.COVER = { amp: 1, alpha: 1, dist: 1, orbit: 0 };
(function () {
  "use strict";
  const C = window.COVER;
  const canvas = document.getElementById("cover-canvas");
  const intro = document.getElementById("intro");
  if (!canvas || !intro || !window.THREE) return;
  const T = window.THREE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(42, 1, 0.1, 60);
  const camTarget = new T.Vector3(0.6, 0.15, 0);
  const camOrbit = 0.0, camPitch = 0.30;
  let camDist = 6.4, shift = 0, baseAlpha = 0.9;

  function resize() {
    const w = intro.clientWidth, h = intro.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camDist = w < 640 ? 7.5 : w < 1024 ? 6.8 : 6.4;
    shift = w < 1024 ? 0 : 1.6;                       // metres of screen-right offset (text sits left)
    camTarget.y = w < 640 ? 0.9 : 0.15;                // phones: surface drops below the text
    baseAlpha = w < 640 ? 0.6 : 0.9;
  }

  /* ---------------- lattice ---------------- */
  const NX = 220, NZ = 120, W = 14, D = 8;
  const pos = new Float32Array(NX * NZ * 3);
  let k = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    pos[k++] = (i / (NX - 1) - 0.5) * W;
    pos[k++] = 0;
    pos[k++] = (j / (NZ - 1) - 0.5) * D;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.BufferAttribute(pos, 3));

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 1 },
    uAlpha: { value: 0.9 },
    uSize: { value: 2.0 * Math.min(window.devicePixelRatio || 1, 1.5) },
    uMouse: { value: new T.Vector2(99, 99) },
    uMouseK: { value: 0 },
  };
  const mat = new T.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `
      uniform float uTime, uAmp, uSize, uMouseK; uniform vec2 uMouse;
      varying vec3 vColor; varying float vGlow, vFade;
      vec3 ramp(float t) {
        t = clamp(t, 0.0, 1.0);
        vec3 a = vec3(0.14, 0.32, 0.92), b = vec3(0.20, 0.85, 0.95), c = vec3(1.00, 0.80, 0.30);
        return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, (t - 0.5) * 2.0);
      }
      float h(vec2 p, float t) {
        float v = 0.55 * sin(p.x * 0.9 + t * 0.45) * cos(p.y * 1.1 - t * 0.35);
        v += 0.28 * sin((p.x + p.y) * 1.9 + t * 0.7);
        v += 0.14 * sin(p.x * 3.4 - t * 1.1) * sin(p.y * 2.7 + t * 0.6);
        return v;
      }
      void main() {
        vec2 p = position.xz;
        float y = uAmp * h(p, uTime);
        float md = distance(p, uMouse);
        float bump = uMouseK * 0.9 * exp(-md * md * 0.9);
        y += bump;
        vec3 wp = vec3(p.x, y, p.y);
        vColor = ramp(0.5 + y * 0.42);
        vGlow = bump;
        vFade = smoothstep(7.5, 4.0, abs(p.x)) * smoothstep(4.2, 2.6, abs(p.y));   // soften the lattice edges
        vec4 mv = modelViewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (5.5 / -mv.z) * (1.0 + bump * 1.5);
      }`,
    fragmentShader: `
      uniform float uAlpha;
      varying vec3 vColor; varying float vGlow, vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        if (dot(c, c) > 0.25) discard;
        vec3 col = mix(vColor, vec3(1.0), clamp(vGlow, 0.0, 0.7));
        gl_FragColor = vec4(col, uAlpha * vFade * (0.55 + 0.45 * clamp(vGlow, 0.0, 1.0)));
      }`,
  });
  scene.add(new T.Points(geo, mat));

  /* ---------------- pointer → surface ---------------- */
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), ndc = new T.Vector2();
  const pointer = { x: 0, y: 0, on: false };
  intro.addEventListener("pointermove", (e) => {
    const r = intro.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width - 0.5; pointer.y = (e.clientY - r.top) / r.height - 0.5;
    ndc.set(pointer.x * 2, -pointer.y * 2); pointer.on = true;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.set(hit.x, hit.z);
  });
  intro.addEventListener("pointerleave", () => { pointer.on = false; });

  /* ---------------- loop ---------------- */
  let last = performance.now(), raf = 0, running = true, mouseK = 0;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) uniforms.uTime.value += dt;
    mouseK += ((pointer.on ? 1 : 0) - mouseK) * Math.min(1, dt * 3);
    uniforms.uMouseK.value = mouseK;
    uniforms.uAmp.value = C.amp;
    uniforms.uAlpha.value = baseAlpha * C.alpha;
    const orbit = camOrbit + C.orbit + pointer.x * 0.10;
    const pitch = camPitch + pointer.y * 0.05;
    const dist = camDist * C.dist;
    camera.position.set(
      camTarget.x + dist * Math.cos(pitch) * Math.sin(orbit),
      camTarget.y + dist * Math.sin(pitch),
      camTarget.z + dist * Math.cos(pitch) * Math.cos(orbit));
    camera.lookAt(camTarget);
    if (shift) {
      camera.updateMatrixWorld();
      const right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      camera.position.addScaledVector(right, -shift);
      camera.lookAt(camTarget.clone().addScaledVector(right, -shift));
    }
    renderer.render(scene, camera);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  function resume() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function pause() { running = false; cancelAnimationFrame(raf); }
  new IntersectionObserver((es) => (es[0].isIntersecting ? resume() : pause())).observe(intro);
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(frame);
})();
