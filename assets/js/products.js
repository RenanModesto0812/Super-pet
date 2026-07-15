/**
 * Super Pet Shop — Catálogo, filtros e carrinho (front-end only)
 * Sem backend de pagamento: checkout redireciona ao WhatsApp com o pedido.
 */

(function () {
  "use strict";

  const WA_NUMBER = "5565993043088";
  const STORAGE_KEY = "sps_cart_v1";

  /** @type {Array<{id:string,name:string,category:string,price:number,badge?:string,desc:string,image:string}>} */
  const PRODUCTS = [
    {
      id: "racao-golden-15kg",
      name: "Golden Special Cães Adultos 15kg",
      category: "caes",
      price: 189.9,
      badge: "MAIS VENDIDO",
      desc: "Ração premium com frango e carne para cães adultos de todos os portes.",
      image: "assets/img/prod-racao-caes.png",
    },
    {
      id: "racao-premier-gatos",
      name: "Premier Ambientes Internos Gatos 7,5kg",
      category: "gatos",
      price: 219.9,
      badge: "DESTAQUE",
      desc: "Fórmula para gatos castrados que vivem em apartamento. Controle de bolas de pelo.",
      image: "assets/img/prod-racao-gatos.png",
    },
    {
      id: "shampoo-hydras",
      name: "Shampoo Hydra Neutro 500ml",
      category: "higiene",
      price: 42.9,
      desc: "Limpeza suave para banhos frequentes. Não resseca a pele nem o pelo.",
      image: "assets/img/prod-shampoo.png",
    },
    {
      id: "coleira-peitoral-m",
      name: "Peitoral Anti-Puxão Mesh M",
      category: "acessorios",
      price: 79.9,
      badge: "NOVO",
      desc: "Ajuste anatômico, fivela reforçada e alça superior para passeio controlado.",
      image: "assets/img/prod-coleira.png",
    },
    {
      id: "brinquedo-corda",
      name: "Corda Dental Twist Dupla",
      category: "caes",
      price: 29.9,
      desc: "Brinquedo de algodão trançado que ajuda na limpeza dos dentes durante a brincadeira.",
      image: "assets/img/prod-brinquedo.png",
    },
    {
      id: "cama-ortopedica",
      name: "Cama Ortopédica Memory Foam G",
      category: "acessorios",
      price: 249.9,
      badge: "MAIS VENDIDO",
      desc: "Espuma viscoelástica e capa removível. Ideal para pets seniores e de porte grande.",
      image: "assets/img/prod-cama.png",
    },
    {
      id: "petisco-bifinho",
      name: "Bifinho Natural Sabor Frango 500g",
      category: "caes",
      price: 34.9,
      desc: "Petisco macio sem corantes artificiais. Recompensa perfeita no adestramento.",
      image: "assets/img/prod-petisco.png",
    },
    {
      id: "areia-pipicat",
      name: "Areia Higiênica Pipicat Classic 12kg",
      category: "gatos",
      price: 54.9,
      desc: "Granulado de argila com excelente absorção e controle de odores.",
      image: "assets/img/prod-areia.png",
    },
    {
      id: "racao-n&d-cordeiro",
      name: "N&D Ancestral Grain Cordeiro 10kg",
      category: "caes",
      price: 389.9,
      badge: "PREMIUM",
      desc: "Linha low grain com superfoods. Proteína de cordeiro para cães adultos.",
      image: "assets/img/prod-racao-caes.png",
    },
    {
      id: "arranjonador-gatos",
      name: "Arranhador Torre com Nicho 90cm",
      category: "gatos",
      price: 199.9,
      desc: "Sisal natural, base estável e nicho acolchoado. Desvia unhas do sofá.",
      image: "assets/img/prod-brinquedo.png",
    },
    {
      id: "antipulgas-bravecto",
      name: "Bravecto Antipulgas Cães 10–20kg",
      category: "higiene",
      price: 189.0,
      badge: "URGENTE - VACINA / SAÚDE",
      badgeType: "blaze",
      desc: "Proteção oral contra pulgas e carrapatos por até 12 semanas. Consulte o peso do pet.",
      image: "assets/img/prod-shampoo.png",
    },
    {
      id: "comedouro-duplo",
      name: "Comedouro Inox Duplo com Base",
      category: "acessorios",
      price: 64.9,
      desc: "Tigelas de inox removíveis e base antiderrapante. Água e ração no mesmo set.",
      image: "assets/img/prod-coleira.png",
    },
  ];

  const CATEGORY_LABELS = {
    all: "Todos",
    caes: "Cães",
    gatos: "Gatos",
    higiene: "Higiene",
    acessorios: "Acessórios",
  };

  /* ---------- Cart state ---------- */
  function loadCart() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  function cartCount() {
    return cart.reduce((n, i) => n + i.qty, 0);
  }

  function cartTotal() {
    return cart.reduce((sum, i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function updateCartBadge() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const n = cartCount();
      el.textContent = n > 0 ? String(n) : "";
      el.setAttribute("data-count", String(n));
      el.setAttribute("aria-label", n === 1 ? "1 item no carrinho" : `${n} itens no carrinho`);
    });
  }

  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function addToCart(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    const existing = cart.find((i) => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
    showToast(`${product.name} no arsenal`);
  }

  function removeFromCart(productId) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const body = document.getElementById("cart-drawer-body");
    const totalEl = document.getElementById("cart-total-value");
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = '<p class="cart-empty">Seu arsenal está vazio. Adicione produtos da vitrine.</p>';
    } else {
      body.innerHTML = cart
        .map((item) => {
          const p = PRODUCTS.find((x) => x.id === item.id);
          if (!p) return "";
          return `
            <article class="cart-item" data-id="${p.id}">
              <div>
                <p class="cart-item__name">${escapeHtml(p.name)}</p>
                <p class="cart-item__meta">${item.qty}x · ${formatBRL(p.price * item.qty)}</p>
              </div>
              <button type="button" class="cart-item__remove" data-remove="${p.id}" aria-label="Remover ${escapeHtml(p.name)}">Remover</button>
            </article>`;
        })
        .join("");
    }

    if (totalEl) totalEl.textContent = formatBRL(cartTotal());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openCart() {
    const drawer = document.getElementById("cart-drawer");
    document.getElementById("cart-overlay")?.classList.add("is-open");
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    drawer?.querySelector("button, a")?.focus();
  }

  function closeCart() {
    const drawer = document.getElementById("cart-drawer");
    document.getElementById("cart-overlay")?.classList.remove("is-open");
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function checkoutWhatsApp() {
    if (cart.length === 0) {
      showToast("Carrinho vazio");
      return;
    }
    const lines = cart.map((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      return p ? `• ${item.qty}x ${p.name} — ${formatBRL(p.price * item.qty)}` : "";
    });
    const msg = [
      "Olá, Super Pet Shop! Quero finalizar este pedido:",
      "",
      ...lines,
      "",
      `*Total: ${formatBRL(cartTotal())}*`,
      "",
      "Pode me confirmar disponibilidade e forma de retirada/entrega?",
    ].join("\n");
    // Checkout front-end: sem gateway de pagamento — pedido via WhatsApp da loja
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  /* ---------- Product rendering ---------- */
  function badgeClass(product) {
    if (product.badgeType === "blaze" || (product.badge && /URGENT|VACINA|SAÚDE/i.test(product.badge))) {
      return "badge badge--blaze";
    }
    if (product.badge && /NOVO|PREMIUM/i.test(product.badge)) {
      return "badge badge--cobalt";
    }
    return "badge badge--volt";
  }

  function productCardHTML(product) {
    const badge = product.badge
      ? `<span class="${badgeClass(product)}">${escapeHtml(product.badge)}</span>`
      : "";
    return `
      <article class="product-card reveal" data-category="${product.category}" data-id="${product.id}">
        <div class="product-card__media">
          <div class="product-card__badges">${badge}</div>
          <img src="${product.image}" alt="${escapeHtml(product.name)}" width="400" height="400" loading="lazy" />
        </div>
        <div class="product-card__body">
          <span class="label product-card__cat">${CATEGORY_LABELS[product.category] || product.category}</span>
          <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
          <p class="product-card__desc">${escapeHtml(product.desc)}</p>
          <div class="product-card__footer">
            <p class="product-card__price">${formatBRL(product.price)}<small>à vista</small></p>
            <button type="button" class="btn btn--volt btn--sm" data-add="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts(container, options = {}) {
    if (!container) return;
    const { featuredOnly = false, limit = null, category = "all" } = options;
    let list = [...PRODUCTS];

    if (featuredOnly) {
      list = list.filter((p) => p.badge);
    }
    if (category && category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (limit) list = list.slice(0, limit);

    if (list.length === 0) {
      container.innerHTML = '<p class="product-empty">Nenhum produto nesta categoria. Tente outro filtro.</p>';
      return;
    }

    container.innerHTML = list.map(productCardHTML).join("");

    // re-observe reveals if main.js already ran
    if (window.SPS && typeof window.SPS.observeReveals === "function") {
      window.SPS.observeReveals(container);
    }
  }

  function setupFilters(root) {
    const grid = root.querySelector("[data-product-grid]");
    const filters = root.querySelectorAll("[data-filter]");
    if (!grid || !filters.length) return;

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        const cat = btn.getAttribute("data-filter") || "all";
        const featuredOnly = grid.getAttribute("data-featured") === "true";
        const limit = grid.getAttribute("data-limit");
        renderProducts(grid, {
          featuredOnly,
          limit: limit ? parseInt(limit, 10) : null,
          category: cat,
        });
      });
    });
  }

  function bindUI() {
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        addToCart(add.getAttribute("data-add"));
        return;
      }
      const remove = e.target.closest("[data-remove]");
      if (remove) {
        removeFromCart(remove.getAttribute("data-remove"));
        return;
      }
      if (e.target.closest("[data-open-cart]")) {
        openCart();
        return;
      }
      if (e.target.closest("[data-close-cart]")) {
        closeCart();
        return;
      }
      if (e.target.closest("[data-checkout]")) {
        checkoutWhatsApp();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart();
    });
  }

  function init() {
    bindUI();
    updateCartBadge();
    renderCartDrawer();

    document.querySelectorAll("[data-product-grid]").forEach((grid) => {
      const featuredOnly = grid.getAttribute("data-featured") === "true";
      const limit = grid.getAttribute("data-limit");
      const category = grid.getAttribute("data-category") || "all";
      renderProducts(grid, {
        featuredOnly,
        limit: limit ? parseInt(limit, 10) : null,
        category,
      });
      const section = grid.closest("section") || document;
      setupFilters(section);
    });
  }

  window.SPS = window.SPS || {};
  window.SPS.products = PRODUCTS;
  window.SPS.formatBRL = formatBRL;
  window.SPS.addToCart = addToCart;
  window.SPS.WA_NUMBER = WA_NUMBER;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
