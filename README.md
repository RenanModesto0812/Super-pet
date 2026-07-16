# Super Pet Shop

Landing page premium do Super Pet Shop — Dom Aquino, Cuiabá-MT.

## Dados da loja

- **Endereço:** Av. Dom Bosco, Nº 312 — Dom Aquino, Cuiabá, MT · CEP 78015-180
- **WhatsApp:** (65) 99304-3088 (`5565993043088`)
- **Mapa:** [Google Maps](https://maps.app.goo.gl/q877E9EMePEubVwVA)
- **Horário:** Seg–Sex 08h–18h · Sáb 08h–14h · Dom fechado

## Cores oficiais da marca

| Cor | Hex | Uso |
|-----|-----|-----|
| Amarelo Ouro | `#F4C430` | Cor principal, destaques, botões CTA |
| Azul Escuro | `#1F5FBF` | Texto e elementos principais |
| Branco | `#FFFFFF` | Fundo e contraste |
| Azul Marinho | `#163A70` | Sombras, rodapé e detalhes |

## Agendamento

Seção `#agendar` com formulário completo. O envio monta a mensagem e abre o WhatsApp da loja `(65) 99304-3088`.

## Avaliações do Google Maps

Perfil oficial: https://maps.app.goo.gl/H5usvqyhv1wdFTNm7  
Place ID: `ChIJB5fMaEaxnZMRYwx2RcDDMhE`

Para carregar os **textos das avaliações ao vivo** no site:

1. Crie uma chave no [Google Cloud](https://console.cloud.google.com/) com **Places API** ativa  
2. Cole em `assets/js/config.js` → `GOOGLE_PLACES_API_KEY`  
3. Ou rode o script (sem abrir no browser):

```bash
set GOOGLE_PLACES_API_KEY=sua_chave
python scripts/update_google_reviews.py
```

Isso grava `assets/data/google-reviews.json` com nota, total e comentários oficiais.

## Como abrir

Abra `index.html` no navegador ou (recomendado para o fetch do JSON):

```bash
python -m http.server 8080
```

## Arquivos

- `index.html` — landing completa
- `assets/css/styles.css` — design system
- `assets/js/main.js` — interações
- `assets/js/booking.js` — agendamento
- `assets/js/google-reviews.js` — depoimentos Google
- `assets/img/` — logo, favicon e imagens da marca
