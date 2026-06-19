/* ============================================================
   OUTBUILD LAB — main.js
   GSAP + Lenis + Three.js experience layer.
   Everything degrades gracefully: no WebGL → gradient fallback,
   reduced motion → content visible with no animation.
   ============================================================ */

import * as THREE from "three";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

gsap.registerPlugin(ScrollTrigger, SplitText);

// the preloader intro assumes we enter at the top — never restore scroll
ScrollTrigger.clearScrollMemory("manual");
window.scrollTo(0, 0);

/* ============================================================
   SMOOTH SCROLL (Lenis)
   ============================================================ */
let lenis = null;
if (!prefersReducedMotion && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

/* ============================================================
   THREE.JS HERO — particles assembling into a wireframe cube
   ============================================================ */
const heroState = { build: 0, scatter: 0, mouseX: 0, mouseY: 0 };
let threeOK = false;

function initHero() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.style.display = "none";
    return;
  }
  threeOK = true;

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

  const accent = new THREE.Color("#d7ff3e");
  const dim = new THREE.Color("#55554f");

  const targetArr = [];
  const colorArr = [];
  for (let u = 0; u < U; u++) {
    for (let v = 0; v < V; v++) {
      const theta = (u / U) * Math.PI * 2;
      const phi = (v / V) * Math.PI * 2;
      const ring = R + TUBE * Math.cos(phi);
      targetArr.push(ring * Math.cos(theta), ring * Math.sin(theta), TUBE * Math.sin(phi));
      // accent spokes every 7th column + the outer equator ring
      const c = u % 7 === 0 || v === 0 ? accent : dim;
      colorArr.push(c.r, c.g, c.b);
    }
  }

  const COUNT = targetArr.length / 3;
  const targets = new Float32Array(targetArr);
  const colors = new Float32Array(colorArr);
  const positions = new Float32Array(COUNT * 3);
  const scattered = new Float32Array(COUNT * 3);

  for (let j = 0; j < COUNT; j++) {
    const ix = j * 3;
    // scattered start: random sphere shell around the scene
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
  const points = new THREE.Points(geo, mat);
  group.add(points);

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
  const wireMat = [outerRing.material, innerRing.material];

  /* --- Sizing --- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // push the cube right of center on wide screens, center on mobile
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
  if (prefersReducedMotion) {
    heroState.build = 1;
    wireMat.forEach((m) => (m.opacity = 0.18));
  } else {
    gsap.to(heroState, {
      build: 1,
      duration: 2.6,
      ease: "power3.inOut",
      delay: 0.15,
      onComplete: () => gsap.to(wireMat, { opacity: 0.18, duration: 1.2 }),
    });
    // scatter slightly as you scroll past the hero (separate prop so it
    // never fights the intro tween on `build`)
    gsap.to(heroState, {
      scatter: 0.65,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
    });
    gsap.to(wireMat, {
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
      // drift noise keeps the assembled cube alive
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

  // stop rendering when the hero is far off-screen
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top bottom",
    end: "bottom top",
    onLeave: () => cancelAnimationFrame(raf),
    onEnterBack: () => tick(),
  });
}

try {
  initHero();
} catch (err) {
  console.warn("Hero 3D disabled:", err);
}

/* ============================================================
   PRELOADER + HERO INTRO
   ============================================================ */
const preloader = document.getElementById("preloader");
const counterEl = document.getElementById("loaderCount");

function heroIntro() {
  if (prefersReducedMotion) return;
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.from(".ht-inner", { yPercent: 115, duration: 1.3, stagger: 0.12 }, 0)
    .from(".hero-eyebrow", { y: 24, opacity: 0, duration: 0.9 }, 0.35)
    .from(".hero-foot", { y: 30, opacity: 0, duration: 1 }, 0.55)
    .from(".site-header", { y: -40, opacity: 0, duration: 0.9 }, 0.5);
}

if (prefersReducedMotion) {
  preloader.style.display = "none";
} else {
  const load = { n: 0 };
  const tl = gsap.timeline();
  tl.to(load, {
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
        preloader.style.display = "none";
        ScrollTrigger.refresh();
      },
    }, "-=0.1")
    .add(heroIntro, "-=0.55");
}

/* ============================================================
   CURSOR
   ============================================================ */
if (!isTouch && !prefersReducedMotion) {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
  const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
  const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    xDot(e.clientX); yDot(e.clientY);
    xRing(e.clientX); yRing(e.clientY);
  });

  document.querySelectorAll("[data-hover]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.classList.add(el.dataset.cursor === "view" ? "is-view" : "is-hover");
    });
    el.addEventListener("mouseleave", () => {
      ring.classList.remove("is-hover", "is-view");
    });
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
if (!isTouch && !prefersReducedMotion) {
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
   NAV — hide on scroll down, anchor smooth scroll, mobile menu
   ============================================================ */
const header = document.getElementById("siteHeader");

// morph the full-width bar into a floating pill once past the hero's first beat;
// the bar stays visible in both scroll directions
ScrollTrigger.create({
  start: 140,
  end: "max",
  onToggle: (self) => header.classList.toggle("is-stuck", self.isActive),
});

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
document.getElementById("scrollCue")?.addEventListener("click", () => scrollTo("#studio"));

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
   SCROLL ANIMATIONS
   ============================================================ */
if (!prefersReducedMotion) {
  /* Manifesto: words light up as you scroll (split after fonts settle) */
  const manifesto = document.getElementById("manifesto");
  if (manifesto) {
    const initManifesto = () => {
      const split = new SplitText(manifesto, { type: "words", wordsClass: "word" });
      gsap.to(split.words, {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: manifesto,
          start: "top 75%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });
    };
    if (document.fonts?.ready) document.fonts.ready.then(initManifesto);
    else initManifesto();
  }

  /* Generic reveals */
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* Service rows slide in */
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

  /* Work cards: fade up + subtle parallax */
  gsap.utils.toArray(".work-card").forEach((card) => {
    gsap.from(card, {
      y: 80,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%" },
    });
    const art = card.querySelector(".wv-art");
    gsap.fromTo(art, { yPercent: -6 }, {
      yPercent: 6,
      ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });

  /* Stats counters */
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

  /* CTA giant line */
  gsap.from(".cta-inner", {
    yPercent: 110,
    duration: 1.2,
    ease: "power4.out",
    scrollTrigger: { trigger: ".cta-link", start: "top 85%" },
  });

  /* Marquee: constant drift + scroll-velocity boost */
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
  // reduced motion: stats show final values immediately
  document.querySelectorAll(".stat-num").forEach((el) => {
    el.textContent = el.dataset.count + (el.dataset.suffix || "");
  });
}

/* ============================================================
   FOOTER LOCAL TIME
   ============================================================ */
const timeEl = document.getElementById("localTime");
function updateTime() {
  const lagos = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
  }).format(new Date());
  timeEl.textContent = `LAGOS — ${lagos}`;
}
updateTime();
setInterval(updateTime, 30000);

/* Refresh triggers after fonts settle (display sizes shift layout) */
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
