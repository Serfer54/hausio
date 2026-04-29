"""Submit Hausio URLs to IndexNow (Bing + Yandex + Seznam).

Usage:
    python indexnow_submit.py                 # submit default URL list
    python indexnow_submit.py url1 url2 ...   # submit specific URLs

Run after every meaningful content update — Bing usually crawls within
hours, which feeds ChatGPT and Copilot.

Note: Google does NOT support IndexNow. For Google, use Search Console
"Request Indexing" manually (~10 URLs/day limit).
"""
import json
import ssl
import sys
import urllib.error
import urllib.request

KEY = "f5640575a87d789a721fde8abed45477"
HOST = "hausio.co.uk"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

DEFAULT_URLS = [
    f"https://{HOST}/",
    f"https://{HOST}/cleaning-london.html",
    f"https://{HOST}/removals-london.html",
    f"https://{HOST}/handyman-london.html",
    f"https://{HOST}/areas/camden.html",
    f"https://{HOST}/areas/hackney.html",
    f"https://{HOST}/areas/islington.html",
    f"https://{HOST}/areas/wandsworth.html",
    f"https://{HOST}/areas/westminster.html",
    f"https://{HOST}/book.html",
    f"https://{HOST}/sitemap.xml",
    f"https://{HOST}/privacy.html",
]

ENDPOINTS = [
    "https://api.indexnow.org/IndexNow",
    "https://www.bing.com/IndexNow",
    "https://yandex.com/indexnow",
]


def submit(urls):
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    data = json.dumps(payload).encode("utf-8")
    ctx = ssl.create_default_context()

    print(f"Submitting {len(urls)} URLs to {len(ENDPOINTS)} endpoints…")
    for endpoint in ENDPOINTS:
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
        try:
            with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                print(f"  {endpoint}: {r.status} {r.reason}")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "ignore")[:200]
            print(f"  {endpoint}: HTTP {e.code} {e.reason} | {body}")
        except Exception as e:  # noqa: BLE001
            print(f"  {endpoint}: ERROR {type(e).__name__}: {e}")


if __name__ == "__main__":
    urls = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_URLS
    submit(urls)
