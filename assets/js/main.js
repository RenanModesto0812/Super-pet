/**
 * Super Pet Shop — Interactions
 * Navbar, mobile menu, scroll reveal, lightbox, parallax, year
 * Pure JavaScript (no frameworks)
 */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Navbar scroll state ---------- */
  function setupNavbar() {
    const navbar = document.querySelector("[data-navbar]");
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  function setupMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const panel = document.getElementById("nav-panel");
    if (!toggle || !panel) return;

    const links = panel.querySelectorAll("a");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    links.forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  function setupActiveNav() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav__link");
    if (!sections.length || !navLinks.length) return;

    const map = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) map.set(href.slice(1), link);
    });

    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((l) => l.classList.remove("is-active"));
          map.get(id)?.classList.add("is-active");
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => io.observe(section));
  }

  /* ---------- Scroll Reveal (Intersection Observer) ---------- */
  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    // Stagger cards in grids automatically
    document.querySelectorAll(".services__grid, .diff-grid, .testimonials__grid, .gallery__grid").forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        if (child.classList.contains("reveal") && !child.hasAttribute("data-delay")) {
          child.setAttribute("data-delay", String(Math.min(i + 1, 6)));
        }
      });
    });

    if (prefersReducedMotion()) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    nodes.forEach((el) => io.observe(el));
  }

  /* ---------- Light parallax on hero visual ---------- */
  function setupParallax() {
    const target = document.querySelector("[data-parallax]");
    if (!target || prefersReducedMotion()) return;

    let ticking = false;

    const update = () => {
      const rect = target.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      // Only apply while near viewport
      if (rect.bottom < 0 || rect.top > viewH) {
        ticking = false;
        return;
      }
      const progress = (rect.top + rect.height / 2 - viewH / 2) / viewH;
      const y = progress * -18; // subtle
      target.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Gallery Lightbox ---------- */
  function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const closeBtn = lightbox?.querySelector("[data-lightbox-close]");
    const triggers = document.querySelectorAll("[data-lightbox-src]");

    if (!lightbox || !img || !triggers.length) return;

    let lastFocus = null;

    function open(src, alt) {
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt || "Foto ampliada";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeBtn?.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      img.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        open(btn.getAttribute("data-lightbox-src"), btn.getAttribute("data-lightbox-alt"));
      });
    });

    closeBtn?.addEventListener("click", close);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        close();
      }
    });
  }

  /* ---------- Smooth anchor offset handled by CSS; enhance focus ---------- */
  function setupAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        // Let native smooth scroll work; move focus for a11y after short delay
        setTimeout(() => {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, 400);
      });
    });
  }

  /* ---------- Current year ---------- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Init ---------- */
  ready(() => {
    setupNavbar();
    setupMobileNav();
    setupActiveNav();
    setupReveal();
    setupParallax();
    setupLightbox();
    setupAnchors();
    setYear();
  });
})();
