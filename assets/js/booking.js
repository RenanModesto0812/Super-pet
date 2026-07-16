/**
 * Super Pet Shop — Formulário de agendamento → WhatsApp
 */

(function () {
  "use strict";

  const WA = () => (window.SPS_CONFIG && window.SPS_CONFIG.WA_NUMBER) || "5565993043088";
  const BRAND = () => (window.SPS_CONFIG && window.SPS_CONFIG.BUSINESS_NAME) || "Super Pet Shop";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
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

  function setError(field, msg) {
    const wrap = field.closest(".form-field");
    if (!wrap) return;
    const err = wrap.querySelector(".error");
    if (msg) {
      wrap.classList.add("is-invalid");
      if (err) err.textContent = msg;
      field.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("is-invalid");
      if (err) err.textContent = "";
      field.setAttribute("aria-invalid", "false");
    }
  }

  function validate(field) {
    const name = field.name;
    const v = String(field.value || "").trim();

    if (field.required && !v) return "Preencha este campo.";

    if (name === "name" && v && v.length < 2) return "Informe ao menos 2 caracteres.";
    if (name === "pet" && v && v.length < 1) return "Informe o nome do pet.";
    if (name === "phone" && v) {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) return "Telefone com DDD: 10 ou 11 dígitos.";
    }
    if (name === "date" && v) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const picked = new Date(v + "T00:00:00");
      if (Number.isNaN(picked.getTime())) return "Data inválida.";
      if (picked < today) return "Escolha uma data a partir de hoje.";
      // Domingo fechado
      if (picked.getDay() === 0) return "Não atendemos aos domingos. Escolha outro dia.";
    }
    return "";
  }

  function formatDateBR(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function buildMessage(data) {
    const lines = [
      `Olá, ${BRAND()}! Quero *agendar* um horário:`,
      ``,
      `*Tutor:* ${data.name}`,
      `*WhatsApp:* ${data.phone}`,
      `*Pet:* ${data.pet} (${data.species})`,
      `*Porte:* ${data.size || "Não informado"}`,
      `*Serviço:* ${data.service}`,
      `*Data preferida:* ${formatDateBR(data.date)}`,
      `*Período:* ${data.time}`,
    ];
    if (data.notes) {
      lines.push(``, `*Observações:*`, data.notes);
    }
    lines.push(``, `Podem me confirmar disponibilidade, por favor?`);
    return lines.join("\n");
  }

  function setupMinDate(input) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    input.min = `${yyyy}-${mm}-${dd}`;
  }

  function prefillService(service) {
    const select = document.querySelector("#bk-service");
    if (!select || !service) return;
    const opts = Array.from(select.options);
    const match = opts.find((o) => o.value === service || o.value.toLowerCase() === service.toLowerCase());
    if (match) select.value = match.value;
  }

  function setupBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;

    const fields = form.querySelectorAll("input, select, textarea");
    const phone = form.querySelector("#bk-phone");
    const date = form.querySelector("#bk-date");
    const status = document.getElementById("booking-status");

    if (date) setupMinDate(date);

    // Deep-link / botões de serviço: #agendar + data-book-service
    document.querySelectorAll("[data-book-service]").forEach((el) => {
      el.addEventListener("click", () => {
        prefillService(el.getAttribute("data-book-service"));
      });
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("service")) prefillService(params.get("service"));
    if (window.location.hash === "#agendar" && params.get("svc")) {
      prefillService(params.get("svc"));
    }

    fields.forEach((field) => {
      field.addEventListener("blur", () => setError(field, validate(field)));
      field.addEventListener("input", () => {
        if (field === phone) maskPhone(field);
        if (field.closest(".form-field")?.classList.contains("is-invalid")) {
          setError(field, validate(field));
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      let firstInvalid = null;

      fields.forEach((field) => {
        const msg = validate(field);
        setError(field, msg);
        if (msg) {
          ok = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!ok) {
        firstInvalid?.focus();
        if (status) status.textContent = "Confira os campos destacados.";
        return;
      }

      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        pet: form.pet.value.trim(),
        species: form.species.value,
        size: form.size.value,
        service: form.service.value,
        date: form.date.value,
        time: form.time.value,
        notes: form.notes.value.trim(),
      };

      const msg = buildMessage(data);
      const url = `https://wa.me/${WA()}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      if (status) {
        status.textContent = "WhatsApp aberto com seu agendamento. É só tocar em enviar!";
      }

      // Mantém os dados do pet para reenvio fácil; limpa só o que muda
      form.notes.value = "";
    });
  }

  ready(setupBookingForm);
})();
