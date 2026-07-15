/**
 * Super Pet Shop — Gerador de Cartão de Herói
 * Canvas nativo (sem html2canvas): monta capa estilo HQ e permite download PNG.
 * Prioridade máxima do site — elemento-assinatura da marca.
 */

(function () {
  "use strict";

  const CANVAS_W = 720;
  const CANVAS_H = 960;

  const COLORS = {
    ink: "#0E1116",
    paper: "#F5F1E8",
    volt: "#F4D53A",
    cobalt: "#2B4BF2",
    blaze: "#FF4B33",
  };

  const POWER_BY_SIZE = {
    pequeno: "VELOCIDADE SÔNICA",
    medio: "FORÇA ESTRATÉGICA",
    grande: "PODER DE IMPACTO",
    gigante: "FORÇA TITÂNICA",
  };

  const SPECIES_TAG = {
    cao: "CANINO",
    gato: "FELINO",
    outro: "LENDÁRIO",
  };

  /** @type {HTMLCanvasElement|null} */
  let canvas = null;
  /** @type {CanvasRenderingContext2D|null} */
  let ctx = null;
  /** @type {HTMLImageElement|null} */
  let petImage = null;
  let state = {
    name: "THOR",
    species: "cao",
    size: "medio",
    power: "",
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function drawHalftone(c, x, y, w, h, color, step, radius) {
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    c.fillStyle = color;
    for (let py = y; py < y + h; py += step) {
      for (let px = x; px < x + w; px += step) {
        const offset = ((py / step) | 0) % 2 === 0 ? 0 : step / 2;
        c.beginPath();
        c.arc(px + offset, py, radius, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }

  function drawBurst(c, cx, cy, rOuter, rInner, spikes, fill) {
    c.save();
    c.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (Math.PI * i) / spikes - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    c.restore();
  }

  function wrapText(c, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (c.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function drawCoverPhoto(c, img, x, y, w, h) {
    if (!img) {
      c.fillStyle = COLORS.cobalt;
      c.fillRect(x, y, w, h);
      drawHalftone(c, x, y, w, h, "rgba(244,213,58,0.25)", 10, 1.5);
      c.fillStyle = COLORS.paper;
      c.font = "700 22px 'Public Sans', sans-serif";
      c.textAlign = "center";
      c.fillText("FOTO DO HERÓI", x + w / 2, y + h / 2);
      return;
    }

    // cover fit
    const ir = img.width / img.height;
    const br = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;
    if (ir > br) {
      sw = img.height * br;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / br;
      sy = (img.height - sh) / 2;
    }
    c.drawImage(img, sx, sy, sw, sh, x, y, w, h);

    // vignette + halftone overlay for comic print feel
    const grad = c.createLinearGradient(x, y + h * 0.45, x, y + h);
    grad.addColorStop(0, "rgba(14,17,22,0)");
    grad.addColorStop(1, "rgba(14,17,22,0.85)");
    c.fillStyle = grad;
    c.fillRect(x, y, w, h);

    c.globalCompositeOperation = "multiply";
    drawHalftone(c, x, y, w, h, "rgba(14,17,22,0.35)", 8, 1.2);
    c.globalCompositeOperation = "source-over";
  }

  function renderCard() {
    if (!canvas || !ctx) return;
    const c = ctx;
    const name = (state.name || "HERÓI").trim().toUpperCase();
    const species = SPECIES_TAG[state.species] || "LENDÁRIO";
    const power =
      (state.power && state.power.trim().toUpperCase()) ||
      POWER_BY_SIZE[state.size] ||
      "PODER DESCONHECIDO";

    // Background
    c.fillStyle = COLORS.ink;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Outer paper border
    c.strokeStyle = COLORS.paper;
    c.lineWidth = 10;
    c.strokeRect(18, 18, CANVAS_W - 36, CANVAS_H - 36);

    // Inner volt border
    c.strokeStyle = COLORS.volt;
    c.lineWidth = 3;
    c.strokeRect(32, 32, CANVAS_W - 64, CANVAS_H - 64);

    // Header strip
    c.fillStyle = COLORS.volt;
    c.fillRect(40, 40, CANVAS_W - 80, 78);
    c.fillStyle = COLORS.ink;
    c.font = "700 16px 'Public Sans', sans-serif";
    c.textAlign = "left";
    c.letterSpacing = "0.12em";
    c.fillText("SUPER PET SHOP  ·  EDIÇÃO ESPECIAL", 56, 72);
    c.font = "700 13px 'Public Sans', sans-serif";
    c.fillText("CUIABÁ · MT", 56, 98);

    // Corner issue badge
    drawBurst(c, CANVAS_W - 95, 95, 48, 28, 12, COLORS.blaze);
    c.fillStyle = COLORS.paper;
    c.font = "700 14px 'Public Sans', sans-serif";
    c.textAlign = "center";
    c.fillText("Nº 01", CANVAS_W - 95, 92);
    c.font = "700 11px 'Public Sans', sans-serif";
    c.fillText("HERÓI", CANVAS_W - 95, 108);

    // Photo panel
    const px = 52;
    const py = 140;
    const pw = CANVAS_W - 104;
    const ph = 480;
    c.fillStyle = COLORS.ink;
    c.fillRect(px - 4, py - 4, pw + 8, ph + 8);
    c.strokeStyle = COLORS.paper;
    c.lineWidth = 4;
    c.strokeRect(px - 4, py - 4, pw + 8, ph + 8);
    drawCoverPhoto(c, petImage, px, py, pw, ph);

    // Diagonal action band over photo
    c.save();
    c.beginPath();
    c.moveTo(px, py + ph - 90);
    c.lineTo(px + pw, py + ph - 150);
    c.lineTo(px + pw, py + ph);
    c.lineTo(px, py + ph);
    c.closePath();
    c.fillStyle = COLORS.cobalt;
    c.fill();
    c.restore();
    drawHalftone(c, px, py + ph - 150, pw, 150, "rgba(244,213,58,0.2)", 9, 1.3);

    c.fillStyle = COLORS.paper;
    c.font = "700 14px 'Public Sans', sans-serif";
    c.textAlign = "left";
    c.fillText("CLASSE " + species, px + 20, py + ph - 40);

    // Title block
    const titleY = 660;
    c.fillStyle = COLORS.paper;
    c.font = "400 72px 'Bebas Neue', 'Impact', sans-serif";
    c.textAlign = "center";
    c.fillText(name.length > 14 ? name.slice(0, 14) : name, CANVAS_W / 2, titleY);

    c.fillStyle = COLORS.volt;
    c.font = "400 28px 'Bebas Neue', 'Impact', sans-serif";
    c.fillText("E OS PODERES DE", CANVAS_W / 2, titleY + 42);

    c.fillStyle = COLORS.paper;
    c.font = "400 36px 'Bebas Neue', 'Impact', sans-serif";
    const powerLines = wrapText(c, power, CANVAS_W - 120);
    powerLines.slice(0, 2).forEach((line, i) => {
      c.fillText(line, CANVAS_W / 2, titleY + 88 + i * 40);
    });

    // Bottom footer bar
    c.fillStyle = COLORS.volt;
    c.fillRect(40, CANVAS_H - 100, CANVAS_W - 80, 52);
    c.fillStyle = COLORS.ink;
    c.font = "700 15px 'Public Sans', sans-serif";
    c.textAlign = "center";
    c.fillText("SEU PET. HERÓI DE VERDADE.  ·  SUPER PET SHOP", CANVAS_W / 2, CANVAS_H - 68);

    // Side tag
    c.save();
    c.translate(28, CANVAS_H / 2);
    c.rotate(-Math.PI / 2);
    c.fillStyle = COLORS.cobalt;
    c.fillRect(-70, -14, 140, 28);
    c.fillStyle = COLORS.paper;
    c.font = "700 12px 'Public Sans', sans-serif";
    c.textAlign = "center";
    c.fillText("ORIGEM: CUIABÁ-MT", 0, 5);
    c.restore();
  }

  function setPetFromURL(url) {
    loadImage(url)
      .then((img) => {
        petImage = img;
        renderCard();
      })
      .catch(() => {
        petImage = null;
        renderCard();
      });
  }

  function setPetFromFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPetFromURL(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function downloadCard() {
    if (!canvas) return;
    const name = (state.name || "heroi").trim().toLowerCase().replace(/\s+/g, "-") || "heroi";
    const link = document.createElement("a");
    link.download = `cartao-heroi-${name}-super-pet-shop.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function shareWhatsApp() {
    const name = (state.name || "meu pet").trim();
    const power =
      (state.power && state.power.trim()) ||
      POWER_BY_SIZE[state.size] ||
      "poderes lendários";
    const msg = `Acabei de criar o Cartão de Herói do ${name} no Super Pet Shop! Poder: ${power}. Faça o seu também: ${window.location.origin}${window.location.pathname}#cartao-heroi`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function bindForm(root) {
    const nameInput = root.querySelector("#hero-name");
    const speciesSelect = root.querySelector("#hero-species");
    const sizeSelect = root.querySelector("#hero-size");
    const powerInput = root.querySelector("#hero-power");
    const fileInput = root.querySelector("#hero-photo");
    const avatars = root.querySelectorAll("[data-avatar]");
    const downloadBtn = root.querySelector("[data-download-card]");
    const shareBtn = root.querySelector("[data-share-card]");

    const sync = () => {
      state.name = nameInput?.value || "THOR";
      state.species = speciesSelect?.value || "cao";
      state.size = sizeSelect?.value || "medio";
      state.power = powerInput?.value || "";
      renderCard();
    };

    nameInput?.addEventListener("input", sync);
    speciesSelect?.addEventListener("change", sync);
    sizeSelect?.addEventListener("change", sync);
    powerInput?.addEventListener("input", sync);

    fileInput?.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        avatars.forEach((a) => a.classList.remove("is-selected"));
        setPetFromFile(file);
      }
    });

    avatars.forEach((btn) => {
      btn.addEventListener("click", () => {
        avatars.forEach((a) => a.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        if (fileInput) fileInput.value = "";
        const src = btn.getAttribute("data-avatar");
        if (src) setPetFromURL(src);
      });
    });

    downloadBtn?.addEventListener("click", downloadCard);
    shareBtn?.addEventListener("click", shareWhatsApp);

    // default avatar
    const first = root.querySelector("[data-avatar]");
    if (first) {
      first.classList.add("is-selected");
      const src = first.getAttribute("data-avatar");
      if (src) setPetFromURL(src);
    } else {
      renderCard();
    }

    sync();
  }

  ready(() => {
    const root = document.getElementById("cartao-heroi");
    canvas = document.getElementById("hero-card-canvas");
    if (!root || !canvas) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    const start = () => bindForm(root);

    // Garante Bebas Neue / Public Sans no canvas antes do primeiro render
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }
  });
})();
