# -*- coding: utf-8 -*-
"""Fetch Super Pet Shop Google Maps reviews (best-effort, unofficial)."""
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
PLACE_HEX = "0x939db14668cc9707:0x1132c3c045760c63"
PLACE_ID = "ChIJB5fMaEaxnZMRYwx2RcDDMhE"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def get(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
            "Accept": "*/*",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def try_listugcposts() -> str:
    # Unofficial Google Maps RPC for reviews
    pb = (
        f"!1m6!1s{PLACE_HEX}!6m4!4m1!1e1!4m1!1e3!2m2!1i20!2s!"
        "5m2!1sABC!7e81!8m5!1b1!2b1!3b1!5b1!7b1!11m0!13m1!1e1"
    )
    url = (
        "https://www.google.com/maps/rpc/listugcposts?"
        + urllib.parse.urlencode({"authuser": "0", "hl": "pt-BR", "gl": "br", "pb": pb})
    )
    print("listugcposts", url[:100])
    return get(url)


def try_place_page() -> str:
    url = f"https://www.google.com/maps/place/?q=place_id:{PLACE_ID}&hl=pt-BR"
    return get(url)


def extract_review_like(text: str):
    # Common structure in maps protobuf dumps: rating + author + text
    candidates = []
    # quoted long strings
    for m in re.finditer(r'"((?:[^"\\]|\\.){20,600})"', text):
        s = m.group(1)
        s = bytes(s, "utf-8").decode("unicode_escape", errors="ignore")
        low = s.lower()
        if any(
            k in low
            for k in [
                "banho",
                "tosa",
                "pet",
                "atend",
                "loja",
                "ótimo",
                "otimo",
                "excel",
                "recom",
                "animal",
                "cachorro",
                "gato",
                "serviço",
                "servico",
                "equipe",
                "preço",
                "preco",
                "qualidade",
                "super",
                "adorei",
                "ruim",
                "péssim",
                "pessimo",
            ]
        ):
            candidates.append(s)
    return candidates


def main():
    results = {"source": "google_maps", "place_id": PLACE_ID, "reviews": [], "raw_samples": []}

    for name, fn in [("listugcposts", try_listugcposts), ("place_page", try_place_page)]:
        try:
            data = fn()
            path = OUT / f"raw-{name}.txt"
            path.write_text(data[:200000], encoding="utf-8")
            print(name, "len", len(data))
            cands = extract_review_like(data)
            print(name, "candidates", len(cands))
            for c in cands[:15]:
                print("---", c[:180].replace("\n", " "))
                results["raw_samples"].append(c[:500])
        except Exception as e:
            print(name, "ERR", e)

    # Also try maps?cid=
    try:
        cid = int("1132c3c045760c63", 16)
        data = get(f"https://www.google.com/maps?cid={cid}&hl=pt-BR")
        (OUT / "raw-cid.txt").write_text(data[:200000], encoding="utf-8")
        cands = extract_review_like(data)
        print("cid candidates", len(cands))
        for c in cands[:15]:
            print("cid---", c[:180].replace("\n", " "))
            results["raw_samples"].append(c[:500])
    except Exception as e:
        print("cid ERR", e)

    (OUT / "reviews-extracted.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("done")


if __name__ == "__main__":
    main()
