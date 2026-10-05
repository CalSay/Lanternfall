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
    base = "https://store.steampowered.com/appreviews/%s?json=1&language=english&filter=all&num_per_page=100&purchase_type=all&cursor=" % appid
    out = {"summary": None, "pos": [], "neg": []}
    for kind in ("positive", "negative"):
        cur, seen = "*", 0
        for _ in range(3):
            d = get(base.replace("filter=all", "filter=all") + urllib.parse.quote(cur) + "&review_type=" + kind)
            if "_error" in d or not d.get("reviews"): break
            if not out["summary"]: out["summary"] = d.get("query_summary")
            for r in d["reviews"]:
                out["pos" if kind == "positive" else "neg"].append({
                    "votes_up": r["votes_up"], "hours": round(r["author"].get("playtime_forever", 0) / 60),
                    "text": r["review"][:900]})
            cur = d.get("cursor", cur)
    for k in ("pos", "neg"):
        out[k].sort(key=lambda r: -r["votes_up"])
    out["pos"] = out["pos"][:25]
    long_neg = [r for r in out["neg"] if r["hours"] >= 50][:25]
    out["neg"] = out["neg"][:25]
    out["neg_longplay_50h"] = long_neg
    return out

def apple(appid, country="us"):
    revs = []
    for sort in ("mosthelpful", "mostrecent"):
        for p in range(1, 6):
            d = get("https://itunes.apple.com/%s/rss/customerreviews/page=%d/id=%s/sortby=%s/json" % (country, p, appid, sort))
            ents = d.get("feed", {}).get("entry", []) if isinstance(d, dict) else []
            if not ents: break
            for e in ents:
                if "im:rating" not in e: continue
                revs.append({"sort": sort, "stars": int(e["im:rating"]["label"]), "title": e["title"]["label"],
                             "text": e["content"]["label"][:900], "votes": int(e.get("im:voteSum", {}).get("label", 0))})
    seen, u = set(), []
    for r in revs:
        k = (r["title"], r["text"][:60])
        if k not in seen: seen.add(k); u.append(r)
    return {"n": len(u), "reviews": u}

def itunes_meta(appid):
    d = get("https://itunes.apple.com/lookup?id=%s&country=us" % appid)
    r = (d.get("results") or [{}])[0]
    return {"name": r.get("trackName"), "rating": r.get("averageUserRating"), "count": r.get("userRatingCount"),
            "genre": r.get("primaryGenreName")}

if __name__ == "__main__":
    corpus = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    for g in corpus:
        res = {"name": g["name"], "slug": g["slug"], "fetched": time.strftime("%Y-%m-%d")}
        if g.get("steam"): res["steam"] = steam(g["steam"])
        if g.get("ios"): res["ios_meta"] = itunes_meta(g["ios"]); res["apple"] = apple(g["ios"])
        json.dump(res, open(os.path.join(outdir, g["slug"] + ".json"), "w"), indent=1)
        print(g["slug"], "steam" in res and len(res["steam"]["pos"]), "apple" in res and res["apple"]["n"], flush=True)
