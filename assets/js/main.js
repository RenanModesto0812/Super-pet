/**
 * Super Pet Shop — Main: scroll reveal, formulário de contato, utilitários
 */

(function () {
  "use strict";

  const WA_NUMBER = "5565993043088";
  const CONTACT_EMAIL = "contato@superpetshop.com.br";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  let revealObserver = null;

  function observeReveals(root) {
    const nodes = (root || document).querySelectorAll(".reveal:not(.is-visible)");
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
    }

    nodes.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Contact form validation + real submit path ---------- */
  function validateField(field, value) {
    const name = field.name;
    const v = value.trim();

    if (field.required && !v) {
      return "Preencha este campo.";
    }

    if (name === "name" && v) {
      if (v.length < 2) return "Informe ao menos 2 caracteres.";
      if (!/^[A-Za-zÀ-ÿ\s'.-]+$/.test(v)) return "Use apenas letras e espaços.";
    }

    if (name === "email" && v) {
      // RFC-lite: local@domain.tld
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return "E-mail inválido. Ex: nome@email.com";
      }
    }

    if (name === "phone" && v) {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) {
        return "Telefone com DDD: 10 ou 11 dígitos.";
      }
    }

    if (name === "message" && v) {
      if (v.length < 10) return "Mensagem muito curta (mín. 10 caracteres).";
      if (v.length > 1200) return "Mensagem muito longa (máx. 1200).";
    }

    if (name === "subject" && field.tagName === "SELECT" && field.required && !v) {
      return "Selecione um assunto.";
    }

    return "";
  }

  function setFieldError(wrapper, message) {
    const errorEl = wrapper.querySelector(".error");
    const input = wrapper.querySelector("input, select, textarea");
    if (message) {
      wrapper.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = message;
      if (input) input.setAttribute("aria-invalid", "true");
    } else {
      wrapper.classList.remove("is-invalid");
      if (errorEl) errorEl.textContent = "";
      if (input) input.setAttribute("aria-invalid", "false");
    }
  }

  function maskPhone(input) {
    let d = input.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) {
      input.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    } else if (d.length > 2) {
      input.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length > 0) {
      input.value = `(${d}`;
    } else {
      input.value = "";
    }
  }

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const fields = form.querySelectorAll(".form-field");

    fields.forEach((wrapper) => {
      const input = wrapper.querySelector("input, select, textarea");
      if (!input) return;

      const run = () => {
        const msg = validateField(input, input.value);
        setFieldError(wrapper, msg);
      };

      input.addEventListener("blur", run);
      input.addEventListener("input", () => {
        if (input.name === "phone") maskPhone(input);
        if (wrapper.classList.contains("is-invalid")) run();
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      let ok = true;

      fields.forEach((wrapper) => {
        const input = wrapper.querySelector("input, select, textarea");
        if (!input) return;
        const msg = validateField(input, input.value);
        setFieldError(wrapper, msg);
        if (msg) {
          ok = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!ok) {
        firstInvalid?.focus();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const subject = String(data.get("subject") || "").trim();
      const message = String(data.get("message") || "").trim();
      const channel = String(data.get("channel") || "whatsapp");

      /*
       * Sem backend de e-mail neste front estático.
       * Dois canais reais:
       * 1) WhatsApp (preferencial da loja) — abre conversa com texto montado
       * 2) mailto: — abre o cliente de e-mail do usuário
       * Nunca usamos alert('Enviado!') fake.
       */
      const body = [
        `Olá, Super Pet Shop!`,
        ``,
        `Nome: ${name}`,
        `E-mail: ${email}`,
        `Telefone: ${phone}`,
        `Assunto: ${subject}`,
        ``,
        message,
      ].join("\n");

      if (channel === "email") {
        const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
          `[Site] ${subject} — ${name}`
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
      } else {
        const waText = body + `\n\n(Enviado pelo formulário do site)`;
        window.open(
          `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      form.reset();
      fields.forEach((w) => setFieldError(w, ""));
      const status = document.getElementById("form-status");
      if (status) {
        status.textContent =
          channel === "email"
            ? "Abrimos seu app de e-mail com a mensagem pronta. É só enviar."
            : "Abrimos o WhatsApp com sua mensagem. É só tocar em enviar.";
      }
    });
  }

  /* ---------- Schedule CTA → WhatsApp ---------- */
  function setupScheduleLinks() {
    document.querySelectorAll("[data-schedule]").forEach((el) => {
      const service = el.getAttribute("data-schedule") || "banho e tosa";
      const msg = `Olá, Super Pet Shop! Quero agendar *${service}*. Podem me passar horários disponíveis?`;
      if (el.tagName === "A") {
        el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      } else {
        el.addEventListener("click", () => {
          window.open(
            `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
            "_blank",
            "noopener,noreferrer"
          );
        });
      }
    });
  }

  /* ---------- Current year ---------- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  ready(() => {
    observeReveals(document);
    setupContactForm();
    setupScheduleLinks();
    setYear();
  });

  window.SPS = window.SPS || {};
  window.SPS.observeReveals = observeReveals;
  window.SPS.WA_NUMBER = WA_NUMBER;
})();
