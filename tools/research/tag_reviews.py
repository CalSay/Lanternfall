#!/usr/bin/env python3
"""Keyword theme tagger (reproducible, auditable). Reads raw/*.json, writes tags-kw/<slug>.json and tags-kw/_all.json.
A review counts for a theme when a regex matches; quotes are the matching sentence (<=25 words), verbatim."""
import json, glob, re, os, collections, sys
T = {
 'P-offline': r"\b(offline|afk|while (i'?m )?(away|asleep|at work)|idle progress|runs? (in the )?background)\b",
 'P-respect': r"\b(respects? (my|your|the player'?s) time|no (forced|mandatory)|play (at )?(my|your) own pace|short sessions?|few minutes|doesn'?t (force|require)|casual)\b",
 'P-active': r"\b(active (play|gameplay|combat)|not (just )?(an )?idle|skill(ful)?|engaging|actually (play|fun)|mini-?games?|dodge|timing)\b",
 'P-dev': r"\b(devs?|developers?) (are|is|listen|respond|care|update|added|add|actually)|\b(regular|frequent|constant|free) updates?\b|\bupdates? (regularly|often)\b|\bactive (dev|community)\b",
 'P-unlock': r"\b(new (content|areas?|zones?|skills?|unlocks?)|keeps? unlocking|always something new|unlock(s|ing)? (new|more))\b",
 'P-collect': r"\b(collect(ing|ion|ibles?)?|loot|drops?|rare|pets?|achievements?|completionist|log slot|200%)\b",
 'P-goals': r"\b(always (a )?(goal|something to (do|work))|next goal|short[- ]term|long[- ]term goals?|something to work (on|toward))\b",
 'P-depth': r"\b(build(s)? variety|builds?|strateg(y|ies|ic)|meaningful (choices?|decisions?)|min-?max|theor(y)?craft|depth|decisions?)\b",
 'P-fair': r"\b(no pay[- ]to[- ]win|not pay[- ]to[- ]win|fair (monetization|monetisation)|no (microtransactions?|ads)|free to play friendly|generous|one[- ]time (purchase|payment)|worth (the )?(money|price))\b",
 'P-interlock': r"\b(feeds? into|synerg(y|ies)|interlock|everything (is )?(connected|ties)|skills? (help|boost|feed)|crafting .* (needs?|uses?) .*(mining|woodcutting|fishing))\b",
 'P-prestige': r"\b(prestige|ascen(d|sion)|rebirth|reset(s)? (is|are)? ?(fun|rewarding|good)|new run|each run)\b",
 'P-qol': r"\b(quality of life|qol|auto[- ](battle|collect|upgrade|craft|build|sell)|automation|automate[sd]?|intuitive|easy to (use|navigate|understand)|clean (ui|interface)|well[- ]designed (ui|interface))\b",
 'P-calm': r"\b(relax(ing|ed)?|chill|cozy|cosy|zen|unwind|stress[- ]free|peaceful|low[- ]pressure|comfort(ing|able)?)\b",
 'P-art': r"\b(art ?style|graphics|pixel|soundtrack|music|charming|cute|beautiful|visuals?)\b",
 'P-story': r"\b(story|lore|writing|narrative|world[- ]building|characters?|quests?)\b",
 'N-ads': r"\b(ads?|advert(s|isements?)?|video ads?|watch(ing)? (an? )?(ad|video))\b",
 'N-wall': r"\b(wall|hit a wall|stuck|grind(y|ing)?|stall(ed)?|plateau|impossible to progress|can'?t progress|too slow|slow(s|ed)? (to a crawl|down))\b",
 'N-pay': r"\b(pay[- ]?to[- ]?win|p2w|paywall|microtransactions?|pay (real )?money|whale|cash grab|premium currency|gems? (cost|shop))\b",
 'N-dominant': r"\b(only (one )?(viable|build|strategy|meta)|meta(game)?|cookie[- ]cutter|always (the )?best|no (build )?variety|optimal (build|path)|one right way)\b",
 'N-late': r"\b(end ?game|late ?game|nothing (left )?to do|run out of content|boring (after|once)|repetitive|repeat(ing)? the same|empty)\b",
 'N-offline': r"\b(offline (progress|earnings|gains?|rewards?) (is|are|was|were)? ?(bad|low|nerfed|weak|useless|too)|no offline|doesn'?t (work|progress) (while )?offline|only (when|while) (open|the app))\b",
 'N-mobile': r"\b(battery|notifications?|overheat|phone (gets|is) hot|screen (too )?small|tiny buttons?|touch ?screen|always[- ]online|requires? (an )?internet|crash(es|ed)? on (my )?(phone|ipad|ios|android))\b",
 'N-bug': r"\b(bugs?|buggy|glitch(es|y)?|crash(es|ed|ing)?|lost (my )?(save|progress|data)|save(s)? (got )?(wiped|deleted|corrupt)|freez(e|es|ing))\b",
 'N-energy': r"\b(energy|stamina|cooldown|wait (for|timers?)|timers?|come back (in|later)|gem[- ]?speed|speed[- ]?ups?)\b",
 'N-bloat': r"\b(too many (currencies|resources|menus|systems|things)|overwhelming|confusing|cluttered|bloat(ed)?|menu hell|ui is (a )?(mess|cluttered))\b",
 'N-chore': r"\b(daily (quests?|tasks?|login|chores?)|chores?|have to log in|forced to (check|log)|check in (every|constantly)|babysit)\b",
 'N-tutorial': r"\b(no tutorial|tutorial|didn'?t (explain|tell)|confusing at first|learning curve|hard to understand|unclear)\b",
 'N-shallow': r"\b(shallow|mindless|nothing to (decide|choose)|just (tap|click)|no (real )?(choices?|decisions?|strategy)|brain ?dead|simple)\b",
 'N-reset': r"\b(reset(ting)? (is|feels?) (bad|pointless|annoying)|prestige (is|feels?) (bad|pointless|forced|annoying)|forced (prestige|reset))\b",
 'N-pace': r"\b(slow (start|early|beginning|at first)|first (few )?(hours?|levels?) (are|is) slow|boring (at the )?(start|beginning)|early game (is|feels?) (slow|boring|grindy))\b",
 'N-fast': r"\b(too (fast|easy|short)|finished (it )?in|beat it in|ran out of|runs out of|no replay)\b",
 'N-balance': r"\b(balance|unbalanced|op\b|overpowered|nerfed|difficulty spike|spike in difficulty|unfair)\b",
}
RX = {k: re.compile(v, re.I) for k, v in T.items()}
def quote(text, rx):
    for s in re.split(r'(?<=[.!?])\s+|\n+', text):
        if rx.search(s):
            w = s.split()
            if 6 <= len(w) <= 25: return s.strip()
    return None
def reviews(d, with_longplay=False):
    """General sample: Steam top positives and top negatives, plus App Store reviews. The separately pulled 50h+ Steam
    negatives (neg_longplay_50h) are NOT mixed into the general sample; they are returned only when with_longplay=True."""
    out = []
    s = d.get('steam')
    if s:
        for r in s['pos']: out.append(('steam+', r['votes_up'], r['hours'], r['text']))
        for r in s['neg']: out.append(('steam-', r['votes_up'], r['hours'], r['text']))
        if with_longplay:
            for r in s['neg_longplay_50h']: out.append(('steam-lp', r['votes_up'], r['hours'], r['text']))
    a = d.get('apple')
    if a:
        for r in a['reviews']: out.append(('apple%d' % r['stars'], r['votes'], None, r['title'] + '. ' + r['text']))
    return out

if __name__ == '__main__':
    root = sys.argv[1]; os.makedirs(root + '/tags-kw', exist_ok=True); allc = {}
    for f in sorted(glob.glob(root + '/raw/*.json')):
        d = json.load(open(f)); R = reviews(d); LP = [r for r in reviews(d, True) if r[0] == 'steam-lp']
        pos = [r for r in R if r[0] == 'steam+' or r[0] in ('apple4', 'apple5')]
        neg = [r for r in R if r[0] == 'steam-' or r[0] in ('apple1', 'apple2', 'apple3')]
        longneg = LP
        res = {'slug': d['slug'], 'n_reviews': len(R), 'n_pos': len(pos), 'n_neg': len(neg), 'n_longplay_neg': len(longneg),
               'sources': [k for k in ('steam', 'apple') if d.get(k)], 'themes': {}}
        for k, rx in RX.items():
            side = pos if k.startswith('P-') else neg
            hits = [r for r in side if rx.search(r[3])]
            lh = [r for r in longneg if rx.search(r[3])] if k.startswith('N-') else []
            qs = []
            for r in sorted(hits, key=lambda r: -r[1]):
                q = quote(r[3], rx)
                if q: qs.append('%s (%s%s)' % (q, r[0], ', %dh' % r[2] if r[2] else '')) 
                if len(qs) == 2: break
            res['themes'][k] = {'n': len(hits), 'of': len(side), 'longplay_n': len(lh), 'quotes': qs}
        json.dump(res, open(root + '/tags-kw/' + d['slug'] + '.json', 'w'), indent=1); allc[d['slug']] = res
    json.dump(allc, open(root + '/tags-kw/_all.json', 'w'))
    print(len(allc), 'games')
