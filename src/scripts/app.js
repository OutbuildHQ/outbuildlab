/* ============================================================
   OUTBUILD LAB — site-wide experience layer
   Runs on every page; each init guards on the elements it needs,
   so pages only pay for what they render. Degrades gracefully:
   no WebGL → gradient fallback, reduced motion → static content.
   ============================================================ */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

// intro animations assume we enter at the top — never restore scroll,
// but respect deep links like /work#helio
ScrollTrigger.clearScrollMemory("manual");
if (!location.hash) window.scrollTo(0, 0);

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.4 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

// same-page anchors glide; cross-page links navigate normally
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      closeMenu();
      scrollTo(id);
    }
  });
});

// deep links from other pages (/services#engineering): glide after load
if (location.hash && document.querySelector(location.hash)) {
  setTimeout(() => scrollTo(location.hash), 500);
}

document.getElementById("scrollCue")?.addEventListener("click", () => scrollTo("#studio"));

/* ============================================================
   THEME TOGGLE (bootstrap script in <head> sets the attribute
   pre-paint; this just flips and persists it)
   ============================================================ */
document.getElementById("themeToggle")?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("ob-theme", next);
  window.dispatchEvent(new CustomEvent("ob:theme", { detail: next }));
});

/* ============================================================
   INTRO ORCHESTRATION
   The preloader only exists on the homepage and only plays once
   per session; everything else listens for "ob:intro".
   ============================================================ */
function fireIntro() {
  window.__obIntroFired = true;
  window.dispatchEvent(new CustomEvent("ob:intro"));
}

function playIntro() {
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.from(".site-header", { y: -40, opacity: 0, duration: 0.9 }, 0);
  if (document.querySelector(".ht-inner")) {
    tl.from(".ht-inner", { yPercent: 115, duration: 1.3, stagger: 0.12 }, 0)
      .from(".hero-eyebrow", { y: 24, opacity: 0, duration: 0.9 }, 0.35)
      .from(".hero-foot", { y: 30, opacity: 0, duration: 1 }, 0.55);
  }
  if (document.querySelector(".pt-inner")) {
    tl.from(".pt-inner", { yPercent: 115, duration: 1.2, stagger: 0.1 }, 0)
      .from(".page-label", { y: 18, opacity: 0, duration: 0.8 }, 0.25)
      .from(".page-lede", { y: 24, opacity: 0, duration: 0.9 }, 0.4);
  }
}
window.addEventListener("ob:intro", playIntro);

const preloader = document.getElementById("preloader");
const seen = sessionStorage.getItem("ob-seen");

if (!preloader || seen || reduced) {
  preloader?.remove();
  // let the first paint settle before animating in
  requestAnimationFrame(() => requestAnimationFrame(fireIntro));
} else {
  sessionStorage.setItem("ob-seen", "1");
  const counterEl = document.getElementById("loaderCount");
  const load = { n: 0 };
  gsap
    .timeline()
    .to(load, {
      n: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        counterEl.textContent = String(Math.round(load.n)).padStart(3, "0");
      },
    })
    .to(".preloader-inner", { yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in" })
    .to(preloader, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.9,
      ease: "power4.inOut",
      onStart: () => { preloader.style.clipPath = "inset(0 0 0% 0)"; },
      onComplete: () => {
        preloader.remove();
        ScrollTrigger.refresh();
      },
    }, "-=0.1")
    .add(fireIntro, "-=0.55");
}

/* ============================================================
   THREE.JS HERO — particles assembling into the "O"
   (dynamically imported so inner pages never download three.js)
   ============================================================ */
const heroState = { build: 0, scatter: 0, mouseX: 0, mouseY: 0 };

async function initHero() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const THREE = await import("three");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.style.display = "none";
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, window.innerWidth < 768 ? 12.5 : 8);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  /* --- Particle "O": scattered cloud -> torus ring --- */
  const isSmall = window.innerWidth < 768;
  const R = 1.9;                         // ring radius
  const TUBE = 0.68;                     // tube radius
  const U = isSmall ? 56 : 84;           // segments around the ring
  const V = isSmall ? 12 : 16;           // segments around the tube

  const targetArr = [];
  const accentFlags = [];
  for (let u = 0; u < U; u++) {
    for (let v = 0; v < V; v++) {
      const theta = (u / U) * Math.PI * 2;
      const phi = (v / V) * Math.PI * 2;
      const ring = R + TUBE * Math.cos(phi);
      targetArr.push(ring * Math.cos(theta), ring * Math.sin(theta), TUBE * Math.sin(phi));
      // accent spokes every 7th column + the outer equator ring
      accentFlags.push(u % 7 === 0 || v === 0 ? 1 : 0);
    }
  }

  const COUNT = targetArr.length / 3;
  const targets = new Float32Array(targetArr);
  const colors = new Float32Array(COUNT * 3);
  const positions = new Float32Array(COUNT * 3);
  const scattered = new Float32Array(COUNT * 3);

  for (let j = 0; j < COUNT; j++) {
    const ix = j * 3;
    const r = 6 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    scattered[ix] = r * Math.sin(phi) * Math.cos(theta);
    scattered[ix + 1] = r * Math.sin(phi) * Math.sin(theta);
    scattered[ix + 2] = r * Math.cos(phi);
    positions[ix] = scattered[ix];
    positions[ix + 1] = scattered[ix + 1];
    positions[ix + 2] = scattered[ix + 2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: isSmall ? 0.045 : 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(geo, mat));

  /* --- Faint silhouette rings (the "O" outline) --- */
  function silhouetteRing(radius) {
    const pts = [];
    for (let s = 0; s <= 96; s++) {
      const a = (s / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(radius * Math.cos(a), radius * Math.sin(a), 0));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color: 0xd7ff3e, transparent: true, opacity: 0 })
    );
  }
  const outerRing = silhouetteRing(R + TUBE);
  const innerRing = silhouetteRing(R - TUBE);
  group.add(outerRing, innerRing);
  const ringMats = [outerRing.material, innerRing.material];

  /* --- Theme-aware palette: additive lime on dark, normal-blended
         acid-olive on light (additive washes out on paper) --- */
  const HERO_PALETTES = {
    dark: { accent: "#d7ff3e", dim: "#55554f", ring: 0xd7ff3e, blending: THREE.AdditiveBlending },
    light: { accent: "#66800b", dim: "#8a897e", ring: 0x66800b, blending: THREE.NormalBlending },
  };
  function applyHeroTheme(theme) {
    const p = HERO_PALETTES[theme] || HERO_PALETTES.dark;
    const a = new THREE.Color(p.accent);
    const d = new THREE.Color(p.dim);
    for (let j = 0; j < COUNT; j++) {
      const c = accentFlags[j] ? a : d;
      colors[j * 3] = c.r;
      colors[j * 3 + 1] = c.g;
      colors[j * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
    mat.blending = p.blending;
    mat.needsUpdate = true;
    ringMats.forEach((m) => m.color.setHex(p.ring));
  }
  applyHeroTheme(document.documentElement.dataset.theme);
  window.addEventListener("ob:theme", (e) => applyHeroTheme(e.detail));

  /* --- Sizing --- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, w > 900 ? -w * 0.18 : 0, h * 0.08, w, h);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* --- Mouse parallax --- */
  if (!isTouch) {
    window.addEventListener("mousemove", (e) => {
      heroState.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      heroState.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /* --- Build-in animation --- */
  if (reduced) {
    heroState.build = 1;
    ringMats.forEach((m) => (m.opacity = 0.18));
  } else {
    gsap.to(heroState, {
      build: 1,
      duration: 2.6,
      ease: "power3.inOut",
      delay: 0.15,
      onComplete: () => gsap.to(ringMats, { opacity: 0.18, duration: 1.2 }),
    });
    gsap.to(heroState, {
      scatter: 0.65,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
    });
    gsap.to(ringMats, {
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "30% top", end: "bottom top", scrub: 1 },
    });
  }

  /* --- Render loop --- */
  const pos = geo.attributes.position;
  const clock = new THREE.Clock();
  let raf;

  function tick() {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    const b = heroState.build * (1 - heroState.scatter);

    for (let j = 0; j < COUNT; j++) {
      const jx = j * 3;
      const drift = Math.sin(t * 0.6 + j * 0.37) * 0.025;
      pos.array[jx] = scattered[jx] + (targets[jx] - scattered[jx]) * b + drift;
      pos.array[jx + 1] = scattered[jx + 1] + (targets[jx + 1] - scattered[jx + 1]) * b + Math.cos(t * 0.5 + j * 0.53) * 0.025;
      pos.array[jx + 2] = scattered[jx + 2] + (targets[jx + 2] - scattered[jx + 2]) * b + drift;
    }
    pos.needsUpdate = true;

    group.rotation.z = t * 0.06;
    group.rotation.y = Math.sin(t * 0.22) * 0.5 + heroState.mouseX * 0.3;
    group.rotation.x = Math.cos(t * 0.18) * 0.25 + heroState.mouseY * 0.2;

    renderer.render(scene, camera);
  }
  tick();

  ScrollTrigger.create({
    trigger: "#hero",
    start: "top bottom",
    end: "bottom top",
    onLeave: () => cancelAnimationFrame(raf),
    onEnterBack: () => tick(),
  });
}

initHero().catch((err) => console.warn("Hero 3D disabled:", err));

/* ============================================================
   CURSOR (event delegation — survives any DOM)
   ============================================================ */
if (!isTouch && !reduced) {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (dot && ring) {
    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    window.addEventListener("mousemove", (e) => {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
    });
    document.addEventListener("mouseover", (e) => {
      const el = e.target.closest("[data-hover]");
      if (el) ring.classList.add(el.dataset.cursor === "view" ? "is-view" : "is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("[data-hover]")) ring.classList.remove("is-hover", "is-view");
    });
  }
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
if (!isTouch && !reduced) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
  });
}

/* ============================================================
   HEADER — full bar morphs into a floating pill, both directions
   ============================================================ */
const header = document.getElementById("siteHeader");
ScrollTrigger.create({
  start: 140,
  end: "max",
  onToggle: (self) => header.classList.toggle("is-stuck", self.isActive),
});

/* --- Mobile menu --- */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  mobileMenu.setAttribute("aria-hidden", "false");
  gsap.set(mobileMenu, { visibility: "visible" });
  gsap.to(mobileMenu, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" });
  gsap.fromTo(".mm-link", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.25, ease: "power3.out" });
  gsap.fromTo(".mobile-menu-foot", { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 });
  lenis?.stop();
}
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  gsap.to(mobileMenu, {
    clipPath: "inset(0 0 100% 0)",
    duration: 0.6,
    ease: "power4.inOut",
    onComplete: () => gsap.set(mobileMenu, { visibility: "hidden" }),
  });
  lenis?.start();
}
menuToggle?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

/* ============================================================
   PROJECT MODAL
   ============================================================ */
const modal = document.getElementById("projectModal");
if (modal) {
  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lenis?.stop();
    modal.querySelector("input")?.focus();
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    lenis?.start();
  };
  // delegated so dynamically injected triggers (e.g. the Lab planner) work too
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-modal]")) { e.preventDefault(); closeMenu(); openModal(); }
  });
  window.addEventListener("ob:open-modal", openModal);
  modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

/* ============================================================
   FORMS (modal + contact page) — Web3Forms
   AJAX-submitted as JSON to the form's action endpoint so the
   success state stays in-page. Works from anywhere (incl. local
   dev). The access_key + fields ride in the form body.
   ============================================================ */
document.querySelectorAll("form.ob-form").forEach((form) => {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return; // native required-field checks
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "SENDING…";
    status.className = "form-status";
    try {
      const res = await fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
      status.textContent = "RECEIVED — WE'LL REPLY WITHIN 24H.";
      status.classList.add("is-ok");
      form.reset();
    } catch (err) {
      status.textContent = "SOMETHING BROKE — EMAIL HELLO@OUTBUILDLAB.COM";
      status.classList.add("is-err");
    } finally {
      btn.disabled = false;
    }
  });
});

/* ============================================================
   SCROLL ANIMATIONS (each guarded by element existence)
   ============================================================ */
if (!reduced) {
  const manifesto = document.getElementById("manifesto");
  if (manifesto) {
    document.fonts.ready.then(() => {
      const split = new SplitText(manifesto, { type: "words", wordsClass: "word" });
      gsap.to(split.words, {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: { trigger: manifesto, start: "top 75%", end: "bottom 40%", scrub: 0.5 },
      });
    });
  }

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  gsap.utils.toArray(".service-row").forEach((row, idx) => {
    gsap.from(row, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      delay: (idx % 4) * 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 90%" },
    });
  });

  gsap.utils.toArray(".work-card").forEach((card) => {
    gsap.from(card, {
      y: 80,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%" },
    });
    gsap.fromTo(card.querySelector(".wv-art"), { yPercent: -6 }, {
      yPercent: 6,
      ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });

  document.querySelectorAll(".stat-num").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => { el.textContent = Math.round(obj.n) + suffix; },
    });
  });

  if (document.querySelector(".cta-inner")) {
    gsap.from(".cta-inner", {
      yPercent: 110,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: ".cta-link", start: "top 85%" },
    });
  }

  const track = document.getElementById("marqueeTrack");
  if (track) {
    const tween = gsap.to(track, { xPercent: -50, repeat: -1, ease: "none", duration: 22 });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity());
        tween.timeScale(gsap.utils.clamp(1, 4, 1 + v / 1500));
      },
    });
  }
} else {
  document.querySelectorAll(".stat-num").forEach((el) => {
    el.textContent = el.dataset.count + (el.dataset.suffix || "");
  });
}

/* ============================================================
   CASE STUDY — award-tier choreography (guarded by .case)
   Reuses the Lenis-synced gsap/ScrollTrigger above so scroll
   scrubbing stays smooth. Empty NodeLists are no-ops, so the
   one block serves all four product mockups.
   ============================================================ */
const caseEl = document.querySelector(".case");
if (!reduced && caseEl) {
  // Hero: masked char reveal + meta stagger + watermark drift
  document.fonts.ready.then(() => {
    const title = caseEl.querySelector(".case-title");
    if (title) {
      const split = new SplitText(title, { type: "lines,chars", linesClass: "ct-line" });
      gsap.from(split.chars, {
        yPercent: 120, opacity: 0, stagger: 0.035, duration: 1, ease: "power4.out", delay: 0.05,
      });
    }
  });
  gsap.from(caseEl.querySelectorAll(".case-meta > div"), {
    y: 22, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", delay: 0.3,
  });
  const wm = caseEl.querySelector(".case-watermark");
  if (wm) {
    gsap.to(wm, {
      yPercent: 16, ease: "none",
      scrollTrigger: { trigger: ".case-hero", start: "top top", end: "bottom top", scrub: 1 },
    });
  }

  // Every mockup (hero stage + showcase shots): entrance + tilt + UI assembly
  caseEl.querySelectorAll(".mock").forEach((mock) => {
    const stage = mock.closest(".case-stage, .case-shot") || mock.parentElement;
    gsap.set(mock, { transformPerspective: 1200, transformOrigin: "center center" });
    gsap.from(mock, {
      yPercent: 12, scale: 0.93, opacity: 0, rotationX: 8,
      duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: stage, start: "top 85%" },
    });

    if (!isTouch) {
      const rx = gsap.quickTo(mock, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(mock, "rotationY", { duration: 0.6, ease: "power3.out" });
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        ry((((e.clientX - r.left) / r.width) - 0.5) * 13);
        rx((((e.clientY - r.top) / r.height) - 0.5) * -11);
      });
      stage.addEventListener("pointerleave", () => { rx(0); ry(0); });
    }

    // Inner UI assembles when this screen enters view (selectors span all products)
    const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top 80%" }, delay: 0.1 });
    tl.from(stage.querySelectorAll(".mk-chart span, .mk-spark span, .mk-week .mk-wb"), { scaleY: 0, transformOrigin: "bottom", stagger: 0.04, duration: 0.6, ease: "power3.out" }, 0)
      .from(stage.querySelectorAll(".mk-balance, .mk-send, .mk-hero-copy, .mk-hero-art, .mk-ask, .mk-ring, .mk-amount, .mk-donut, .mk-pdp-art, .mk-pg-req, .mk-vit-grid, .mk-keys"), { y: 16, opacity: 0, stagger: 0.07, duration: 0.55 }, 0.05)
      .from(stage.querySelectorAll(".mk-row, .mk-card, .mk-tile, .mk-co-line, .mk-key, .mk-barrow, .mk-quick span, .mk-legend > div, .mk-recip, .mk-sizes span"), { x: 16, opacity: 0, stagger: 0.06, duration: 0.45 }, 0.2)
      .from(stage.querySelectorAll(".mk-bub"), { y: 14, opacity: 0, scale: 0.96, stagger: 0.16, duration: 0.5, ease: "back.out(1.6)" }, 0.2)
      .from(stage.querySelectorAll(".mk-code"), { opacity: 0, y: 16, duration: 0.5 }, 0.2)
      .from(stage.querySelectorAll(".mk-plan, .mk-agent, .mk-insight, .mk-vit-cap, .mk-co-total, .mk-co-card"), { opacity: 0, y: 12, duration: 0.45 }, 0.45);
  });

  // Hero shot gets an extra parallax drift as you scroll past it
  const heroMock = caseEl.querySelector(".case-stage > .mock");
  if (heroMock) {
    gsap.to(heroMock, {
      yPercent: -9, ease: "none",
      scrollTrigger: { trigger: ".case-stage", start: "top bottom", end: "bottom top", scrub: 1 },
    });
  }
}

/* ============================================================
   FOOTER LOCAL TIME
   ============================================================ */
const timeEl = document.getElementById("localTime");
if (timeEl) {
  const updateTime = () => {
    const lagos = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
    }).format(new Date());
    timeEl.textContent = `LAGOS — ${lagos}`;
  };
  updateTime();
  setInterval(updateTime, 30000);
}

/* Display-size type shifts layout once fonts land */
document.fonts?.ready?.then(() => ScrollTrigger.refresh());
