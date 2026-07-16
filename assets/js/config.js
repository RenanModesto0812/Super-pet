/**
 * Super Pet Shop — Configuração pública do site
 *
 * GOOGLE_PLACES_API_KEY (opcional):
 *   Chave da Places API (Google Cloud) com Places Details habilitado.
 *   Com a chave, as avaliações são carregadas ao vivo do Google.
 *   Sem a chave, usamos o cache local + link oficial do Maps.
 */
window.SPS_CONFIG = {
  WA_NUMBER: "5565993043088",
  BUSINESS_NAME: "Super Pet Shop",
  PLACE_ID: "ChIJB5fMaEaxnZMRYwx2RcDDMhE",
  MAPS_URL: "https://maps.app.goo.gl/H5usvqyhv1wdFTNm7",
  GOOGLE_PLACES_API_KEY: "", // cole sua chave aqui para avaliações ao vivo
  REVIEWS_CACHE_URL: "assets/data/google-reviews.json",
};
