# -*- coding: utf-8 -*-
"""
Atualiza assets/data/google-reviews.json com avaliações oficiais do Google Places.

Uso:
  set GOOGLE_PLACES_API_KEY=sua_chave
  python scripts/update_google_reviews.py

A chave precisa ter a Places API habilitada no Google Cloud.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PLACE_ID = "ChIJB5fMaEaxnZMRYwx2RcDDMhE"
MAPS_URL = "https://maps.app.goo.gl/H5usvqyhv1wdFTNm7"
OUT = Path(__file__).resolve().parents[1] / "assets" / "data" / "google-reviews.json"


def main() -> int:
    key = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
    if not key:
        print("Defina GOOGLE_PLACES_API_KEY no ambiente.")
        print("Ex.: set GOOGLE_PLACES_API_KEY=xxxx && python scripts/update_google_reviews.py")
        return 1

    params = {
        "place_id": PLACE_ID,
        "fields": "name,rating,user_ratings_total,reviews,url,formatted_address",
        "language": "pt-BR",
        "reviews_sort": "newest",
        "key": key,
    }
    url = "https://maps.googleapis.com/maps/api/place/details/json?" + urllib.parse.urlencode(
        params
    )
    req = urllib.request.Request(url, headers={"User-Agent": "SuperPetShop-Reviews/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    if payload.get("status") != "OK":
        print("Erro da API:", payload.get("status"), payload.get("error_message"))
        return 2

    result = payload["result"]
    reviews = []
    for r in result.get("reviews") or []:
        reviews.append(
            {
                "author_name": r.get("author_name"),
                "rating": r.get("rating"),
                "text": r.get("text"),
                "relative_time_description": r.get("relative_time_description"),
                "profile_photo_url": r.get("profile_photo_url"),
                "time": r.get("time"),
            }
        )

    data = {
        "placeId": PLACE_ID,
        "mapsUrl": result.get("url") or MAPS_URL,
        "name": result.get("name") or "Super Pet Shop",
        "address": result.get("formatted_address"),
        "rating": result.get("rating"),
        "userRatingsTotal": result.get("user_ratings_total"),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "reviews": reviews,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK — {len(reviews)} reviews salvas em {OUT}")
    print(f"Nota: {data.get('rating')} ({data.get('userRatingsTotal')} avaliações)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
