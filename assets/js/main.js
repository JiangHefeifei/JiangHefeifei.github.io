/* =========================================================================
   main.js — renders SITE_DATA into the page, wires up interactions,
   and runs the GSAP intro + scroll animations.
   You normally don't need to edit this file; edit data.js for content.
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------- Icons ---------------------------------- */
  const ICONS = {
    email:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"/><path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"/></svg>',
    scholar:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    x:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z"/></svg>',
    orcid:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0ZM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.516.422-.947.947-.947Zm-.722 3.038h1.444v10.041H6.647V7.416Zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416Zm1.444 1.303v7.444h2.297c2.359 0 3.588-1.444 3.588-3.722 0-2.016-1.275-3.722-3.588-3.722h-2.297Z"/></svg>',
    web:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4c.83 1.2 1.48 2.53 1.91 4h-3.82c.43-1.47 1.08-2.8 1.91-4ZM4.26 14a7.96 7.96 0 0 1 0-4h3.38a16.6 16.6 0 0 0 0 4H4.26Zm.81 2h2.95c.34 1.27.81 2.48 1.38 3.56A8.03 8.03 0 0 1 5.07 16Zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8ZM12 20c-.83-1.2-1.48-2.53-1.91-4h3.82A13.3 13.3 0 0 1 12 20Zm2.36-6H9.64a14.6 14.6 0 0 1 0-4h4.72a14.6 14.6 0 0 1 0 4Zm.27 5.56c.57-1.08 1.04-2.29 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.36 14a16.6 16.6 0 0 0 0-4h3.38a7.96 7.96 0 0 1 0 4h-3.38Z"/></svg>',
    image:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 15.59-4.3-4.3a1 1 0 0 0-1.4 0L11 18.59l-2.3-2.3a1 1 0 0 0-1.4 0L4 19.59V5h16ZM8.5 10A1.5 1.5 0 1 0 7 8.5 1.5 1.5 0 0 0 8.5 10Z"/></svg>',
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* --------------------------- Rendering -------------------------------- */
  function renderSocial(data) {
    if (!data.social) return;
    const html = data.social
      .map(
        (s) =>
          `<li><a href="${s.href}" aria-label="${esc(s.label)}" title="${esc(s.label)}"` +
          `${s.href.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>` +
          `${ICONS[s.icon] || ICONS.web}</a></li>`
      )
      .join("");
    // render into both the sidebar and the cover page
    ["#social-links", "#intro-social"].forEach((sel) => {
      const el = $(sel);
      if (el) el.innerHTML = html;
    });
  }

  function renderNews(data) {
    const el = $("#news-list");
    if (!el || !data.news) return;
    el.innerHTML = data.news
      .map(
        (n) =>
          `<li class="news-item reveal"><span class="news-date">${esc(n.date)}</span>` +
          `<span class="news-body">${n.html}</span></li>`
      )
      .join("");
  }

  function linkRow(links, cls) {
    if (!links || !links.length) return "";
    return (
      `<div class="${cls}">` +
      links
        .map(
          (l) =>
            `<a href="${l.href}"${l.href.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${esc(l.label)}</a>`
        )
        .join("") +
      "</div>"
    );
  }

  function renderPublications(data) {
    const el = $("#pub-list");
    if (!el || !data.publications) return;
    let lastGroup = null;
    el.innerHTML = data.publications
      .map((p) => {
        let head = "";
        if (p.group && p.group !== lastGroup) {
          lastGroup = p.group;
          head = `<h3 class="pub-group reveal">${esc(p.group)}</h3>`;
        }
        const isSelected = p.group && p.group.indexOf("Selected") === 0;
        const wantFigure = !!p.image || isSelected;
        const figInner = p.image
          ? `<img src="${p.image}" alt="${esc(p.title)} teaser figure" loading="lazy" />`
          : `<div class="pub-fig-placeholder">${ICONS.image}<span>Figure</span></div>`;
        const figure = wantFigure ? `<div class="pub-thumb">${figInner}</div>` : "";
        const award = p.award
          ? ` &middot; <span class="pub-award">${esc(p.award)}</span>`
          : "";
        const yr = p.year ? `, ${esc(p.year)}` : "";
        const summary = p.summary
          ? `<p class="pub-summary">${esc(p.summary)}</p>`
          : "";
        return (
          head +
          `<article class="pub-item reveal${wantFigure ? " has-thumb" : ""}">` +
          figure +
          `<div class="pub-body">` +
          `<h3 class="pub-title">${esc(p.title)}</h3>` +
          `<p class="pub-authors">${p.authors}</p>` +
          `<p class="pub-venue">${p.venue}${yr}${award}</p>` +
          summary +
          linkRow(p.links, "pub-links") +
          `</div></article>`
        );
      })
      .join("");
  }

  function renderProjects(data) {
    const el = $("#project-grid");
    if (!el || !data.projects) return;
    el.innerHTML = data.projects
      .map((p) => {
        const media = p.image
          ? `<img src="${p.image}" alt="${esc(p.title)}" loading="lazy" />`
          : `<span class="project-media-placeholder">PREVIEW</span>`;
        const tags = (p.tags || [])
          .map((t) => `<span>${esc(t)}</span>`)
          .join("");
        return (
          `<article class="project-card reveal">` +
          `<div class="project-media">${media}</div>` +
          `<div class="project-info">` +
          `<h3>${esc(p.title)}</h3>` +
          `<p>${esc(p.description)}</p>` +
          (tags ? `<div class="project-tags">${tags}</div>` : "") +
          linkRow(p.links, "project-links") +
          `</div></article>`
        );
      })
      .join("");
  }

  function renderTeaching(data) {
    const el = $("#teaching-list");
    if (!el || !data.teaching) return;
    el.innerHTML = data.teaching
      .map(
        (t) =>
          `<li class="teaching-item reveal"><div class="teaching-term">${esc(t.term)}</div>` +
          `<div><h3>${esc(t.course)} <span>· ${esc(t.role)}</span></h3>` +
          `<p>${esc(t.description)}</p></div></li>`
      )
      .join("");
  }

  function renderAwards(data) {
    const el = $("#awards-list");
    if (!el || !data.awards) return;
    el.innerHTML = data.awards
      .map(
        (a) =>
          `<li class="news-item reveal"><span class="news-date">${esc(a.date)}</span>` +
          `<span class="news-body">${a.html}</span></li>`
      )
      .join("");
  }

  /* --------------------------- Interactions ----------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
    const btn = $("#theme-toggle");
    if (btn)
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
  }

  function initMenu() {
    const sidebar = $("#sidebar");
    const btn = $("#menu-toggle");
    if (!sidebar || !btn) return;
    const close = () => {
      sidebar.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    sidebar.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", close));
  }

  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const map = {};
    links.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    const sections = Object.keys(map).map((id) => document.getElementById(id));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            map[e.target.id].classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  function setDates() {
    const now = new Date();
    const y = now.getFullYear();
    const yEl = $("#year");
    const uEl = $("#last-updated");
    if (yEl) yEl.textContent = y;
    if (uEl)
      uEl.textContent = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  /* ----------------------------- Animations ----------------------------- */
  function revealAllNow() {
    if (window.gsap) gsap.set(".intro-name, .reveal", { autoAlpha: 1, clearProps: "all" });
    document.querySelectorAll(".intro-name, .reveal").forEach((el) => (el.style.visibility = "visible"));
  }

  function initAnimations() {
    if (!window.gsap) return; // no GSAP → content already visible, nothing to do
    try {
      gsap.registerPlugin(ScrollTrigger);
      if (window.SplitText) gsap.registerPlugin(SplitText);

      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          // base tilt for the cover photo tiles (applies in both reduced & full motion)
          gsap.set(".cover-photo", { rotation: (i, t) => parseFloat(t.dataset.rot) || 0 });

          if (ctx.conditions.reduce) {
            revealAllNow();
            return;
          }

          /* Intro cover: avatar → name (per-char mask reveal) → divider → subtitle → menu → socials */
          const nameEl = $(".intro-name");
          const playIntro = () => {
            gsap.set(nameEl, { autoAlpha: 1 });
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.from(".intro-avatar", { autoAlpha: 0, scale: 0.8, duration: 0.7 });
            if (window.SplitText) {
              const split = SplitText.create(nameEl, { type: "chars", mask: "chars" });
              tl.from(split.chars, { yPercent: 120, duration: 0.9, stagger: 0.04 }, "-=0.2");
            } else {
              tl.from(nameEl, { autoAlpha: 0, y: 40, duration: 1 }, "-=0.2");
            }
            tl.from(".intro-divider", { scaleX: 0, duration: 0.5 }, "-=0.25")
              .from(".intro-subtitle", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.2")
              .from(".intro-nav a", { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.08 }, "-=0.15")
              .from(".intro-social", { autoAlpha: 0, y: 12, duration: 0.5 }, "-=0.2")
              .from(".scroll-cue", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.2");
            ScrollTrigger.refresh();
          };
          playIntro();

          /* Floating photo wall: fade-in, gentle float, pointer parallax */
          gsap.from(".cover-photo-slot", { autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" });
          gsap.utils.toArray(".cover-photo").forEach((t, i) => {
            gsap.to(t, { y: "+=16", rotation: "+=2.5", duration: 3 + (i % 3) * 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.12 });
          });
          if (gsap.quickTo) {
            const introEl = document.getElementById("intro");
            const px = gsap.quickTo(".cover-photos", "x", { duration: 0.6, ease: "power2.out" });
            const py = gsap.quickTo(".cover-photos", "y", { duration: 0.6, ease: "power2.out" });
            if (introEl) introEl.addEventListener("pointermove", (e) => {
              px((e.clientX / window.innerWidth - 0.5) * -28);
              py((e.clientY / window.innerHeight - 0.5) * -18);
            });
          }

          /* Intro dissolves upward as you scroll past it */
          gsap.to(".intro-inner", {
            yPercent: -24,
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: { trigger: "#intro", start: "top top", end: "bottom top", scrub: true },
          });

          /* Sidebar slides in as the homepage appears */
          gsap.from(".sidebar > *", {
            autoAlpha: 0,
            x: -18,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: ".layout", start: "top 65%" },
          });

          /* Content blocks fade up in batches as they enter the viewport */
          gsap.set(".reveal", { autoAlpha: 0, y: 26 });
          ScrollTrigger.batch(".reveal", {
            start: "top 88%",
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", overwrite: true }),
          });

          ScrollTrigger.refresh();
        }
      );

      window.addEventListener("load", () => ScrollTrigger.refresh());
    } catch (err) {
      /* If anything goes wrong, make sure the page is never left hidden */
      console.error("Animation init failed:", err);
      revealAllNow();
    }
  }

  /* ------------- Cover photo wall ----------------------------------------
     Renders floating photo tiles on the cover from SITE_DATA.coverPhotos.
     Empty slots show a placeholder frame; GSAP handles float + parallax. */
  function initCoverPhotos() {
    const wrap = document.getElementById("cover-photos");
    if (!wrap) return;
    const layout = [
      { top: 14, left: 8,  w: 200, rot: -6, ar: "3 / 2" },
      { top: 48, left: 5,  w: 168, rot: 5,  ar: "4 / 5" },
      { top: 78, left: 12, w: 158, rot: -4, ar: "1 / 1" },
      { top: 12, left: 90, w: 200, rot: 5,  ar: "3 / 2" },
      { top: 46, left: 93, w: 174, rot: -5, ar: "4 / 5" },
      { top: 76, left: 87, w: 184, rot: 4,  ar: "3 / 2" },
    ];
    const photos = (window.SITE_DATA && window.SITE_DATA.coverPhotos) || [];
    wrap.innerHTML = layout
      .map((L, i) => {
        const src = photos[i];
        const inner = src
          ? `<img src="${src}" alt="" loading="lazy" />`
          : `<div class="cover-photo-ph">${ICONS.image}</div>`;
        return (
          `<div class="cover-photo-slot" style="top:${L.top}%;left:${L.left}%">` +
          `<div class="cover-photo" data-rot="${L.rot}" style="width:${L.w}px;aspect-ratio:${L.ar}">${inner}</div>` +
          `</div>`
        );
      })
      .join("");
  }

  /* ------------- Intro dismiss: the cover is a one-time landing -----------
     Once the homepage top reaches the viewport top (you've scrolled past the
     cover), remove #intro so scrolling back up can never return to it. The
     scroll position is shifted to stay visually identical (no jump). */
  function initIntroDismiss() {
    const intro = document.getElementById("intro");
    if (!intro) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let dismissed = false;
    let introH = intro.offsetHeight;
    window.addEventListener("resize", () => { if (!dismissed) introH = intro.offsetHeight; });

    function dismiss(scrollTarget) {
      if (dismissed) return;
      dismissed = true;
      const y = window.scrollY || window.pageYOffset || 0;
      intro.style.display = "none";
      window.scrollTo(0, scrollTarget != null ? scrollTarget : Math.max(0, y - introH));
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t) => { if (t.trigger === intro) t.kill(); });
        ScrollTrigger.refresh();
      }
    }

    window.addEventListener("scroll", function onScroll() {
      if (dismissed) { window.removeEventListener("scroll", onScroll); return; }
      if ((window.scrollY || window.pageYOffset || 0) >= introH - 1) dismiss();
    }, { passive: true });

    // cover menu / scroll cue: drop the cover, then jump to the target section
    intro.querySelectorAll(".intro-nav a, .scroll-cue").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        e.preventDefault();
        const target = document.querySelector(href);
        dismiss(0);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ------------------------------- Boot --------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    const data = window.SITE_DATA || (typeof SITE_DATA !== "undefined" ? SITE_DATA : {});
    renderSocial(data);
    renderNews(data);
    window.renderPubCards(document.querySelector("#pub-list"), data);
    renderProjects(data);
    renderTeaching(data);
    renderAwards(data);

    initTheme();
    initMenu();
    initScrollSpy();
    setDates();
    initCoverPhotos();
    initAnimations();
    initIntroDismiss();
  });
})();
