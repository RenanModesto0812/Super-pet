# -*- coding: utf-8 -*-
import re
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def get(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept-Language": "pt-BR,pt;q=0.9",
            "Referer": "https://www.google.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def main():
    url = (
        "https://www.google.com/maps/rpc/listugcposts?authuser=0&hl=pt-BR&gl=br&pb="
        "!1m6!1s0x939db14668cc9707%3A0x1132c3c045760c63!6m4!4m1!1e1!4m1!1e3!2m2!1i10!2s!"
        "5m2!1s!7e81!8m9!2b1!3b1!5b1!7b1!12m4!1b1!2b1!4m1!1e1!11m4!1e3!2e1!6m1!1b1!13m1!1e2"
    )
    try:
        data = get(url)
        print("rpc len", len(data), "head", repr(data[:200]))
        (OUT / "raw-rpc2.txt").write_text(data, encoding="utf-8")
    except Exception as e:
        print("rpc err", e)

    url2 = "https://www.google.com/search?q=Super+Pet+Shop+Dom+Aquino+Cuiab%C3%A1&hl=pt-BR"
    try:
        html = get(url2)
        (OUT / "google-search.html").write_text(html, encoding="utf-8")
        print("search len", len(html))
        for m in re.finditer(r"([0-9],[0-9])\s*\(([0-9\.]+)\)", html):
            print("rating", m.group(0))
        # Review snippets often in these patterns
        for m in re.finditer(
            r'aria-label="([^"]{20,400})"', html
        ):
            t = m.group(1)
            if any(
                k in t.lower()
                for k in ["estrela", "avalia", "banho", "tosa", "pet", "loja"]
            ):
                print("aria:", t[:220])
        for m in re.finditer(r"<span[^>]*>([^<]{30,400})</span>", html):
            t = m.group(1)
            if any(
                k in t.lower()
                for k in [
                    "banho",
                    "tosa",
                    "atend",
                    "ótimo",
                    "otimo",
                    "excel",
                    "recom",
                    "pet shop",
                ]
            ):
                print("span:", t[:220])
        # JSON-LD
        for m in re.finditer(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ):
            print("ldjson", m.group(1)[:400])
    except Exception as e:
        print("search err", e)

    # Solutudo / Cybo pages might mirror reviews
    for name, u in [
        (
            "solutudo",
            "https://www.solutudo.com.br/empresas/mt/cuiaba/pet-shop/super-pet-shop-22558349",
        ),
        (
            "cybo",
            "https://www.cybo.com/BR-biz/super-pet-shop_10",
        ),
    ]:
        try:
            h = get(u)
            (OUT / f"raw-{name}.html").write_text(h[:150000], encoding="utf-8")
            print(name, "len", len(h))
            for m in re.finditer(
                r"(?:review|comentario|depoimento|avalia)[^<]{0,40}</[^>]+>\s*<[^>]+>([^<]{40,400})",
                h,
                re.I,
            ):
                print(name, ":", m.group(1)[:200])
        except Exception as e:
            print(name, "err", e)


if __name__ == "__main__":
    main()
