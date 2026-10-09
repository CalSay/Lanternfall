// 75-craft-ui: the Craft tab (task K7). Browser-only. Tab id stays 'forge' (S.tab, goals).
// Spec: docs/design/gathering-and-crafting.md 6.2, with the owner decisions (random affix
// lines shown on the item, Reforge one line at the Enchanter's Table).
//
// Sections of the 'forge' tab (registerSection), top to bottom:
//   Stations   a link to Hero, Gear; Forge, Workbench, Loom, Enchanter with skill level and XP bar (tap = filter)
//   Recipes    tier picker, For you / For your party / All, Masterwork trophy, one row per kind
//   Enchanter  (Enchanter's Table only) Transmute, and the Star Chart when K6 defines it
// Sections of the 'party' tab's Gear view (cal-0107-gear-and-rates):
//   Your gear  the hero's 8 positions (tap = item sheet, or a picker when empty)
//   Bag        every item, equipped ones badged with the wearer's portrait; sort and filter
// The item sheet (bottom sheet from 75-party-sheet's openSheet) shows lines, compare, and
// Equip, Upgrade, Reforge a line and Salvage (in-page confirms only).
//
// Exposed: craftUI { openItem(id), pick(who, pos) }   who: 'hero'; pos: a hero position.
//
// K6 (55-crafting.js) actions are probed with typeof at call time, so this file works before
// K6 merges: craftItem(kind, t, {role, mw}), canCraft(kind, t) -> {ok, why}, upgradeItem(id),
// reforgeItem(id, idx), transmute(fam, fromT, fam, toT), salvageItem(id),
// S.craft.troph[7].
// Without K6: crafting falls back to forgeItem, upgrades to upgradeEquipped (hero gear only),
// and Reforge and Transmute show as not ready yet.

let craftUI = null;
{
  // ---------------- K6 probes ----------------
  const K6 = {
    craft: () => (typeof craftItem === 'function' ? craftItem : null),
    can: () => (typeof canCraft === 'function' ? canCraft : null),
    upgrade: () => (typeof upgradeItem === 'function' ? upgradeItem : null),
    reforge: () => (typeof reforgeItem === 'function' ? reforgeItem : null),
    transmute: () => (typeof transmute === 'function' ? transmute : null),
    starChart: () => (typeof craftStarChart === 'function' ? craftStarChart : null)
  };
  const safe = (fn, dflt) => { try { const v = fn(); return v == null ? dflt : v; } catch (e) { console.error('[lanternfall] craft', e); return dflt; } };
  // Rebuilding a list between pointerdown and click would swallow the tap: while the player is
  // touching the screen, only forced refreshes (right after an action) rebuild.
  let touchAt = 0;
  document.addEventListener('pointerdown', () => { touchAt = Date.now(); }, true);
  const busy = () => Date.now() - touchAt < 1200;
  const act = (fn) => { const r = safe(fn, false); if (r) { save(); ui(true); } return r; };
  const upCount = () => (S.deeds && S.deeds.n && +S.deeds.n.up) || 0;

  // ---------------- lookups ----------------
  const STATION_KEYS = Object.keys(CRAFT_STATIONS);
  const STATION_SHORT = { forge: 'Forge', bench: 'Bench', loom: 'Loom', ench: 'Enchant' };
  const STATION_TIER_FAM = { forge: 'ore', bench: 'wood', loom: 'fibre', ench: 'crystal' };
  const STATION_IC = { forge: () => iconURL('anvil', '#9A97B3'), bench: () => iconURL(...craftIcon('bow', 2)), loom: () => iconURL(...craftIcon('robe', 3)), ench: () => iconURL(...craftIcon('lantern', 3)) };
  const TRO_IC = ['tro_slime', 'tro_bat', 'tro_bones', 'tro_beetle', 'tro_spore', 'tro_golem', 'tro_wraith'];
  const ROLE_NAME = { tank: 'Tank', striker: 'Striker', caster: 'Caster', support: 'Support' };
  const troIcon = i => iconURL(...craftIcon(TRO_IC[i], 1));
  const troph = () => (S.craft && Array.isArray(S.craft.troph) ? S.craft.troph : [0, 0, 0, 0, 0, 0, 0]);
  const trophTotal = () => troph().reduce((a, b) => a + (b || 0), 0);
  const skillOfSt = st => CRAFT_STATIONS[st].skill;
  const lvOf = sk => (S.skills[sk] || { lv: 1 }).lv;
  const portraitOf = () => { const p = $('portrait'); return p && p.src ? p.src : spriteURL('hero-portrait', SPR.hero, HERO_PAL); };
  const frameOf = it => (it.u ? 'legendary' : it.r);
  const posName = pos => (CRAFT_POS[pos] ? CRAFT_POS[pos].n : pos);
  const itemIc = it => safe(() => itemIcon(it.slot, it.t, it.u), iconURL('charm', '#A9B1BD'));
  const kindLabel = k => { const d = CRAFT_KINDS[k]; return d ? d.noun : k; };
  const tierName = (k, t) => safe(() => kindName(k, t), kindLabel(k));

  // Who wears what: id -> { who: 'hero', pos }.
  function wearers() {
    const m = new Map();
    for (const p of CRAFT_HERO_POS) if (S.equip[p] != null) m.set(S.equip[p], { who: 'hero', pos: p });
    return m;
  }
  const wornBy = id => wearers().get(id) || null;
  const heroFits = k => { const d = CRAFT_KINDS[k]; return !!(d && d.pos && fits(k, d.pos, 'hero')); };
  // An item (not a kind): weapon and head uniques fit every class.
  const heroFitsIt = it => { const d = itemKind(it); return !!(d && d.pos && fits(it, d.pos, 'hero')); };

  // Stat line text, and whether it works before party combat.
  const lineTxt = l => l.map(([s, v]) => (CRAFT_STATS[s] ? craftFmtLine(s, v) : `${s} ${fmt(v)}`)).join(', ');
  const lineLive = l => l.every(([s]) => CRAFT_STATS[s] && CRAFT_STATS[s].live);
  // Split itemLines() back into base lines, affix lines (by index), Masterwork and unique text.
  function splitLines(it) {
    const d = itemKind(it), all = itemLines(it), out = [];
    let i = 0;
    const nb = d ? Math.min(d.base.length, all.length) : 0;
    for (; i < nb; i++) out.push({ g: 'base', l: [all[i]] });
    (Array.isArray(it.a) ? it.a : []).forEach(([aid], ai) => {
      const def = CRAFT_AFFIXES[aid]; if (!def) return;
      out.push({ g: 'affix', idx: ai, l: all.slice(i, i + def.give.length) }); i += def.give.length;
    });
    if (it.mw != null && craftTrophyLine(it.mw, it.slot, 1)) { out.push({ g: 'mw', l: [all[i]] }); i++; }
    if (it.u && UNIQ[it.u]) {
      out.push({ g: 'uniq', txt: UNIQ[it.u].txt });
      const fl = typeof storyItemLine === 'function' ? storyItemLine(it.u) : '';   // story-systems-hollow: one line naming the Champion it came from
      if (fl) out.push({ g: 'uniq', txt: fl, lore: 1 });
    }
    return out;
  }
  // desktop-tooltips: an item's hover tip, from the item sheet's own head and lines (renderItem): name, grade, tier, kind, power,
  // its stat lines and who wears it. The sheet stays the full view (upgrade, salvage, compare).
  tipHook.item = it => {
    const d = itemKind(it), wr = wornBy(it.id);
    const out = [itemName(it), [itemQual(it), `Tier ${it.t}`, d ? (it.u ? posName(d.pos) : d.noun) : ''].filter(Boolean).join(' · '), `Power ${fmt(itemPower(it))}`];
    for (const L of splitLines(it)) if (!L.lore) out.push(L.g === 'uniq' ? L.txt : lineTxt(L.l) + (lineLive(L.l) ? '' : ' (not active yet)'));
    if (wr) out.push(`You wear it (${posName(wr.pos)})`);
    return out.join('\n');
  };
  function deltaTxt(k, v) {
    const s = CRAFT_STATS[k], unit = (s.f.match(/\{v\}(%|x)/) || [])[1] || '';
    const a = Math.abs(v), n = s.dp == null ? fmt(a) : a.toFixed(s.dp);
    return `${v > 0 ? '+' : '-'}${n}${unit}`;
  }
  // craft-shortfall-offer: what the next +1 adds to the piece's main line, in that line's own unit ("+3: +3% damage."). A
  // line at its cap (a Quiver's crit, a Lantern's spell) says so and shows the power change instead. Copy only: itemPower
  // and the upgrade cost are unchanged.
  function nextPlusTxt(it) {
    const nx = Object.assign({}, it, { plus: it.plus + 1 }), a = itemLines(it), b = itemLines(nx);
    const head = `+${it.plus + 1}: `, more = a.length > 1 ? ' Its other lines grow too.' : '';
    const [k, v0] = a[0] || [], v1 = b[0] && b[0][0] === k ? b[0][1] : v0, s = CRAFT_STATS[k];
    const dv = Math.round((v1 - v0) * 10) / 10;   // one decimal, never cut down (an Epic Tier 3 weapon's +15.75 reads +15.8%, not +15%)
    if (s && dv > 0) return `${head}${s.f.replace('{v}', dv % 1 ? dv.toFixed(1) : String(dv))}.${more}`;
    const nextP = itemPower(Object.assign({}, it, { plus: it.plus + 1 }));   // playtester-code-bugs: uniques use UNIQ_TUNE.pow, as itemPower does
    const pw = `power ${fmt(itemPower(it))} → ${fmt(nextP)}`;
    return s ? `${head}${s.n} is at its cap. ${pw[0].toUpperCase() + pw.slice(1)}.${more}` : `${head}${pw}.`;
  }
  // craft-shortfall-offer: a cost short of a middle (Ingot, Plank, Cloth, Leather) at tier t, read from refineOffer (55-refine).
  // -> { txt, btn, add } | null. btn (the one-tap order) only when every order's inputs are in hand together and the stations
  // have room; else txt names what is short. Orders already queued read "Smelting at the Forge." Nothing is queued until the
  // player presses the button. upgrade-gold-covers-short adds its gold choice to this same row.
  const midName = (f, t, n) => f === 'coal' ? 'coal' : matName(f, t) + (n !== 1 && (f === 'ingot' || f === 'plank' || MAT[f].unit === 'Log') ? 's' : '');
  const andList = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  function shortOffer(cost, t) {
    if (typeof refineOffer !== 'function' || !refineOn()) return null;
    const mats = cost && cost.mats ? cost.mats : cost || {};
    const mids = Object.keys(mats).filter(k => REFINE_RAW[k] && matOwn(k, t) < mats[k]);
    if (!mids.length) return null;
    const off = refineOffer(mats, t), out = [];
    const queued = mids.filter(k => !off.orders.some(o => o.prod === k));
    let btn = '';
    if (off.orders.length) {
      out.push(`Short ${andList(off.orders.map(o => `${storeNum(o.want)} ${midName(o.prod, t, o.want)}`))}.`);
      const need = {};
      for (const o of off.orders) for (const [f, tt, n] of refineNeed(o.prod, o.tier)) need[f + ':' + tt] = (need[f + ':' + tt] || 0) + n * o.want;
      const miss = Object.entries(need).map(([key, n]) => { const [f, tt] = key.split(':'); return [f, +tt, n - matOwn(f, +tt)]; }).filter(x => x[2] > 0);
      const slots = {};
      for (const o of off.orders) slots[o.st] = (slots[o.st] || 0) + 1;
      const tight = Object.keys(slots).find(st => { const l = refineOrders(st); return REFINE_TUNE.max - l.length + l.filter(o => !o.all && o.made >= o.want).length < slots[st]; });
      const bad = off.orders.find(o => !o.ok && (!refineBuilt(o.st) || !refineSlotFree(o.st))), ings = andList(off.orders.map(o => REFINE_PRODUCTS[o.prod].ing.toLowerCase()));
      if (bad) out.push(bad.why);
      else if (miss.length) out.push(`${ings[0].toUpperCase() + ings.slice(1)} them needs ${andList(miss.map(([f, tt, n]) => `${storeNum(n)} more ${midName(f, tt, n)}`))}${miss.some(x => x[0] === 'coal') ? ' (Copper Ore brings coal)' : ''}.`);
      else if (tight) out.push(`The ${CAMP_B[tight].n} holds ${REFINE_TUNE.max} orders. Clear one first.`);
      else if (off.orders.some(o => !o.full)) out.push('The Storehouse has no room for them.');
      else {
        out.push(`${andList(off.orders.map(o => `${REFINE_PRODUCTS[o.prod].verb} ${storeNum(o.want)}`))} (${andList(Object.entries(need).map(([key, n]) => { const [f, tt] = key.split(':'); return `${storeNum(n)} ${midName(f, +tt, n)}`; }))})?`);
        btn = andList(off.orders.map((o, i) => `${i ? REFINE_PRODUCTS[o.prod].verb.toLowerCase() : REFINE_PRODUCTS[o.prod].verb} ${storeNum(o.want)}`));
      }
    }
    for (const k of queued) {   // the order is queued: say it runs, or why it has stopped
      const st = REFINE_PRODUCTS[k].st, mine = refineOrders(st).filter(o => o.prod === k && o.tier === t && (o.all || o.made < o.want));
      const stop = mine.length && !mine.some(o => refineState(st, o).k === 'run') ? refineState(st, mine[0]).why : '';
      out.push(stop ? `The ${CAMP_B[st].n}'s ${matName(k, t)} order has stopped: ${stop}.` : `${REFINE_PRODUCTS[k].ing} at the ${CAMP_B[st].n}.`);
    }
    return { txt: out.join(' '), btn, add: btn ? () => off.add() : null };
  }
  // The row under a recipe or an upgrade: the line, and the button when the order can start. after: re-render (the item sheet).
  function shortRow(cost, t, after) {
    const o = safe(() => shortOffer(cost, t), null); if (!o) return null;
    const r = el('div', 'cf-src cf-short');
    r.append(el('span', null, o.txt + ' '));
    if (o.btn) {
      const b = el('button', 'mini cf-order', o.btn); b.type = 'button';
      b.addEventListener('click', () => { act(() => { const x = shortOffer(cost, t); return x && x.add ? x.add() > 0 : false; }); if (after) after(); });
      r.append(b);
    }
    return r;
  }

  // ---------------- UI state (memory only) ----------------
  const st8 = { st: null, tier: {}, filt: 'you', mw: null, role: {}, sort: 'power', bfilt: 'spare', pick: '', focus: null, fresh: new Set(), tm: { fam: 'ore', t: 1 }, recent: [], result: null, resArm: false, reveal: false,
    tool: {}, fd: {}, crafted: false };   // craft-delta: tool: id -> { on, speed } from the crafted event; fd: id -> { sig, job, res } the fight line
  const openTier = st => {
    return skillTopTier(skillOfSt(st));
  };
  function initState() {
    if (st8.st) return;
    const cls = S.party && S.party.cls;
    st8.st = { warden: 'forge', lanternmage: 'bench', ranger: 'bench', lightkeeper: 'loom' }[cls] || 'forge';
    // menu audit: open on the highest tier where something for your hero can be made now (Tier 5 with every recipe
    // short of materials was the first thing a late player saw); else the highest open tier, as before
    const makeable = (s, t) => { try { return Object.keys(CRAFT_KINDS).some(k => CRAFT_KINDS[k].st === s && !CRAFT_KINDS[k].legacy && (typeof heroFits !== 'function' || heroFits(k)) && canCraft(k, t).ok); } catch (e) { return false; } };
    for (const s of STATION_KEYS) { const top = openTier(s); let t = top; while (t > 1 && !makeable(s, t)) t--; st8.tier[s] = makeable(s, t) ? t : top; }
    st8.pick = S.fSlot + ':' + S.fTier + ':0';
  }
  // "Next up" goals set S.fSlot / S.fTier and open this tab: jump to that recipe.
  function syncGoalPick() {
    const key = S.fSlot + ':' + S.fTier + ':' + forgeGoalPicks; if (key === st8.pick) return;
    st8.pick = key;
    let k = S.fSlot; const d = CRAFT_KINDS[k]; if (!d) return;
    if (d.legacy) { const row = CRAFT_FITS[d.pos] || {}; const w = heroWho(); k = (row[w] && row[w][0]) || k; }
    st8.st = CRAFT_KINDS[k].st; st8.tier[st8.st] = Math.max(1, Math.min(5, S.fTier | 0 || 1)); st8.focus = k;
    if (!heroFits(k)) st8.filt = 'all';
  }

  // ---------------- craft checks ----------------
  const mwFor = k => (st8.mw != null && craftTrophyLine(st8.mw, k, 1) ? st8.mw : null);
  function localCan(k, t) {
    const d = CRAFT_KINDS[k], sk = skillOfSt(d.st), req = CRAFT_STATION_REQ[t - 1];
    if (!stationTierOpen(k, t)) return { ok: false, why: `Needs ${SKILL[sk]} Lv ${req}` };
    if (bagFull()) return { ok: false, why: 'Your bag is full' };
    if (!hasMats(kindCost(k, t), t)) return { ok: false, why: 'Not enough materials' };
    return { ok: true, why: '' };
  }
  function canDo(k, t) {
    const f = K6.can();
    let r = f ? safe(() => f(k, t), null) : null;
    if (!r) r = localCan(k, t);
    const mw = mwFor(k);
    if (r.ok && mw != null && !(troph()[mw] > 0)) r = { ok: false, why: `No ${CRAFT_TROPHIES[mw].n} left` };
    return r;
  }
  const roleFor = k => st8.role[k] || 'striker';
  // craft-delta: how many recipes you could make right now (a craft made with two or more on offer is a choice)
  const affordable = () => { let n = 0; for (const s of STATION_KEYS) for (const k of listFor(s, 'you')) for (let t = 1; t <= 5 && n < 2; t++) if (skillTierOpen(skillOfSt(s), t) && safe(() => canDo(k, t).ok, false)) n++; return n; };
  function doCraft(k, t) {
    if (!canDo(k, t).ok) return;
    const d = CRAFT_KINDS[k], opts = { wear: true };   // craft-delta: a better tool goes on by itself (55-crafting craftItem)
    if (d.role === 'any') opts.role = roleFor(k);
    const mw = mwFor(k); if (mw != null) opts.mw = mw;
    const f = K6.craft(), choice = affordable() >= 2;
    const it = safe(() => (f ? f(k, t, opts) : forgeItem(k, t)), null);
    if (it) {
      if (choice) emit('choice', 'craft');
      if (!st8.crafted) { st8.crafted = true; emit('firstUse', 'craft'); }   // the first craft this visit (the walk plays one fresh game)
      if (it.id != null) st8.fresh.add(it.id); save(); ui(true);
    }
  }
  // ---- the fight line (craft-delta): what the piece changes against the boss at your furthest zone (55-fight-delta) ----
  // Sampled a chunk at a time after the card opens, so the card never waits; the line joins it when the sample is done, or is
  // left out. Keyed by what the fight depends on now, so a card seen again after a gear change samples again.
  const fdSig = () => [S.maxZone, S.L, JSON.stringify(S.equip), JSON.stringify(S.attr || null), JSON.stringify(S.stars || null), JSON.stringify(S.abil || null), JSON.stringify(S.turn || null)].join('|');   // what the fight reads
  function fdStart(it) {
    if (typeof fightDeltaJob !== 'function' || !it || it.id == null) return;
    const sig = fdSig(), cur = st8.fd[it.id];
    if (cur && cur.sig === sig) return;
    const job = safe(() => fightDeltaJob(it), null), rec = st8.fd[it.id] = { sig, job, res: null };
    if (!job) return;
    const run = () => {
      if (st8.fd[it.id] !== rec) return;
      if (safe(() => job.step(), true)) { rec.res = job.res; rec.job = null; if (st8.result === it.id) ui(true); return; }
      setTimeout(run, 30);
    };
    setTimeout(run, 30);
  }
  function fightLine(it) {
    const f = st8.fd[it.id], r = f && f.sig === fdSig() ? f.res : null;
    if (!r) return '';
    if (r.kind === 'wins') return `Zone ${r.zone} boss: you'd win about ${r.after} in 10, not ${r.before} in 10.`;
    if (r.kind === 'turns') return `Zone ${r.zone} boss: about ${r.after} turns a win, not ${r.before}.`;
    return `Zone ${r.zone} boss: a hit takes about ${r.after}% of your health, not ${r.before}%.`;
  }
  // the tool line: "Copper Pickaxe on. Mining is 35% faster than with your Stone Pick: +25% for a tier 1 tool on a tier 1 vein,
  // and +8.1% from its mining speed line." (or why it went in the bag). tool-speed-adds-up: the parts come from the crafted record
  // (toolParts); when they do not multiply to the total within 1 point, or one rounds to 0, only the total and the old tool show.
  const TOOL_NODE = { mine: 'vein', wood: 'tree', forage: 'patch', hunt: 'hunting ground' };
  const pctTxt = x => { const v = Math.round(x * 10) / 10; return (v % 1 ? v.toFixed(1) : String(v)); };
  const spdSum = (st, s) => (s[st] || 0) + (s.gather || 0);
  // At craft time (the 'crafted' listener): what the new tool is faster than, the measured tier, the right-tool bonus before and
  // after, and the summed speed stat (the tool's own line plus Gathering speed) before and after. Mastery and the skill level are
  // read at the same instant on both sides, so they are not parts.
  function toolParts(it, e) {
    const d = itemKind(it), kind = Object.keys(TOOL_KINDS).find(k => TOOL_KINDS[k].pos === d.pos), tk = TOOL_KINDS[kind];
    const fam = Object.keys(CRAFT_NODES).find(k => CRAFT_NODES[k].tool === it.slot); if (!tk || !fam) return null;
    const skill = tk.skill, st = NODE_TOOL_STATS[it.slot][0], nt = Math.max(1, skillTopTier(skill) || 1);
    const old = e.was != null ? itemById(e.was) : null, oldT = old ? itemTier(old) : 0, nm = kindName(it.slot, it.t, it.u);
    const oldNm = old ? itemName(old) : tk.rough, oldSum = old ? spdSum(st, itemStats(old)) : 0;
    const g = gear(), after = spdSum(st, g), before = after - spdSum(st, itemStats(it)) + oldSum;
    return { skill, nt, oldNm, same: oldNm === nm || (!old && tk.rough === d.noun), st,
      rightWas: !!(TOOL_TUNE.on && oldT > 0 && oldT >= nt), rightNow: toolRight(skill, nt) > 1, t: itemTier(it), before, after, rough: !old,
      lines: !!itemStats(it).gather || (!old && before > 0) };   // more than the tool's own speed line moved the gear part
  }
  function toolLine(it) {
    const tl = st8.tool[it.id], d = itemKind(it);
    if (!d || !d.tool) return '';
    if (tl && tl.on && wornBy(it.id)) {
      const [a, b] = tl.speed || [0, 0], pct = a > 0 && b > 0 ? Math.round((a / b - 1) * 100) : 0, sk = CRAFT_NODES[Object.keys(CRAFT_NODES).find(k => CRAFT_NODES[k].tool === it.slot)];
      const nm = sk && SKILL[sk.skill] ? SKILL[sk.skill] : 'Gathering', head = `${kindName(it.slot, it.t, it.u)} on.`;
      if (pct <= 0) return head;
      const p = tl.parts, than = !p ? '' : p.same ? ' than before' : ` than with your ${p.oldNm}`;
      const total = `${head} ${nm} is ${pct}% faster${than}`;
      if (!p) return total + '.';
      const parts = [], mult = [];
      if (p.rightNow && !p.rightWas) {
        parts.push(`+${Math.round(TOOL_TUNE.right * 100)}% for a tier ${p.t} tool on a tier ${p.nt} ${TOOL_NODE[p.skill] || 'node'}`);
        mult.push(1 + TOOL_TUNE.right);
      }
      const gp = ((1 + p.after / 100) / (1 + p.before / 100) - 1) * 100, sName = CRAFT_STATS[p.st] ? CRAFT_STATS[p.st].n.toLowerCase() : 'speed';
      if (gp < -1e-9) return total + '.';   // more item power but a slower speed line: the total says it all
      if (gp > 1e-9) { parts.push(`+${pctTxt(gp)}% from ${p.lines ? `your gear's ${sName}` : `its ${p.rough ? '' : 'better '}${sName} line`}`); mult.push(1 + gp / 100); }
      const prod = mult.reduce((x, y) => x * y, 1);
      if (!parts.length || parts.some((s, i) => Math.round(Math.abs(mult[i] - 1) * 1000) === 0) || Math.abs((prod - 1) * 100 - (a / b - 1) * 100) > 1)
        return total + '.';
      return `${total}: ${parts.join(', and ')}.`;
    }
    if (tl && !tl.on && !wornBy(it.id)) { const cur = itemById(S.equip[d.pos]); if (cur && cur.id !== it.id) return `It is in your bag. Your ${itemName(cur)} is better.`; }
    return '';
  }

  // ================= Stations =================
  const stEls = {};
  registerSection('forge', {
    id: 'craft-stations', title: 'Stations',
    mount(sec) {
      const row = el('div', 'cf-stations'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Crafting stations');
      for (const s of STATION_KEYS) {
        const b = el('button', 'cf-st'); b.type = 'button'; b.dataset.st = s;
        b.setAttribute('aria-label', CRAFT_STATIONS[s].n);
        const lv = el('span', 'cf-st-lv');
        const top = el('span', 'cf-st-top'); top.append(img(STATION_IC[s]()), lv);
        const bar = el('span', 'bar cf-st-bar'); const fill = el('i'); bar.append(fill);
        if (s === 'forge') fill.id = 'smithBar'; // "Next up" skill goal scrolls here
        b.append(top, el('span', 'cf-st-n', STATION_SHORT[s]), bar);
        b.addEventListener('click', () => { st8.st = s; st8.focus = null; ui(true); });
        row.append(b); stEls[s] = { b, lv, fill };
      }
      const info = el('p', 'note cf-st-info');
      // Gear moved to the Hero tab: one tap there from Make.
      const gl = el('button', 'mini cf-gearlink', 'Your gear is on the Hero tab'); gl.type = 'button';
      gl.addEventListener('click', () => setTab('gear'));
      sec.append(gl, row, info); stEls.info = info; stEls.gl = gl;
    },
    update() {
      initState(); syncGoalPick();
      putHidden(stEls.gl, !featOk('party'));
      for (const s of STATION_KEYS) {
        const e = stEls[s], sk = S.skills[skillOfSt(s)] || { lv: 1, xp: 0 };
        putAttr(e.b, 'aria-pressed', String(st8.st === s));
        putText(e.lv, `Lv ${sk.lv}`);
        putStyle(e.fill, 'width', Math.min(100, sk.xp / skillNeed(sk.lv, skillOfSt(s)) * 100) + '%');
      }
      const sk = skillOfSt(st8.st), s = S.skills[sk] || { lv: 1, xp: 0 };
      const next = skillNextReq(sk);
      putText(stEls.info, `${CRAFT_STATIONS[st8.st].n}: ${SKILL[sk]} Lv ${s.lv}, ${fmt(s.xp)} / ${fmt(skillNeed(s.lv, sk))} XP.` + (next ? ` Next tier at Lv ${next}.` : ' Every tier is open.'));
    }
  });

  // ================= Recipes =================
  let rec = null;
  function kindsFor(st) {
    return Object.keys(CRAFT_KINDS).filter(k => { const d = CRAFT_KINDS[k]; return craftKindVisible(k) && d.st === st && !d.legacy && !(d.comp && !d.pos); });   // no companion-only recipes; Sword/Helm are no longer made
  }
  const POS_ORDER = [...CRAFT_HERO_POS, ...CRAFT_COMP_POS];
  const kindOrder = k => { const d = CRAFT_KINDS[k]; return POS_ORDER.indexOf(d.pos || d.comp || 'charm'); };
  function listFor(st, filt) {
    const all = kindsFor(st).sort((a, b) => kindOrder(a) - kindOrder(b));
    if (filt === 'all') return all;
    return all.filter(k => { const d = CRAFT_KINDS[k]; return heroFits(k) || (!d.pos && !d.comp); });
  }
  // Would a fresh Common of this tier beat what someone wears?
  function beats(k, t) {
    const d = CRAFT_KINDS[k], p = TIER_POW[t];
    const out = [];
    if (heroFits(k)) { const cur = itemById(S.equip[d.pos]); if (!cur || itemPower(cur) < p) out.push('hero'); }
    return out;
  }
  function subFor(k) {
    const d = CRAFT_KINDS[k], bits = [];
    if (d.pos) bits.push(posName(d.pos) + (heroFits(k) ? '' : d.cls ? ` · ${HERO_CLASSES[d.cls] ? HERO_CLASSES[d.cls].name : d.cls}` : ''));
    if (!d.pos && !d.comp) bits.push('Special');
    return bits.join(' · ');
  }
  // craft-attribute-grades: with CRAFT_TUNE.grades on, a graded recipe shows the grade it will be made at and the level of the next
  // grade ("Grade B · A at Woodcraft 11"), and, when another tier is open, the choice between them ("Pine Bow grade A, or Birch Bow
  // grade D"). Tools keep the odds line.
  const gradeTxt = (k, t) => safe(() => {
    if (!gradedKind(k)) return '';
    const g = gradeFor(k, t), nx = gradeNext(k, t), sk = SKILL[skillOfSt(CRAFT_KINDS[k].st)];
    return `Grade ${GRADE[g].n} · ` + (nx ? `${GRADE[nx.g].n} at ${sk} ${nx.lv}` : 'the top grade');
  }, '');
  const choiceTxt = (k, t) => safe(() => {
    if (!gradedKind(k) || !stationTierOpen(k, t)) return '';
    const u = t < 5 && stationTierOpen(k, t + 1) ? t + 1 : t > 1 ? t - 1 : 0;
    if (!u) return '';
    return `${tierName(k, t)} grade ${GRADE[gradeFor(k, t)].n}, or ${tierName(k, u)} grade ${GRADE[gradeFor(k, u)].n}`;
  }, '');
  // craft-reveal: the odds a craft rolls on (the same weights craftItem rolls with), one line per recipe
  const oddsTxt = k => safe(() => {
    const w = rarityWeights(stationLevel(k)), tot = Object.values(w).reduce((a, b) => a + b, 0);
    const pc = v => { const p = v / tot * 100; return (p < 10 ? p.toFixed(1) : String(Math.round(p))) + '%'; };
    return 'Odds: ' + ['common', 'uncommon', 'rare', 'epic'].map(r => `${RAR[r].n} ${pc(w[r])}`).join(' · ');
  }, '');
  // short quality word for a bag tile (the full word sits on the item sheet and in the label): itemQualShort (40-rules), "Rare" or
  // a graded item's letter ("B")
  // stat changes against what the hero wears in that slot: [{ label, v, txt }]
  function diffRows(it) {
    const d = itemKind(it), cur = d && d.pos ? itemById(S.equip[d.pos]) : null;
    if (!d || !d.pos || !heroFitsIt(it) || !cur || cur.id === it.id) return null;
    const a = itemStats(it), b = itemStats(cur), rows = [];
    const pd = itemPower(it) - itemPower(cur);
    if (Math.abs(pd) >= 0.05) rows.push({ label: 'Power', v: pd, txt: (pd > 0 ? '+' : '-') + fmt(Math.abs(pd)) });
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!CRAFT_STATS[k]) continue;
      const v = (a[k] || 0) - (b[k] || 0);
      if (Math.abs(v) >= 0.05) rows.push({ label: CRAFT_STATS[k].n, v, txt: deltaTxt(k, v) });
    }
    return { cur, rows };
  }
  function resultCard(it) {
    const d = itemKind(it), wr = wornBy(it.id), card = el('div', 'cf-res card');
    card.dataset.itemId = it.id;
    const head = el('div', 'cf-ih'), tile = icTile(itemIc(it), frameOf(it)); tile.classList.add('s56');
    const who = el('div', 'cf-ihw');
    who.append(el('h3', 'cf-in rar-' + it.r, itemName(it)));
    const grade = el('span', 'cf-grade rar-' + it.r, itemQual(it));
    const meta = el('div', 'cf-im'); meta.append(grade, ` · Tier ${it.t}${d ? ' · ' + (d.pos ? posName(d.pos) : d.noun) : ''}`);
    who.append(meta);
    head.append(tile, who);
    const left = el('div', 'cf-res-l'), right = el('div', 'cf-res-r'); card.append(left, right);   // landscape: two columns
    left.append(head);
    const lines = el('div', 'cf-lines');
    for (const L of splitLines(it)) {
      const r = el('div', 'cf-line g-' + L.g);
      if (L.g === 'uniq') { if (!L.lore) r.append(el('span', 'cf-lt', L.txt)); if (L.lore) continue; lines.append(r); continue; }
      r.append(el('span', 'cf-lt', lineTxt(L.l)));
      if (L.g === 'affix') r.append(el('small', 'cf-tag', 'Bonus'));
      if (L.g === 'mw') r.append(el('small', 'cf-tag', 'Masterwork'));
      lines.append(r);
    }
    if (lines.children.length) left.append(lines);
    const df = diffRows(it), tl = toolLine(it), fl = !wr ? fightLine(it) : '';
    if (tl) right.append(el('p', 'note cf-cmpn cf-toolon', tl));
    if (fl) right.append(el('p', 'note cf-cmpn cf-fight', fl));
    if (wr) { if (!tl) right.append(el('p', 'note cf-cmpn', `You wear it (${posName(wr.pos)}).`)); }
    else if (df) {
      right.append(el('p', 'note cf-cmpn', `Against your ${itemName(df.cur)}:`));
      const rows = el('div', 'cf-dl');
      for (const r of df.rows) { const x = el('div', 'cf-d ' + (r.v > 0 ? 'up' : 'dn')); x.append(el('span', null, r.label), el('b', null, (r.v > 0 ? '▲ ' : '▼ ') + r.txt)); rows.append(x); }
      if (!df.rows.length) rows.append(el('p', 'note', 'Same stats.'));
      right.append(rows);
    } else if (d && d.pos && heroFitsIt(it)) right.append(el('p', 'note cf-cmpn', `You wear nothing as ${posName(d.pos)}. This is a gain.`));
    else if (d && d.pos) right.append(el('p', 'note cf-cmpn', `A ${posName(d.pos)} for a different class.`));
    const acts = el('div', 'cf-wear cf-resact');
    if (st8.resArm) {
      right.append(el('p', 'note warn', `Salvage ${itemName(it)}? It is gone for good.`));
      const no = el('button', 'big cf-act cf-keep', 'Keep it'); no.type = 'button';
      const yes = el('button', 'big cf-act', 'Salvage it'); yes.type = 'button';
      no.addEventListener('click', () => { st8.resArm = false; ui(true); });
      yes.addEventListener('click', () => { const id = it.id; st8.resArm = false; if (act(() => salvageItem(id))) { st8.fresh.delete(id); st8.recent = st8.recent.filter(x => x !== id); st8.result = null; ui(true); } });
      acts.append(no, yes);
    } else {
      if (d && d.pos && heroFitsIt(it) && !wr) {
        const eq = el('button', 'big forge cf-act', 'Equip'); eq.type = 'button';
        eq.addEventListener('click', () => { equipHero(it.id, d.pos); if (wornBy(it.id)) { st8.result = null; st8.resArm = false; } ui(true); });   // Cal's play note 17: worn, so the card closes (Keep and Salvage are for a piece that is not worn)
        acts.append(eq);
      }
      const keep = el('button', 'big cf-act cf-keep', wr ? 'Done' : 'Keep'); keep.type = 'button';   // gear-in-first-25: a piece that went on by itself is done, not kept
      keep.addEventListener('click', () => { st8.result = null; ui(true); });
      acts.append(keep);
      if (!wr) {
        const sv = el('button', 'big cf-act cf-keep', 'Salvage'); sv.type = 'button';
        sv.addEventListener('click', () => { st8.resArm = true; ui(true); });
        acts.append(sv);
      }
    }
    right.append(acts);
    return card;
  }
  // the last five results: tap one to see its card again
  function recentStrip() {
    const strip = el('div', 'cf-recent'); strip.setAttribute('aria-label', 'Last crafts');
    strip.append(el('span', 'cf-lbl', 'Last crafts'));
    const row = el('div', 'cf-recent-r');
    for (const id of st8.recent) {
      const it = itemById(id); if (!it) continue;
      const b = el('button', 'ic cf-tile f-' + frameOf(it) + (st8.result === id ? ' sel' : '')); b.type = 'button';
      b.append(img(itemIc(it)), el('span', 'cf-gr rar-' + it.r, itemQualShort(it)));
      b.setAttribute('aria-label', `${itemName(it)}, ${itemQual(it)}`); setTip(b, () => tipItem(itemById(id)));
      b.addEventListener('click', () => { st8.result = id; st8.resArm = false; ui(true); });
      row.append(b);
    }
    strip.append(row);
    return strip;
  }
  on('crafted', e => {
    const it = e && e.item; if (!it || it.id == null) return;
    st8.recent = [it.id, ...st8.recent.filter(x => x !== it.id)].slice(0, 5);
    st8.result = it.id; st8.resArm = false; st8.fresh.add(it.id); st8.reveal = true;
    if (itemKind(it) && itemKind(it).tool) st8.tool[it.id] = { on: !!e.on, speed: e.speed || null, parts: e.on ? safe(() => toolParts(it, e), null) : null };   // tool-speed-adds-up: the old tool and the parts, read now
    else fdStart(it);
    // a Rare or better craft, or (craft-attribute-grades) grade A or S, is a medium moment
    if ((itemGraded(it) ? GRADE[it.g].moment : it.r === 'rare' || it.r === 'epic' || it.r === 'legendary') && typeof moment === 'function')
      moment('craft', { eye: `Well made · ${itemQual(it)}`, title: itemName(it), sub: `${itemQual(it)} ${itemKind(it) ? itemKind(it).noun : 'item'}. ${e.on ? "It's on." : 'It is in your bag.'}`, rarity: it.r, icon: { item: it } });
  });
  function recipeRow(k, t) {
    const d = CRAFT_KINDS[k], can = canDo(k, t);
    const row = el('div', 'cf-rec' + (can.ok ? ' ok' : '') + (st8.focus === k ? ' focus' : ''));
    row.dataset.kind = k;
    const tile = icTile(itemIcon(k, t));
    const body = el('div', 'cf-rec-b');
    const nm = el('div', 'cf-rec-n', tierName(k, t));
    const sub = el('div', 'cf-rec-s', subFor(k));
    const up = beats(k, t);
    if (up.length) sub.append(el('span', 'cf-up', 'Beats yours'));
    body.append(nm, sub);
    const btn = el('button', 'cf-go', 'Craft'); btn.type = 'button'; btn.disabled = !can.ok;
    if (st8.focus === k) btn.id = 'forgeBtn';
    btn.setAttribute('aria-label', `Craft ${tierName(k, t)}`);
    btn.addEventListener('click', () => doCraft(k, t));
    const costs = el('div', 'costs cf-rec-c');
    costChips(costs, kindCost(k, t), t);
    const mw = mwFor(k);
    if (mw != null) {
      const have = troph()[mw] || 0, c = el('span', 'cost mw' + (have < 1 ? ' short' : ''));
      c.append(img(troIcon(mw)), el('span', null, `${have}/1 ${CRAFT_TROPHIES[mw].n}`)); setTip(c, () => tipCost(CRAFT_TROPHIES[mw].n, troph()[mw] || 0, 1)); costs.append(c);
    }
    row.append(tile, body, btn, costs);
    // gear-in-first-25: where each short gathered material comes from ("Bristlehide: from Hunting, which opens at zone 5."); none for
    // essence, gold, a middle (Planks, Ingots) or a material in hand
    for (const [f, n] of Object.entries(kindCost(k, t))) { if (matOwn(f, t) >= n) continue; const ln = matSourceLine(f, t); if (ln) row.append(el('div', 'cf-src', ln)); }
    if (skillTierOpen(skillOfSt(d.st), t)) { const sr = shortRow(kindCost(k, t), t); if (sr) row.append(sr); }   // craft-shortfall-offer: only on a tier you can make
    if (gradedKind(k)) {   // craft-attribute-grades: the grade line and the choice in place of the odds
      const gl = stationTierOpen(k, t) ? gradeTxt(k, t) : ''; if (gl) row.append(el('div', 'cf-odds cf-gline', gl));
      const ch = choiceTxt(k, t); if (ch) row.append(el('div', 'cf-odds cf-choice', ch));
    } else { const odds = oddsTxt(k); if (odds) row.append(el('div', 'cf-odds', odds)); }
    if (d.role === 'any') {
      const rs = el('div', 'cf-roles'); rs.append(el('span', 'cf-lbl', 'Bonus lines for'));
      const seg = el('div', 'seg cf-seg');
      for (const r of Object.keys(ROLE_NAME)) {
        const b = el('button', null, ROLE_NAME[r]); b.type = 'button'; b.setAttribute('aria-pressed', String(roleFor(k) === r));
        b.addEventListener('click', () => { st8.role[k] = r; ui(true); });
        seg.append(b);
      }
      rs.append(seg); row.append(rs);
    }
    if (!can.ok) row.append(el('div', 'cf-why', can.why || 'Not ready yet.'));
    return row;
  }
  registerSection('forge', {
    id: 'craft-recipes', title: 'Recipes',
    mount(sec) {
      const filt = el('div', 'seg cf-seg cf-filt'); filt.setAttribute('aria-label', 'Show recipes');
      for (const [f, n] of [['you', 'For you'], ['all', 'All']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.f = f;
        b.addEventListener('click', () => { st8.filt = f; ui(true); });
        filt.append(b);
      }
      const tiers = el('div', 'seg cf-seg cf-tiers'); tiers.setAttribute('aria-label', 'Tier');
      for (let t = 1; t <= 5; t++) {
        const b = el('button'); b.type = 'button'; b.dataset.t = t;
        b.append(el('b', null, `Tier ${t}`), el('small'));
        b.addEventListener('click', () => { st8.tier[st8.st] = t; ui(true); });
        tiers.append(b);
      }
      const mwRow = el('div', 'cf-mw');
      const list = el('div', 'cf-list');
      const resBox = el('div', 'cf-resbox'); resBox.setAttribute('aria-live', 'polite');
      sec.append(resBox, filt, tiers, mwRow, list);
      rec = { filt, tiers, mwRow, list, resBox, resSig: null, sig: '', mwSig: null, rows: {} };
    },
    update(force) {
      initState();
      const st = st8.st, t = st8.tier[st] || 1;
      // D9: "For you" never shows an empty list; it shows All and says why
      const noFit = st8.filt === 'you' && !listFor(st, 'you').length && listFor(st, 'all').length > 0;
      const filt = noFit ? 'all' : st8.filt;
      for (const b of rec.filt.children) putAttr(b, 'aria-pressed', String(b.dataset.f === filt));
      for (const b of rec.tiers.children) {
        const i = +b.dataset.t, req = CRAFT_STATION_REQ[i - 1], open = skillTierOpen(skillOfSt(st), i);
        putAttr(b, 'aria-pressed', String(i === t)); putToggle(b, 'locked', !open);
        putText(b.lastChild, open ? MAT[STATION_TIER_FAM[st]].short[i - 1] : `Lv ${req}`);
      }
      if (!force && busy()) return;   // never swap a row under the player's finger
      // craft-reveal: the result card and the last-five strip
      if (st8.result != null && !itemById(st8.result)) st8.result = null;
      st8.recent = st8.recent.filter(id => itemById(id));
      { const it = st8.result != null ? itemById(st8.result) : null; if (it && !(itemKind(it) || {}).tool && !wornBy(it.id)) fdStart(it); }   // craft-delta: a card seen again after a gear change samples again
      const resSig = JSON.stringify([st8.result, st8.resArm, st8.recent, st8.result != null ? (() => { const it = itemById(st8.result); return [it.r, it.plus, wornBy(it.id) && wornBy(it.id).pos, S.equip[CRAFT_KINDS[it.slot] && CRAFT_KINDS[it.slot].pos], fightLine(it)]; })() : 0]);
      if (resSig !== rec.resSig) {
        rec.resSig = resSig; rec.resBox.textContent = '';
        const rit = st8.result != null ? itemById(st8.result) : null;
        if (rit) rec.resBox.append(resultCard(rit));
        if (st8.recent.length) rec.resBox.append(recentStrip());
        if (st8.reveal && rit) { st8.reveal = false; try { rec.resBox.scrollIntoView({ block: 'start' }); } catch (e) {} }   // the card appears above the row the player tapped: bring it into view
      }
      const tr = troph();
      // Masterwork picker: only when the player has a trophy. Rebuilt when the trophies or the pick change.
      if (st8.mw != null && !(tr[st8.mw] > 0)) st8.mw = null;
      const mwSig = tr.join() + '|' + st8.mw;
      if (mwSig !== rec.mwSig) {
        rec.mwSig = mwSig;
        rec.mwRow.textContent = '';
        if (tr.some(n => n > 0)) {
          // one row: "Masterwork [None v]" (menu audit #9; was a chip per trophy, up to 4 rows)
          const line = el('label', 'cf-mwline'), sel = el('select', 'cf-mwsel');
          line.append(el('span', 'cf-lbl', 'Masterwork'));
          const opt = (v, label) => { const o = el('option', null, label); o.value = v; o.selected = String(st8.mw ?? '') === v; sel.append(o); };
          opt('', 'None');
          tr.forEach((n, i) => { if (n > 0) opt(String(i), `${CRAFT_TROPHIES[i].n} (${n})`); });
          sel.addEventListener('change', () => { st8.mw = sel.value === '' ? null : +sel.value; ui(true); });
          if (st8.mw != null) line.append(img(troIcon(st8.mw)));
          line.append(sel);
          rec.mwRow.append(line);
          if (st8.mw != null) {
            const m = CRAFT_TROPHIES[st8.mw].mw;
            rec.mwRow.append(el('p', 'note', `Adds 1 gold bonus line: ${CRAFT_STATS[m.gear].n}${m.tool ? ` (${CRAFT_STATS[m.tool].n} on tools)` : ' (not on tools)'}. Uses the trophy.`));
          }
        }
      }
      // The list is built once per station, tier, filter and recipe set. After that a row is rebuilt
      // only when what it shows changes (materials, can craft, who it beats, ...): see rowSig.
      let ks = listFor(st, filt);
      const extra = filt === 'you' && ks.length ? listFor(st, 'all').length - ks.length : 0;
      const sig = [st, t, filt, noFit, ks.join(), extra, typeof craftItem, typeof canCraft].join('|');
      if (sig !== rec.sig) {
        rec.sig = sig; rec.rows = {};
        rec.list.textContent = '';
        if (noFit) rec.list.append(el('p', 'note cf-nofit', `Nothing at the ${CRAFT_STATIONS[st].n} is made for your class, so this shows everything here.`));
        else if (!ks.length) rec.list.append(el('p', 'note', `Nothing at the ${CRAFT_STATIONS[st].n} yet.`));
        for (const k of ks) { const row = recipeRow(k, t); rec.rows[k] = { row, sig: rowSig(k, t) }; rec.list.append(row); }
        if (extra > 0) rec.list.append(el('p', 'note', `${extra} more recipe${extra > 1 ? 's' : ''} here for other classes. Choose All to see them.`));
      } else {
        for (const k of ks) {
          const r = rec.rows[k], rs = rowSig(k, t);
          if (!r || r.sig === rs) continue;
          const row = recipeRow(k, t); r.row.replaceWith(row); r.row = row; r.sig = rs;
        }
      }
      if (!ks.length) return;
      if (!rec.list.querySelector('#forgeBtn')) { const b = rec.list.querySelector('.cf-go'); if (b) b.id = 'forgeBtn'; }
    }
  });
  // Everything recipeRow(k, t) shows that can change while the list stays the same.
  function rowSig(k, t) {
    const can = canDo(k, t), mw = mwFor(k);
    const cost = Object.entries(kindCost(k, t)).map(([f, n]) => { const h = matOwn(f, t); return fmt(h) + (h < n ? '<' : '/') + fmt(n); }).join();
    return JSON.stringify([can.ok, can.why || '', st8.focus === k, subFor(k), beats(k, t), cost, mw, mw != null ? troph()[mw] || 0 : 0, CRAFT_KINDS[k].role === 'any' ? roleFor(k) : '', oddsTxt(k), safe(() => { const o = skillTierOpen(skillOfSt(CRAFT_KINDS[k].st), t) && shortOffer(kindCost(k, t), t); return o ? o.txt : ''; }, '')]);
  }

  // ================= Enchanter's Table extras =================
  let ench = null;
  function doTransmute(fam, t, toT) {
    const f = K6.transmute(); if (!f) return;
    // Within one family (spec 3.5): the third argument repeats the family, the fourth is the
    // target tier (t + 1 = four up into one, t - 1 = one down into two).
    act(() => f(fam, t, fam, toT));
  }
  registerSection('forge', {
    id: 'craft-ench', title: "Enchanter's Table",
    mount(sec) {
      const card = el('div', 'card cf-tm');
      card.append(el('h3', null, 'Transmute'), el('p', 'note', 'Trade within one material. 4 of a tier make 1 of the next. 1 makes 2 of the tier below, once: what you break down cannot be broken down again.'));
      const fams = el('div', 'cf-fams'); fams.setAttribute('aria-label', 'Material');
      for (const f of CRAFT_FAMILIES.filter(x => x !== 'ess')) {   // Essence pays at any grade: no Transmute
        const b = el('button', 'cf-fam'); b.type = 'button'; b.dataset.f = f; b.setAttribute('aria-label', MAT[f].n);
        b.append(img(matIcon(f, 1)), el('span', null, MAT[f].n));
        b.addEventListener('click', () => { st8.tm.fam = f; ui(true); });
        fams.append(b);
      }
      const tiers = el('div', 'cf-tmt');
      for (let t = 1; t <= 5; t++) {
        const b = el('button', 'cf-tmc'); b.type = 'button'; b.dataset.t = t;
        b.append(img(matIcon('ore', 1)), el('b'), el('small'));
        b.addEventListener('click', () => { st8.tm.t = t; ui(true); });
        tiers.append(b);
      }
      const acts = el('div', 'cf-tma');
      const upB = el('button', 'mini go'); upB.type = 'button';
      const dnB = el('button', 'mini'); dnB.type = 'button';
      upB.addEventListener('click', () => doTransmute(st8.tm.fam, st8.tm.t, st8.tm.t + 1));
      dnB.addEventListener('click', () => doTransmute(st8.tm.fam, st8.tm.t, st8.tm.t - 1));
      acts.append(upB, dnB);
      const why = el('p', 'note cf-why');
      card.append(fams, tiers, acts, why);
      const star = el('div', 'card cf-star'); star.hidden = true;
      sec.append(card, star);
      ench = { sec, fams, tiers, upB, dnB, why, star, sig: '' };
    },
    update(force) {
      initState();
      putHidden(ench.sec, st8.st !== 'ench');
      if (ench.sec.hidden) return;
      const { fam, t } = st8.tm, have = S.mats[fam], f = K6.transmute(), lv = lvOf('ench');
      const sig = [fam, t, have.join(), JSON.stringify((S.craft && S.craft.tmd) || {}), lv, !!f, typeof craftStarChart, S.craft && S.craft.starChart].join('|');
      if (!force && (sig === ench.sig || busy())) return;
      ench.sig = sig;
      ench.fams.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === fam)));
      ench.tiers.querySelectorAll('button').forEach(b => {
        const i = +b.dataset.t;
        b.setAttribute('aria-pressed', String(i === t));
        b.querySelector('img').src = matIcon(fam, i);
        b.querySelector('b').textContent = fmt(have[i - 1]);
        b.querySelector('small').textContent = MAT[fam].short[i - 1];
      });
      const nm = i => MAT[fam].short[i - 1];
      const U = CRAFT_TRANSMUTE.up, D = CRAFT_TRANSMUTE.down;
      ench.upB.textContent = t < 5 ? `${U.take} ${nm(t)} → ${U.give} ${nm(t + 1)}` : 'Top tier';
      ench.dnB.textContent = t > 1 ? `${D.take} ${nm(t)} → ${D.give} ${nm(t - 1)}` : 'Lowest tier';
      const upReq = t < 5 ? CRAFT_STATION_REQ[t] : 0;
      const upShut = t < 5 && !skillTierOpen('ench', t + 1);
      ench.upB.disabled = !f || t >= 5 || have[t - 1] < U.take || upShut;
      const dn = f && t > 1 && have[t - 1] >= D.take ? canTransmute(fam, t, t - 1) : null;
      ench.dnB.disabled = !f || t <= 1 || have[t - 1] < D.take || !(dn && dn.ok);
      ench.why.textContent = !f ? 'Transmute opens with the next crafting update.' : upShut ? `Trading up to ${nm(t + 1)} needs Enchanting Lv ${upReq}.` : dn && !dn.ok ? dn.why : '';
      // Star Chart (Oriel's recruit route): a recipe when K6 defines it as a kind or an action.
      const sc = K6.starChart(), made = !!(S.craft && S.craft.starChart);
      ench.star.hidden = true;   // no Oriel to draw yet (she is a hero to unlock later), so no Star Chart recipe
      if (!ench.star.hidden) {
        ench.star.textContent = '';
        ench.star.append(el('h3', null, 'Star Chart'), el('p', 'note', made ? 'You made the Star Chart. Oriel Vess has seen it.' : "Chart the sky to draw Oriel Vess, the Starcaller, to your camp."));
        if (!made) {
          const b = el('button', 'big forge', 'Craft the Star Chart'); b.type = 'button';
          b.addEventListener('click', () => act(() => sc()));
          ench.star.append(b);
        }
      }
    }
  });

  // ================= Your gear =================
  let gearEls = null;
  // Gear and the bag show on the Hero tab's Gear view (cal-0107-gear-and-rates); Craft is for making.
  registerSection('party', {
    id: 'craft-gear', title: 'Your gear', view: 'gear',
    mount(sec) {
      const g = el('div', 'cf-gear');
      gearEls = {};
      for (const p of CRAFT_HERO_POS.filter(craftKindVisible)) {
        const b = el('button', 'cf-gs'); b.type = 'button';
        const tile = icTile(iconURL('charm', '#4E4060'), null, 'ghost');
        const lab = el('small', null, posName(p));
        const plus = el('span', 'cf-plus');
        tile.append(plus);
        b.append(tile, lab);
        b.addEventListener('click', () => { const id = S.equip[p]; if (id != null && itemById(id)) openItem(id); else pick('hero', p); });
        g.append(b); gearEls[p] = { b, tile, plus };
      }
      sec.append(g);
      gearEls.sig = '';
    },
    update(force) {
      const sig = JSON.stringify(S.equip) + S.items.length + heroWho() + S.items.reduce((a, i) => a + i.plus, 0);
      if (!force && sig === gearEls.sig) return;
      gearEls.sig = sig;
      const EMPTY_IC = { weapon: 'sword', off: 'banner', helm: 'helm', body: 'plate', charm: 'charm', pick: 'pick', axe: 'axe', sickle: 'sickle' };
      const w = heroWho();
      if (w !== 'any') for (const p of ['weapon', 'helm']) { const k = ((CRAFT_FITS[p] || {})[w] || [])[0]; if (k && ICON[CRAFT_KINDS[k].ic]) EMPTY_IC[p] = CRAFT_KINDS[k].ic; }
      for (const p of CRAFT_HERO_POS.filter(craftKindVisible)) {
        const e = gearEls[p], it = itemById(S.equip[p]);
        if (it) { setIc(e.tile, itemIc(it), frameOf(it)); e.plus.textContent = it.plus ? '+' + it.plus : ''; e.b.setAttribute('aria-label', `${posName(p)}: ${itemName(it)}`); setTip(e.b, () => tipItem(itemById(S.equip[p]))); }
        else {
          const ic = EMPTY_IC[p]; setIc(e.tile, ICON[ic] ? iconURL(ic, '#6E6080') : iconURL('charm', '#6E6080'), null, 'ghost soon');
          e.plus.textContent = ''; e.b.setAttribute('aria-label', `${posName(p)}: empty. Choose gear.`); setTip(e.b, null);
        }
      }
    }
  });

  // ================= Bag =================
  let bag = null;
  const bulk = { on: false, ids: new Set(), armed: '', note: '' };
  const spareRank = (a, b) => a.t - b.t || a.plus - b.plus || itemMult(a) - itemMult(b);
  function salvageable() {
    const worn = equippedIds(), counts = new Map();
    for (const it of S.items) counts.set(it.id, (counts.get(it.id) || 0) + 1);
    return S.items.filter(it => !it.u && !worn.has(it.id) && counts.get(it.id) === 1);
  }
  function spareIds() {
    const best = new Map();
    for (const it of S.items) {
      const old = best.get(it.slot);
      if (!old || spareRank(it, old) > 0 || (spareRank(it, old) === 0 && it.id < old.id)) best.set(it.slot, it);
    }
    return salvageable().filter(it => {
      const worn = itemById(S.equip[kindPos(it.slot)]);
      return worn ? spareRank(it, worn) <= 0 : best.get(it.slot).id !== it.id;
    }).map(it => it.id);
  }
  function bulkQuote() {
    const list = salvageable().filter(it => bulk.ids.has(it.id)), mats = {}, possible = {};
    for (const it of list) {
      const row = mats[it.t] || (mats[it.t] = {});
      for (const [f, n] of Object.entries(salvagePreview(it))) row[f] = (row[f] || 0) + n;
      if (Array.isArray(it.a) && it.a.length) possible[it.t] = (possible[it.t] || 0) + 1;
    }
    const room = Object.entries(mats).flatMap(([t, row]) => Object.keys(row).map(f => [f, +t, stashRoom(f, +t)]));
    for (const t of Object.keys(possible)) if (!room.some(([f, tier]) => f === 'ess' && tier === +t)) room.push(['ess', +t, stashRoom('ess', +t)]);
    const full = room.some(([f, t, n]) => ((mats[t] || {})[f] || 0) + (f === 'ess' ? possible[t] || 0 : 0) > n);
    // Ordinary gathering must not reset a review while all returns still fit. Only a
    // change in what this batch can actually collect changes its capacity signature.
    const collectible = room.map(([f, t, n]) => [f, t, Math.min(n, ((mats[t] || {})[f] || 0) + (f === 'ess' ? possible[t] || 0 : 0))]);
    return { list, mats, possible, full, sig: JSON.stringify([list, mats, collectible, S.equip]) };
  }
  function bulkChanged() { bulk.armed = ''; bulk.note = ''; ui(true); }
  function renderBulk() {
    const q = bulkQuote(), valid = new Set(q.list.map(it => it.id));
    bulk.ids = valid;
    if (bulk.armed && bulk.armed !== q.sig) { bulk.armed = ''; bulk.note = 'Your bag or Storehouse changed. Review the selection again.'; }
    const sig = JSON.stringify([bulk.on, [...valid], bulk.armed, bulk.note, q.sig]);
    if (sig === bag.bulkSig) return;
    bag.bulkSig = sig;
    bag.select.textContent = bulk.on ? 'Done selecting' : 'Select';
    bag.select.setAttribute('aria-pressed', String(bulk.on));
    bag.review.hidden = !bulk.on; bag.review.disabled = !valid.size;
    bag.review.textContent = `Review ${valid.size} selected`;
    bag.bulk.textContent = ''; bag.bulk.hidden = !bulk.on;
    if (!bulk.on) return;
    if (bulk.note) bag.bulk.append(el('p', 'note', bulk.note));
    if (!bulk.armed) { bag.bulk.append(el('p', 'note', `${valid.size} selected. Tap items to change the selection. Worn items and uniques are protected.`)); return; }
    bag.bulk.append(el('p', null, `Salvage ${valid.size} items? They are gone for good. You get back about:`));
    for (const [t, row] of Object.entries(q.mats)) {
      const chips = el('div', 'costs');
      for (const [f, n] of Object.entries(row)) {
        const chip = el('span', 'cost'); chip.dataset.fam = f; chip.dataset.t = t; chip.dataset.amount = n;
        chip.append(img(matIcon(f, +t)), el('span', null, `${n.toLocaleString()} ${matName(f, +t)}`)); chips.append(chip);
      }
      bag.bulk.append(chips);
    }
    const gold = q.list.reduce((a, it) => a + craftUpgradeRefund(it), 0);
    if (gold) bag.bulk.append(el('p', 'note', `Their upgrades pay back ${fmt(gold)} gold.`));
    if (Object.keys(q.possible).length) bag.bulk.append(el('p', 'note', 'Affixed items may also return extra essence.'));
    if (q.full) bag.bulk.append(el('p', 'note warn', 'Your Storehouse is full for some of this. The rest is lost.'));
    const controls = el('div', 'cf-bulk-actions');
    const yes = el('button', 'mini cf-arm', `Salvage ${valid.size} items`); yes.type = 'button'; yes.classList.add('cf-bulk-confirm');
    yes.addEventListener('click', () => {
      const now = bulkQuote();
      if (now.sig !== bulk.armed) { bulk.armed = ''; bulk.note = 'Your bag or Storehouse changed. Review the selection again.'; ui(true); return; }
      // The core saves and toasts once; do not wrap this batch in act(), which also saves.
      salvageItems(now.list.map(it => it.id));
      bulk.ids.clear(); bulk.on = false; bulk.armed = ''; bulk.note = ''; ui(true); bag.select.focus();
    });
    const no = el('button', 'mini', 'Keep selecting'); no.type = 'button'; no.addEventListener('click', bulkChanged);
    controls.append(yes, no); bag.bulk.append(controls);
  }
  const SORTS = { power: (a, b) => itemPower(b) - itemPower(a) || b.id - a.id, new: (a, b) => b.id - a.id, kind: (a, b) => (kindOrder(a.slot) - kindOrder(b.slot)) || itemPower(b) - itemPower(a) };
  registerSection('party', {
    id: 'craft-bag', title: 'Bag', view: 'gear',
    mount(sec) {
      const head = sec.querySelector('.sec-title');
      const hw = el('div', 'sec-head'); sec.insertBefore(hw, head);
      const count = el('span', 'note cf-count'); count.id = 'bagCount';
      hw.append(head, count);
      hw.classList.add('cf-baghead');
      const select = el('button', 'mini cf-bulk-select', 'Select'); select.type = 'button';
      select.addEventListener('click', () => { bulk.on = !bulk.on; bulk.ids.clear(); bulkChanged(); });
      const spares = el('button', 'mini cf-bulk-spares', 'Salvage spares'); spares.type = 'button';
      spares.addEventListener('click', () => { bulk.on = true; st8.bfilt = 'all'; bulk.ids = new Set(spareIds()); bulkChanged(); });
      const review = el('button', 'mini cf-bulk-review', 'Review selection'); review.type = 'button'; review.hidden = true;
      review.addEventListener('click', () => { const q = bulkQuote(); if (!q.list.length) return; bulk.armed = q.sig; bulk.note = ''; ui(true); });
      hw.append(select, spares, review);
      const bulkBox = el('div', 'cf-bulk'); bulkBox.hidden = true; bulkBox.setAttribute('aria-live', 'polite');
      const ctl = el('div', 'cf-bagctl');
      const filt = el('div', 'seg cf-seg'); filt.setAttribute('aria-label', 'Show');
      for (const [f, n] of [['all', 'All'], ['spare', 'Spare'], ['worn', 'Worn']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.f = f;
        b.addEventListener('click', () => { st8.bfilt = f; ui(true); }); filt.append(b);
      }
      const sort = el('div', 'seg cf-seg'); sort.setAttribute('aria-label', 'Sort by');
      for (const [f, n] of [['power', 'Power'], ['new', 'New'], ['kind', 'Slot']]) {
        const b = el('button', null, n); b.type = 'button'; b.dataset.s = f;
        b.addEventListener('click', () => { st8.sort = f; ui(true); }); sort.append(b);
      }
      ctl.append(filt, sort);
      const grid = el('div', 'cf-bag');
      const note = el('p', 'note');
      sec.append(ctl, bulkBox, grid, note);
      bag = { count, filt, sort, grid, note, select, review, bulk: bulkBox, sig: '' };
    },
    update(force) {
      renderBulk();
      const n = bagCount();
      putText(bag.count, `${n} / ${CRAFT_BAG_MAX} spare`);
      putToggle(bag.count, 'full', n >= CRAFT_BAG_MAX);
      for (const b of bag.filt.children) putAttr(b, 'aria-pressed', String(b.dataset.f === st8.bfilt));
      for (const b of bag.sort.children) putAttr(b, 'aria-pressed', String(b.dataset.s === st8.sort));
      const w = wearers(), eligible = new Set(salvageable().map(it => it.id));
      const sig = [bulk.on, [...bulk.ids].join(), st8.bfilt, st8.sort, S.items.map(i => [i.id,i.slot,i.t,i.plus,i.r,i.u,i.rf || 0,i.g].join(':')).join(), [...w].map(([k, v]) => k + v.who).join(), [...st8.fresh].join()].join('|');
      if (!force && (sig === bag.sig || busy())) return;
      bag.sig = sig;
      let list = S.items.filter(it => craftKindVisible(it.slot));
      if (st8.bfilt === 'spare') list = list.filter(i => !w.has(i.id));
      if (st8.bfilt === 'worn') list = list.filter(i => w.has(i.id));
      list.sort(SORTS[st8.sort]);
      bag.grid.textContent = '';
      if (!list.length && S.items.length && st8.bfilt !== 'all') {
        const e = el('p', 'note cf-bagnone', st8.bfilt === 'spare' ? 'No spare gear. Everything you own is worn. Choose All to see it.' : 'Nothing worn yet.');
        bag.grid.append(e);
      }
      for (const it of list) {
        const b = el('button', 'ic cf-tile f-' + frameOf(it) + (st8.fresh.has(it.id) ? ' fresh' : '')); b.type = 'button';
        b.append(img(itemIc(it)));
        b.append(el('span', 'cf-gr rar-' + it.r, itemQualShort(it)));
        if (it.plus) b.append(el('span', 'cf-plus', '+' + it.plus));
        const wr = w.get(it.id);
        if (wr) { const bd = img(portraitOf(wr.who), 'cf-badge' + (wr.who === 'hero' ? ' hero' : '')); b.append(bd); }
        b.dataset.itemId = it.id;
        b.setAttribute('aria-label', `${itemName(it)}, ${itemQual(it)}${wr ? ', worn by you' : ''}${it.u ? ', unique' : ''}`);
        setTip(b, () => tipItem(itemById(it.id)));   // desktop-tooltips
        if (bulk.on) {
          b.disabled = !eligible.has(it.id);
          b.setAttribute('aria-pressed', String(bulk.ids.has(it.id)));
          if (bulk.ids.has(it.id)) b.append(el('span', 'cf-selected', '✓'));
        }
        b.addEventListener('click', () => {
          if (bulk.on) { if (!salvageable().some(i => i.id === it.id)) return; if (bulk.ids.has(it.id)) bulk.ids.delete(it.id); else bulk.ids.add(it.id); bulkChanged(); bag.grid.querySelector('[data-item-id="' + it.id + '"]')?.focus(); }
          else { st8.fresh.delete(it.id); openItem(it.id); }
        });
        bag.grid.append(b);
      }
      bag.note.textContent = !S.items.length ? 'Crafted gear and boss loot land here.' : !list.length ? 'Nothing here with this filter.' : n >= CRAFT_BAG_MAX ? 'Your bag is full. New loot gets salvaged. Salvage spare items to make room.' : 'Worn items have a portrait badge and do not count toward the bag.';
    }
  });
  // Uniques wall goes last (73-ui-forge keeps it).
  { const tw = $('trophies'); const sec = tw && tw.closest('.sec'); if (sec) $('p-forge').append(sec); }

  // ================= item sheet =================
  let sheet = null, switching = false;
  function open(label, back, small) {
    switching = true;
    const api = openSheet(() => {}, { label, small, dock: true, onClose: quiet => { if (sheet && sheet.api === api) sheet = null; if (!switching && !quiet && back) setTimeout(() => safe(back), 0); } });
    switching = false;
    api.sheet.classList.add('cf-sheet');
    return api;
  }
  function openItem(id, back) {
    const it = itemById(id); if (!it || !craftKindVisible(it.slot)) return;
    const api = open(itemName(it), back || (sheet && sheet.back));
    api.sheet.classList.add('cf-isheet');   // landscape: two columns (80-landscape.css)
    sheet = { api, id, back: back || null, mode: null, sel: -1, arm: null, flash: -1, pick: null };
    renderItem();
  }
  const secBox = (title, ...kids) => { const s = el('div', 'cf-ss'); if (title) s.append(el('h4', null, title)); s.append(...kids); return s; };
  function trophChip(need) {
    const have = trophTotal(), c = el('span', 'cost' + (have < need ? ' short' : ''));
    c.append(img(troIcon(0)), el('span', null, `${have}/${need} Trophy (any)`)); setTip(c, () => tipCost('Trophies (any)', trophTotal(), need));
    return c;
  }
  function salvagePreview(it) {
    const d = itemKind(it), m = {};
    for (const [k, n] of Object.entries(d.rec)) { const v = Math.floor(n * (1 + 0.5 * (it.t - 1)) * 0.4 * (1 + it.plus * 0.3) * mod('salvage')); if (v > 0) m[k] = v; }
    if (it.u) m.ess = (m.ess || 0) + 10;
    return m;
  }
  function renderItem() {
    if (!sheet || sheet.api.closed) return;
    const it = itemById(sheet.id);
    if (!it) { const a = sheet.api; sheet = null; a.close(); return; }
    const d = itemKind(it), body = sheet.api.body, foot = sheet.api.foot, top = body.scrollTop;
    body.textContent = ''; foot.textContent = '';
    const wr = wornBy(it.id);
    // ---- head ----
    const head = el('div', 'cf-ih cf-ihbig');
    const tile = icTile(itemIc(it), frameOf(it)); tile.classList.add('s104');
    const who = el('div', 'cf-ihw');
    who.append(el('h3', 'cf-in rar-' + it.r, itemName(it)));
    const meta = [itemQual(it), `Tier ${it.t}`, d ? (it.u ? posName(d.pos) : d.noun + (d.legacy ? ' (old style)' : '')) : ''].filter(Boolean).join(' · ');
    who.append(el('div', 'cf-im', meta));
    const fit = [];
    if (d && d.pos) fit.push(heroFitsIt(it) ? `${posName(d.pos)} for you` : `${posName(d.pos)} for ${d.cls && HERO_CLASSES[d.cls] ? 'a ' + HERO_CLASSES[d.cls].name : 'a hero with no class'}`);
    who.append(el('div', 'cf-im', fit.join(' · ') + ` · Power ${fmt(itemPower(it))}`));
    if (wr) { const wb = el('div', 'cf-worn'); wb.append(img(portraitOf()), el('span', null, `You wear it (${posName(wr.pos)})`)); who.append(wb); }
    head.append(tile, who); body.append(head);

    // ---- lines ----
    const lines = el('div', 'cf-lines');
    let anyWait = false;
    for (const L of splitLines(it)) {
      const r = el('div', 'cf-line g-' + L.g + (sheet.flash === L.idx && L.g === 'affix' ? ' flash' : ''));
      if (L.g === 'uniq') { r.append(el('span', 'cf-lt' + (L.lore ? ' cf-lore' : ''), L.txt)); lines.append(r); continue; }
      const liveNow = lineLive(L.l);
      if (!liveNow) { r.classList.add('wait'); anyWait = true; }
      if (L.g === 'mw') r.append(img(troIcon(it.mw), 'cf-li'));
      const tx = el('span', 'cf-lt', lineTxt(L.l));
      r.append(tx);
      if (L.g === 'mw') r.append(el('small', 'cf-tag', 'Masterwork'));
      else if (L.g === 'affix') r.append(el('small', 'cf-tag', 'Bonus'));
      if (!liveNow) r.append(el('small', 'cf-wait', '(not active yet)'));
      lines.append(r);
    }
    if (!lines.children.length) lines.append(el('p', 'note', 'No stats.'));
    body.append(secBox('What it does', lines));
    const tlb = typeof toolsUI === 'object' && toolsUI ? safe(() => toolsUI.itemBox(it), null) : null;   // tool mastery (75-tools-ui, H2)
    if (tlb) body.append(tlb);
    if (anyWait) body.append(el('p', 'note', 'Dimmed lines do nothing yet. Coming soon.'));

    // ---- compare ----
    if (d && d.pos && heroFitsIt(it) && !(wr && wr.who === 'hero')) {
      const cur = itemById(S.equip[d.pos]);
      const box = el('div', 'cf-cmp');
      if (!cur) box.append(el('p', 'note', `You wear nothing as ${posName(d.pos)}. Everything above is a gain.`));
      else {
        box.append(el('p', 'note', `Against your ${itemName(cur)}:`));
        const a = itemStats(it), b = itemStats(cur), keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => CRAFT_STATS[k]);
        const pd = itemPower(it) - itemPower(cur);
        const rows = el('div', 'cf-dl');
        const addD = (label, v, txt) => { const r = el('div', 'cf-d ' + (v > 0 ? 'up' : 'dn')); r.append(el('span', null, label), el('b', null, txt)); rows.append(r); };
        if (Math.abs(pd) >= 0.05) addD('Power', pd, (pd > 0 ? '+' : '-') + fmt(Math.abs(pd)));
        for (const k of keys) { const v = (a[k] || 0) - (b[k] || 0); if (Math.abs(v) >= 0.05) addD(CRAFT_STATS[k].n + (CRAFT_STATS[k].live ? '' : '*'), v, deltaTxt(k, v)); }
        if (!rows.children.length) rows.append(el('p', 'note', 'Same stats.'));
        box.append(rows);
        if (it.u || cur.u) box.append(el('p', 'note', 'Unique effects are not in this list.'));
        if (keys.some(k => !CRAFT_STATS[k].live)) box.append(el('p', 'note', '* not active yet'));
      }
      body.append(secBox('Compare', box));
    }

    // ---- wear: equip, give, take off ----
    const wear = [];
    if (d && d.pos && heroFitsIt(it)) {
      const b = el('button', 'big forge cf-act', wr && wr.who === 'hero' ? 'You wear it' : 'Equip'); b.type = 'button';
      b.disabled = !!(wr && wr.who === 'hero');
      b.addEventListener('click', () => equipHero(it.id, d.pos));
      wear.push(b);
    }
    if (wear.length) { const r = el('div', 'cf-wear'); r.append(...wear); foot.append(r); }

    // ---- upgrade ----
    const upBox = el('div', 'cf-up-box');
    if (it.plus >= 10) upBox.append(el('p', 'note', 'Fully upgraded (+10).'));
    else {
      const c = kindUpgradeCost(it), chips = el('div', 'costs');
      costChips(chips, c.mats, it.t, c.gold);
      if (c.troph) chips.append(trophChip(c.troph));
      upBox.append(el('p', 'note cf-next', nextPlusTxt(it)), chips);   // craft-shortfall-offer: the main line's change, not a bare power number
      const f = K6.upgrade(), heroPos = wr && wr.who === 'hero' ? wr.pos : null;
      {
        let sr = shortRow(c.mats, it.t, renderItem), coverWhy = '';
        // upgrade-gold-covers-short: gold may pay the material the piece is short, as the row's second button after the free
        // refine order ("Upgrade: 340 + 270 gold for 3 Pine Planks"). Never on a craft, and only once the material is reachable.
        const cv = f && typeof upgradeCover === 'function' ? safe(() => upgradeCover(it), null) : null;
        if (cv) {
          if (!sr) { sr = el('div', 'cf-src cf-short'); sr.append(el('span', null, `Short ${storeNum(cv.units)} ${midName(cv.fam, it.t, cv.units)}. `)); }
          const g = el('button', 'mini cf-cover', `Upgrade: ${storeNum(c.gold)} + ${storeNum(cv.gold)} gold for ${storeNum(cv.units)} ${midName(cv.fam, it.t, cv.units)}`); g.type = 'button';
          const can = safe(() => canUpgrade(it.id, undefined, { cover: true }), null);
          g.disabled = !(can && can.ok);
          if (can && !can.ok && can.why) coverWhy = `To cover them: ${can.why[0].toLowerCase() + can.why.slice(1)}.`;   // said on screen: a title never shows on a phone
          g.addEventListener('click', () => { const n0 = upCount(); if (act(() => f(it.id, undefined, { cover: true })) && n0 === 0 && upCount() === 1) emit('firstUse', 'upgrade'); renderItem(); });
          sr.append(' ', g);
        }
        if (sr) upBox.append(sr);
        if (coverWhy) upBox.append(el('p', 'note cf-cover-why', coverWhy));
      }
      const okMats = hasMats(c.mats, it.t) && S.gold >= c.gold && (!c.troph || (f && trophTotal() >= c.troph));
      const b = el('button', 'big forge cf-act', `Upgrade to +${it.plus + 1}`); b.type = 'button';
      b.disabled = !okMats || (!f && !heroPos);
      b.addEventListener('click', () => { const n0 = upCount(); if (act(() => (f ? f(it.id) : upgradeEquipped(heroPos))) && n0 === 0 && upCount() === 1) emit('firstUse', 'upgrade'); renderItem(); });   // craft-delta: the first upgrade ever (S.deeds.n.up)
      upBox.append(b);
      if (!f && !heroPos) upBox.append(el('p', 'note', 'Equip it to upgrade it.'));
      else if (c.troph && !f) upBox.append(el('p', 'note', 'Trophy upgrades open with the next crafting update.'));
      else if (c.troph) upBox.append(el('p', 'note', 'From +8, each upgrade also takes a Trophy. Champions drop them.'));   // gold-without-training
    }
    if (it.plus > 0) upBox.append(el('p', 'note', `Salvage it to get back ${fmt(craftUpgradeRefund(it))} gold, half what its upgrades cost.`));   // gold-without-training
    body.append(secBox('Upgrade', upBox));

    // ---- reforge ----
    if (Array.isArray(it.a) && it.a.length) body.append(secBox('Reforge a line', reforgeBox(it)));

    // ---- salvage ----
    const sv = el('div', 'cf-sv');
    if (wr) sv.append(el('p', 'note', 'You wear this. Equip something else before you salvage it.'));
    else if (sheet.arm === 'salvage') {
      const chips = el('div', 'costs'); costChips(chips, salvagePreview(it), it.t, craftUpgradeRefund(it));   // gold: half its upgrades' gold
      chips.querySelectorAll('.cost').forEach(c => { c.classList.remove('short'); const s = c.querySelector('span'); s.textContent = '+' + s.textContent.replace(/^[^/]*\//, ''); });
      sv.append(el('p', 'note warn', `Salvage ${itemName(it)}? It is gone for good. You get back about:`), chips);
      if (it.plus >= CRAFT_TROPHY_GATE.from) sv.append(el('p', 'note warn', 'The Trophies its upgrades took do not come back.'));
      const room = storeSalvageNote(salvagePreview(it), it.t); if (room) sv.append(el('p', 'note warn', room));   // H3: the Storehouse cap
      const r = el('div', 'cf-wear');
      const yes = el('button', 'big cf-act', 'Salvage it'); yes.type = 'button';
      const no = el('button', 'big cf-act cf-keep', 'Keep it'); no.type = 'button';
      yes.addEventListener('click', () => { const id = it.id; if (act(() => salvageItem(id))) { st8.fresh.delete(id); } renderItem(); });
      no.addEventListener('click', () => { sheet.arm = null; renderItem(); });
      r.append(no, yes); sv.append(r);
    } else {
      const b = el('button', 'mini warn cf-svb', 'Salvage'); b.type = 'button';
      b.addEventListener('click', () => { sheet.arm = 'salvage'; renderItem(); });
      sv.append(b);
    }
    body.append(secBox('Salvage', sv));
    body.scrollTop = top;
    sheet.flash = -1; // the reforged line flashes once
  }
  function reforgeBox(it) {
    const box = el('div', 'cf-rf');
    const f = K6.reforge(), cost = safe(() => reforgeCost(it), null), req = CRAFT_STATION_REQ[it.t - 1];
    // craft-attribute-grades: a graded piece's Reforge is a pick: the line to swap, then the bonus to put in (same price, no die)
    const graded = itemGraded(it), choices = graded ? safe(() => reforgeChoices(it), []) : [];
    box.append(el('p', 'note', (graded ? `At the Enchanter's Table. Pick a bonus line, then the bonus to put in its place. Grade and power stay.`
      : `At the Enchanter's Table. Pick one bonus line to reroll. Rarity and power stay.`) + (it.rf ? ` Reforged ${it.rf} time${it.rf > 1 ? 's' : ''}: the price grows each time.` : '')));
    const opts = el('div', 'cf-rfo'); opts.setAttribute('role', 'radiogroup'); opts.setAttribute('aria-label', 'Line to reforge');
    const parts = splitLines(it).filter(L => L.g === 'affix');
    for (const L of parts) {
      const b = el('button', 'cf-rfl'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(sheet.sel === L.idx));
      b.append(el('i'), el('span', null, lineTxt(L.l)));
      b.addEventListener('click', () => { sheet.sel = L.idx; sheet.arm = null; renderItem(); });
      opts.append(b);
    }
    box.append(opts);
    if (graded && !choices.includes(sheet.pick)) sheet.pick = null;
    if (graded && sheet.sel >= 0 && choices.length) {
      box.append(el('p', 'note', 'Put in:'));
      const pk = el('div', 'cf-rfo cf-rfpick'); pk.setAttribute('role', 'radiogroup'); pk.setAttribute('aria-label', 'Bonus to put in');
      for (const id of choices) {
        const b = el('button', 'cf-rfl'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(sheet.pick === id)); b.dataset.pick = id;
        b.append(el('i'), el('span', null, safe(() => lineTxt(craftAffixValue(id, itemPower(it), 0.5)), id)));
        b.addEventListener('click', () => { sheet.pick = id; sheet.arm = null; renderItem(); });
        pk.append(b);
      }
      box.append(pk);
    }
    if (graded && !choices.length) box.append(el('p', 'note', 'This piece already has every bonus it can take.'));
    if (cost) { const chips = el('div', 'costs'); costChips(chips, cost.mats, it.t, cost.gold); box.append(chips); }
    const ok = f && cost && sheet.sel >= 0 && (!graded || sheet.pick != null) && skillTierOpen('ench', it.t) && hasMats(cost.mats, it.t) && S.gold >= cost.gold;
    const armed = sheet.arm === 'reforge';
    const b = el('button', 'big cf-act ' + (armed ? 'cf-arm' : 'forge'), !f ? 'Reforge opens soon' : sheet.sel < 0 ? 'Pick a line to reforge' : graded && sheet.pick == null ? 'Pick the bonus to put in' : armed ? 'Confirm: reforge' : 'Reforge this line'); b.type = 'button';
    b.disabled = !ok;
    b.addEventListener('click', () => {
      if (!armed) { sheet.arm = 'reforge'; renderItem(); return; }
      const idx = sheet.sel, pick = sheet.pick; sheet.arm = null;
      if (act(() => f(it.id, idx, graded ? pick : undefined))) { sheet.flash = idx; sheet.pick = null; }
      renderItem();
    });
    box.append(b);
    if (armed) { const c = el('button', 'mini', 'Cancel'); c.type = 'button'; c.addEventListener('click', () => { sheet.arm = null; renderItem(); }); box.append(c); }
    if (!f) box.append(el('p', 'note', 'Reforge opens with the next crafting update.'));
    else if (!skillTierOpen('ench', it.t)) box.append(el('p', 'note warn', `Needs Enchanting Lv ${req} for a tier ${it.t} item.`));
    return box;
  }
  function equipHero(id, pos) {
    act(() => equipItem(id, pos));
    renderItem();
  }

  // ================= picker: choose gear for one position =================
  function pick(pos, back) {
    if (!craftKindVisible(pos)) return;
    const label = `Your ${posName(pos).toLowerCase()}`;
    const backFn = back || null;
    const api = open(label, backFn, true);
    sheet = { api, id: null, back: backFn, picker: { pos } };
    const render = () => {
      if (!sheet || sheet.api !== api || api.closed) return;
      const body = api.body; body.textContent = '';
      const now = itemById(S.equip[pos]);
      body.append(el('h3', 'cf-ph', label));
      const w = wearers();
      const list = S.items.filter(i => craftKindVisible(i.slot) && fits(i, pos, 'hero') && !(now && now.id === i.id)).sort(SORTS.power);
      if (now) {
        const r = el('div', 'cf-pr cur');
        const t = icTile(itemIc(now), frameOf(now)); r.append(t);
        const tx = el('div', 'cf-gt'); tx.append(el('b', 'rar-' + now.r, itemName(now)), el('small', null, 'Worn now. Tap for details.'));
        r.append(tx);
        tx.addEventListener('click', () => openItem(now.id, backFn)); t.addEventListener('click', () => openItem(now.id, backFn));
        body.append(r);
      }
      if (!list.length) {
        const kinds = Object.keys(CRAFT_KINDS).filter(k => craftKindVisible(k) && !CRAFT_KINDS[k].legacy && fits(k, pos, 'hero'));
        const k = kinds[0];
        body.append(el('p', 'note', k ? `Nothing in your bag fits. Craft a ${CRAFT_KINDS[k].noun} at the ${CRAFT_STATIONS[CRAFT_KINDS[k].st].n}.` : 'Nothing in your bag fits here.'));
        // Gear opens before the Workbench on a cold Hearth: no Go to a station that is not built yet.
        const notYet = k && (safe(() => hearthStationWhy(CRAFT_KINDS[k].st), '') || (!featOk('craft') && 'Crafting opens soon.'));
        if (notYet) body.append(el('p', 'note', notYet));
        if (k && !notYet) {
          const b = el('button', 'big forge', `Go to the ${STATION_SHORT[CRAFT_KINDS[k].st]}`); b.type = 'button';
          b.addEventListener('click', () => { st8.st = CRAFT_KINDS[k].st; st8.filt = 'you'; st8.focus = k; sheet.back = null; switching = true; api.close(true); switching = false; setTab('make'); const t = $('forgeBtn'); if (t) t.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); });
          body.append(b);
        }
        return;
      }
      for (const it of list) {
        const r = el('div', 'cf-pr');
        const t = icTile(itemIc(it), frameOf(it));
        const tx = el('div', 'cf-gt');
        const dp = itemPower(it) - (now ? itemPower(now) : 0);
        const wr = w.get(it.id);
        tx.append(el('b', 'rar-' + it.r, itemName(it)));
        const sm = el('small', null, (wr ? 'You wear it · ' : ''));
        sm.append(el('span', 'cf-d ' + (dp > 0 ? 'up' : 'dn'), `${dp >= 0 ? '+' : '-'}${fmt(Math.abs(dp))} power`));
        tx.append(sm);
        t.addEventListener('click', () => openItem(it.id, backFn)); tx.addEventListener('click', () => openItem(it.id, backFn));
        const b = el('button', 'mini go', 'Equip'); b.type = 'button';
        b.addEventListener('click', () => {
          act(() => equipItem(it.id, pos));
          render();
        });
        r.append(t, tx, b); body.append(r);
      }
    };
    sheet.render = render;
    render();
  }

  // Keep an open sheet in step with the game (materials and gold change while it is open).
  let sheetSig = '', sheetAt = 0;
  onTick(() => {
    if (!sheet || sheet.api.closed || busy() || Date.now() - sheetAt < 1000) return;
    sheetAt = Date.now();
    const s = JSON.stringify(S.mats) + S.gold.toFixed(0) + S.items.length + JSON.stringify(S.equip) + troph().join() + (S.skills.ench && S.skills.ench.lv);
    if (s === sheetSig) return;
    sheetSig = s;
    if (sheet.picker) { if (sheet.render) safe(() => sheet.render()); } else safe(() => renderItem());
  });

  craftUI = { openItem: id => openItem(id), pick: (who, pos) => pick(pos) };
}
