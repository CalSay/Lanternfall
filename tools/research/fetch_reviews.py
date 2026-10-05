#!/usr/bin/env python3
"""Fetch review data for the Lanternfall fun library. Steam appreviews feed + Apple customer reviews RSS.
Usage: fetch_reviews.py corpus.json outdir   (stdlib only; writes <outdir>/<slug>.json per game)"""
import json, sys, time, urllib.parse, urllib.request, os

UA = {"User-Agent": "Mozilla/5.0 (research bot; Lanternfall fun library)"}

def get(url):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.loads(r.read())
        except Exception as e:
            err = str(e); time.sleep(2 * (i + 1))
    return {"_error": err}

def steam(appid):
    """One page of 100 per sentiment. filter=all uses sliding helpfulness windows and does not paginate reliably
    (Steam docs), so we read one page per sentiment over the widest window the API allows (day_range=365: the most helpful reviews
    of the last year) and deduplicate by recommendationid."""
    base = "https://store.steampowered.com/appreviews/%s?json=1&language=english&filter=all&num_per_page=100&purchase_type=all&day_range=365&cursor=*&review_type=" % appid
    out = {"summary": None, "pos": [], "neg": []}
    for kind, key in (("positive", "pos"), ("negative", "neg")):
        d = get(base + kind)
        if "_error" in d: raise RuntimeError("steam %s %s feed failed: %s" % (appid, kind, d["_error"]))
        if d.get("success") != 1: raise RuntimeError("steam %s %s feed: success=%r" % (appid, kind, d.get("success")))
        if not out["summary"]: out["summary"] = d.get("query_summary")
        seen = set()
        for r in d.get("reviews", []):
            if r["recommendationid"] in seen: continue
            seen.add(r["recommendationid"])
            out[key].append({"id": r["recommendationid"], "votes_up": r["votes_up"],
                             "hours": round(r["author"].get("playtime_forever", 0) / 60), "text": r["review"][:900]})
        out[key].sort(key=lambda r: -r["votes_up"])
    if not out["pos"] and not out["neg"]:
        raise RuntimeError("steam %s returned no reviews in the last 365 days (wrong appid or empty feed)" % appid)
    out["pos"] = out["pos"][:25]
    out["neg_longplay_50h"] = [r for r in out["neg"] if r["hours"] >= 50][:25]
    out["neg"] = out["neg"][:25]
    return out

def apple(appid, country="us"):
    revs, empty_first = [], []
    for sort in ("mosthelpful", "mostrecent"):
        for p in range(1, 6):
            d = get("https://itunes.apple.com/%s/rss/customerreviews/page=%d/id=%s/sortby=%s/json" % (country, p, appid, sort))
            if "_error" in d:  # past the end of a feed Apple returns 200 with no entries, so an error is always real
                raise RuntimeError("apple %s page %d %s feed failed: %s" % (appid, p, sort, d["_error"]))
            ents = d.get("feed", {}).get("entry", []) if isinstance(d, dict) else []
            if isinstance(ents, dict): ents = [ents]  # a page with one review comes back as an object, not a list
            if not ents:
                if p == 1: empty_first.append(sort)
                break
            for e in ents:
                if "im:rating" not in e: continue
                revs.append({"sort": sort, "stars": int(e["im:rating"]["label"]), "title": e["title"]["label"],
                             "text": e["content"]["label"][:900], "votes": int(e.get("im:voteSum", {}).get("label", 0))})
    seen, u = set(), []
    for r in revs:
        k = (r["title"], r["text"][:60])
        if k not in seen: seen.add(k); u.append(r)
    return {"n": len(u), "reviews": u, "empty_first_page": empty_first}

def itunes_meta(appid):
    d = get("https://itunes.apple.com/lookup?id=%s&country=us" % appid)
    if "_error" in d: raise RuntimeError("itunes lookup %s failed: %s" % (appid, d["_error"]))
    if not d.get("results"): raise RuntimeError("itunes lookup %s returned no app (wrong id or not sold in the US store)" % appid)
    r = d["results"][0]
    return {"name": r.get("trackName"), "rating": r.get("averageUserRating"), "count": r.get("userRatingCount"),
            "genre": r.get("primaryGenreName")}

if __name__ == "__main__":
    corpus = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    failed = []
    for g in corpus:
        try:
            res = {"name": g["name"], "slug": g["slug"], "fetched": time.strftime("%Y-%m-%d")}
            if g.get("steam"): res["steam"] = steam(g["steam"])
            if g.get("ios"):
                res["ios_meta"] = itunes_meta(g["ios"]); res["apple"] = apple(g["ios"])
                if res["apple"]["empty_first_page"] and (res["ios_meta"]["count"] or 0) >= 100:  # an established app has reviews in both sorts
                    raise RuntimeError("apple %s feed returned an empty first page for %s but the store lists %s ratings" % (
                        "+".join(res["apple"]["empty_first_page"]), g["slug"], res["ios_meta"]["count"]))
        except Exception as e:  # keep the previous file for this game; report and exit non-zero at the end
            failed.append(g["slug"]); print("FAILED", g["slug"], e, file=sys.stderr, flush=True); continue
        json.dump(res, open(os.path.join(outdir, g["slug"] + ".json"), "w"), indent=1)
        print(g["slug"], "steam" in res and len(res["steam"]["pos"]), "apple" in res and res["apple"]["n"], flush=True)
    if failed:
        print("%d game(s) failed, old data kept: %s" % (len(failed), ", ".join(failed)), file=sys.stderr); sys.exit(1)
