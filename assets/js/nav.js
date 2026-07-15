/**
 * Super Pet Shop — Navegação: header sticky, menu mobile animado, active links
 */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(() => {
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("nav-toggle");
    const panel = document.getElementById("nav-panel");
    const panelLinks = panel ? panel.querySelectorAll("a") : [];

    /* Sticky shadow on scroll */
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Mobile menu */
    function setOpen(open) {
      if (!toggle || !panel) return;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
      if (open) {
        panelLinks[0]?.focus();
      }
    }

    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    panelLinks.forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    /* Active nav link by section / page */
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__link[data-nav]").forEach((link) => {
      const nav = link.getAttribute("data-nav");
      if (path.includes("produtos") && nav === "produtos") {
        link.classList.add("is-active");
      } else if (!path.includes("produtos") && nav === "inicio" && path.match(/^(index\.html)?$/)) {
        link.classList.add("is-active");
      }
    });

    /* Highlight section on scroll (index only) */
    if (!path.includes("produtos")) {
      const sections = document.querySelectorAll("main section[id]");
      const navLinks = document.querySelectorAll('.nav__link[href*="#"]');

      if (sections.length && "IntersectionObserver" in window) {
        const map = new Map();
        navLinks.forEach((a) => {
          const href = a.getAttribute("href") || "";
          const id = href.split("#")[1];
          if (id) map.set(id, a);
        });

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

        sections.forEach((s) => io.observe(s));
      }
    }
  });
})();
