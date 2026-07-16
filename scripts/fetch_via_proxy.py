# -*- coding: utf-8 -*-
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
MAPS = (
    "https://www.google.com/maps/place/Super+Pet+Shop/"
    "@-15.6063632,-56.0956957,17z/data=!4m8!3m7!1s0x939db14668cc9707:0x1132c3c045760c63"
    "!8m2!3d-15.6063632!4d-56.0956957!9m1!1b1!16s%2Fg%2F11jqh5830k?hl=pt-BR"
)


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0", "Accept": "*/*"},
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", errors="replace")


def main():
    proxies = [
        "https://api.allorigins.win/raw?url=",
        "https://corsproxy.io/?",
    ]
    data = ""
    for p in proxies:
        try:
            target = p + urllib.parse.quote(MAPS, safe="")
            print("try", p)
            data = fetch(target)
            print("len", len(data))
            if len(data) > 5000:
                break
        except Exception as e:
            print("err", e)

    if not data:
        print("no data")
        return

    (OUT / "proxy-maps.html").write_text(data[:400000], encoding="utf-8")

    # rating like 4,8 or 4.8
    ratings = re.findall(r"(?:Avalia[cç][aã]o|rating)[^0-9]{0,40}([0-5][.,][0-9])", data, re.I)
    print("ratings", ratings[:10])

    # author names near star counts - common maps pattern
    # "Author Name", .... ,5, ...
    authors = re.findall(r'"([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^"]{2,40})","http', data)
    print("authors sample", authors[:15])

    # Review bodies often appear as: null,"long text here",null,[
    bodies = re.findall(r'null,"([^"]{50,800})",null,\[', data)
    print("bodies", len(bodies))
    for b in bodies[:12]:
        print("---", b[:200])

    # Another pattern
    bodies2 = re.findall(r'\],\["([^"]{50,800})"\]', data)
    print("bodies2", len(bodies2))
    for b in bodies2[:8]:
        print("b2---", b[:200])

    # Save potential reviews
    reviews = []
    for b in bodies[:20]:
        reviews.append({"text": b, "source": "google_maps"})
    (OUT / "assets" / "data" / "google-reviews.json").parent.mkdir(parents=True, exist_ok=True)
    (OUT / "assets" / "data" / "google-reviews.json").write_text(
        json.dumps(
            {
                "placeId": "ChIJB5fMaEaxnZMRYwx2RcDDMhE",
                "mapsUrl": "https://maps.app.goo.gl/H5usvqyhv1wdFTNm7",
                "reviews": reviews,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print("saved", len(reviews))


if __name__ == "__main__":
    main()
