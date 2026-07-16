/**
 * Super Pet Shop — Avaliações do Google Maps
 *
 * Estratégia:
 * 1) Se houver GOOGLE_PLACES_API_KEY em config.js → busca Place Details ao vivo
 * 2) Senão, tenta cache local assets/data/google-reviews.json
 * 3) Sempre oferece link oficial: maps.app.goo.gl/H5usvqyhv1wdFTNm7
 */

(function () {
  "use strict";

  const cfg = () => window.SPS_CONFIG || {};

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function stars(n) {
    const full = Math.round(Number(n) || 0);
    return "★".repeat(Math.min(5, Math.max(0, full))) + "☆".repeat(Math.max(0, 5 - full));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    const parts = String(name || "G").trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "G";
  }

  function avatarColor(name) {
    let h = 0;
    const s = String(name || "x");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue} 42% 42%)`;
  }

  function setSummary(data) {
    const ratingEl = document.querySelector("[data-google-rating]");
    const starsEl = document.querySelector("[data-google-stars]");
    const countEl = document.querySelector("[data-google-count]");
    if (!ratingEl) return;

    if (data.rating != null) {
      ratingEl.textContent = Number(data.rating).toFixed(1).replace(".", ",");
      if (starsEl) {
        starsEl.textContent = stars(data.rating);
        starsEl.setAttribute("aria-label", `${data.rating} de 5 estrelas no Google`);
      }
      if (countEl) {
        const total = data.userRatingsTotal;
        countEl.textContent =
          total != null
            ? `${total} avaliação${total === 1 ? "" : "ões"} no Google`
            : "Avaliações do Google Maps";
      }
    } else {
      ratingEl.textContent = "Google";
      if (countEl) {
        countEl.textContent = "Veja as avaliações oficiais no Maps";
      }
    }
  }

  function renderReviews(reviews) {
    const grid = document.querySelector("[data-google-reviews-grid]");
    if (!grid) return;

    if (!reviews || !reviews.length) {
      grid.innerHTML = `
        <article class="testimonial-card google-review-empty">
          <p class="stars" aria-hidden="true">★★★★★</p>
          <p class="testimonial-card__quote">
            As avaliações oficiais ficam no nosso perfil do Google Maps.
            Clique em “Ver no Google Maps” para ler o que os tutores estão dizendo.
          </p>
          <footer>
            <strong>Super Pet Shop</strong>
            <span>Dom Aquino · Cuiabá-MT</span>
          </footer>
        </article>
        <article class="testimonial-card google-review-empty">
          <p class="testimonial-card__quote">
            Sua opinião também ajuda outras famílias a escolherem com confiança.
            Avalie a gente depois do atendimento!
          </p>
          <footer>
            <a class="service-card__link" href="https://search.google.com/local/writereview?placeid=${encodeURIComponent(
              cfg().PLACE_ID || ""
            )}" target="_blank" rel="noopener noreferrer">Escrever avaliação no Google →</a>
          </footer>
        </article>`;
      return;
    }

    grid.innerHTML = reviews
      .slice(0, 6)
      .map((r) => {
        const name = r.author_name || r.author || "Cliente Google";
        const rating = r.rating != null ? r.rating : 5;
        const text = r.text || r.comment || "";
        const time = r.relative_time_description || r.time || "";
        const photo = r.profile_photo_url || "";
        const avatar = photo
          ? `<img src="${escapeHtml(photo)}" alt="" width="64" height="64" loading="lazy" />`
          : `<span class="google-avatar" style="background:${avatarColor(name)}" aria-hidden="true">${escapeHtml(
              initials(name)
            )}</span>`;

        return `
          <article class="testimonial-card reveal is-visible">
            <div class="testimonial-card__heads">
              ${avatar}
              <span class="google-badge" title="Avaliação do Google">Google</span>
            </div>
            <p class="stars" aria-label="${rating} de 5 estrelas">${stars(rating)}</p>
            <p class="testimonial-card__quote">“${escapeHtml(text)}”</p>
            <footer>
              <strong>${escapeHtml(name)}</strong>
              <span>${escapeHtml(time || "via Google Maps")}</span>
            </footer>
          </article>`;
      })
      .join("");
  }

  function setStatus(msg, isError) {
    const el = document.querySelector("[data-google-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-error", Boolean(isError));
  }

  async function fetchLivePlaces(apiKey, placeId) {
    // Places API (New) text — usamos a REST clássica Place Details (ainda amplamente usada)
    const fields = "name,rating,user_ratings_total,reviews,url,formatted_address";
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json?" +
      new URLSearchParams({
        place_id: placeId,
        fields,
        language: "pt-BR",
        reviews_sort: "newest",
        key: apiKey,
      }).toString();

    // Browser CORS: Google Places Details JSON não permite chamada direta do browser.
    // Usamos o proxy oficial via Maps JS Places library se disponível; senão falha e cai no cache.
    // Fallback: Places API via JSONP não existe. Por isso preferimos Maps JS.
    throw new Error("browser-cors");
  }

  function loadPlacesLibrary(apiKey) {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve(window.google.maps.places);
        return;
      }
      const existing = document.querySelector("script[data-sps-maps]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google.maps.places));
        existing.addEventListener("error", reject);
        return;
      }
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        apiKey
      )}&libraries=places&language=pt-BR`;
      s.async = true;
      s.defer = true;
      s.dataset.spsMaps = "1";
      s.onload = () => resolve(window.google.maps.places);
      s.onerror = () => reject(new Error("maps-js-load-failed"));
      document.head.appendChild(s);
    });
  }

  function fetchViaMapsJS(apiKey, placeId) {
    return loadPlacesLibrary(apiKey).then(
      () =>
        new Promise((resolve, reject) => {
          const service = new google.maps.places.PlacesService(document.createElement("div"));
          service.getDetails(
            {
              placeId,
              fields: ["name", "rating", "user_ratings_total", "reviews", "url", "formatted_address"],
              language: "pt-BR",
            },
            (place, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
                reject(new Error(String(status)));
                return;
              }
              resolve({
                name: place.name,
                rating: place.rating,
                userRatingsTotal: place.user_ratings_total,
                mapsUrl: place.url || cfg().MAPS_URL,
                reviews: (place.reviews || []).map((r) => ({
                  author_name: r.author_name,
                  rating: r.rating,
                  text: r.text,
                  relative_time_description: r.relative_time_description,
                  profile_photo_url: r.profile_photo_url,
                })),
              });
            }
          );
        })
    );
  }

  async function fetchCache() {
    const url = cfg().REVIEWS_CACHE_URL || "assets/data/google-reviews.json";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("cache-failed");
    return res.json();
  }

  async function init() {
    const root = document.querySelector("[data-google-reviews]");
    if (!root) return;

    const placeId = cfg().PLACE_ID || "ChIJB5fMaEaxnZMRYwx2RcDDMhE";
    const apiKey = (cfg().GOOGLE_PLACES_API_KEY || "").trim();

    try {
      if (apiKey) {
        setStatus("Buscando avaliações no Google…");
        const live = await fetchViaMapsJS(apiKey, placeId);
        setSummary(live);
        renderReviews(live.reviews);
        setStatus(
          live.reviews && live.reviews.length
            ? "Avaliações carregadas ao vivo do Google Maps."
            : "Perfil encontrado. Abra o Google Maps para ler todos os comentários."
        );
        return;
      }
    } catch (e) {
      console.warn("[SPS] Places live failed:", e);
    }

    try {
      const cache = await fetchCache();
      setSummary({
        rating: cache.rating,
        userRatingsTotal: cache.userRatingsTotal,
      });
      renderReviews(cache.reviews || []);
      if (cache.reviews && cache.reviews.length) {
        setStatus("Exibindo avaliações do Google (cache local).");
      } else {
        setStatus(
          "Para carregar os textos ao vivo, adicione a GOOGLE_PLACES_API_KEY em assets/js/config.js ou rode o script de atualização. Enquanto isso, use o botão do Google Maps."
        );
      }
    } catch (e) {
      setSummary({});
      renderReviews([]);
      setStatus("Não foi possível carregar o cache. Veja as avaliações no Google Maps.", true);
    }
  }

  ready(init);
})();
