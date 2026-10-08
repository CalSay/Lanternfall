// 75-combat2-ui: the fight's active-combat HUD (Core 2.0 slice S6-E; docs/design/combat-2.md 3.1, 3.9, 2.6).
// Browser file. Reads 59g's cbState() about 10 times a second and draws, over the stage:
//   - the warning banner: one at a time, word + shape + colour (PARRY !, DODGE >>, INTERRUPT ~, FINISHER *), a bar
//     with the answer window marked, a "wait" tick for an early dodge tap; DOM with aria-live (screen readers)
//   - the boss strip under the header: the gold stagger bar (10 segments), the cast name and its purple bar,
//     "Enrage in 0:12", the three lantern pips of the active reward (3.8); for a big pack, "6 of 9"
//   - the ability buttons' rims: purple while a boss casts its big move (interrupt now), gold while a Stagger or a
//     reaction window is open on the focus foe (hit now)
//   - haptics (a setting, on by default where the device has it), "Buttons on the left" (a setting) and "Wider timing
//     windows" (a setting for turn fights, S.turn.assist: 59k turnAssistX)
// Reduced motion: no pulses or sweeps (60-combat2.css); the banner appears in place.

{
  const box = $('stageBox'), stage = $('stage');
  const COPY = typeof BOSS_COPY === 'object' ? BOSS_COPY : { banner: {}, aria: {} };
  const WORD = COPY.banner, ARIA = COPY.aria;
  const GLYPH = { heavy: '!', zone: '>>', slam: '>>', sig: '~', heal: '+', summon: '~', fin: '★' };
  const KIND_CLASS = { heavy: 'k-parry', zone: 'k-dodge', slam: 'k-dodge', sig: 'k-intr', heal: 'k-intr', summon: 'k-intr', fin: 'k-fin' };

  // ---- the banner ----
  const ban = el('div', 'cb-banner'); ban.hidden = true;
  const bWord = el('b', 'cb-word'), bGlyph = el('span', 'cb-glyph'), bBar = el('span', 'cb-bar'), bFill = el('i', 'cb-fill'), bWin = el('i', 'cb-win'), bWait = el('span', 'cb-wait', 'wait');
  bBar.append(bWin, bFill); ban.append(bGlyph, bWord, bBar, bWait);
  const live = el('div', 'cb-sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status');
  // ---- the boss strip ----
  const strip = el('div', 'cb-strip'); strip.hidden = true;
  const sStag = el('span', 'cb-stag'), sStagF = el('i'), sCast = el('span', 'cb-cast'), sCastN = el('b'), sCastB = el('span', 'cb-castbar'), sCastF = el('i');
  const sEnr = el('span', 'cb-enr'), sPips = el('span', 'cb-pips'), sPack = el('span', 'cb-pack');
  sStag.append(sStagF); sCastB.append(sCastF); sCast.append(sCastN, sCastB);
  strip.append(sStag, sCast, sEnr, sPips, sPack);
  if (box) box.append(ban, strip, live);

  let lastAria = '', t = 0, btns = null;
  const setAria = s => { if (s !== lastAria) { lastAria = s; live.textContent = s; } };
  const pips = n => '●'.repeat(Math.min(3, n)) + '○'.repeat(Math.max(0, 3 - n));
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function update() {
    const fight = target() === 'mob' && typeof cbState === 'function' && typeof partyCombatOn === 'function' && partyCombatOn();
    const st = fight ? cbState() : null;
    // the banner: the Finisher first, then the answer warning showing
    let kind = '';
    if (st && st.fin.on) kind = 'fin';
    else if (st && st.tele.kind && WORD[st.tele.kind]) kind = st.tele.kind;
    putHidden(ban, !kind);
    if (kind) {
      putClass(ban, 'cb-banner ' + (KIND_CLASS[kind] || ''));
      putText(bWord, kind === 'fin' ? WORD.fin : kind === 'sig' || kind === 'summon' || kind === 'heal' ? (st.tele.name ? `${WORD[kind]} ${st.tele.name}` : WORD[kind]) : WORD[kind]);
      putText(bGlyph, GLYPH[kind] || '');
      const dur = kind === 'fin' ? 2.5 : st.tele.dur || 1, left = kind === 'fin' ? st.fin.left : st.tele.left;
      putStyle(bFill, 'transform', `scaleX(${Math.max(0, Math.min(1, left / dur)).toFixed(3)})`);
      putStyle(bWin, 'width', kind === 'fin' ? '0%' : `${Math.round(100 * Math.min(1, (st.tele.win || 0) / dur))}%`);
      putHidden(bWait, !(kind !== 'fin' && st.tele.wait > 0));
      setAria(kind === 'fin' ? ARIA.fin : (ARIA[kind] || WORD[kind]) + (st.tele.name && (kind === 'sig') ? ' ' + st.tele.name : ''));
    } else setAria('');
    // the boss strip (and the pack count for big packs)
    const boss = st && typeof fightBoss !== 'undefined' && fightBoss && mob && mob.boss;
    const packShow = st && !boss && st.packN > 0 && typeof cbPack === 'function' && cbPack().n > 3;
    putHidden(strip, !(boss || packShow));
    if (boss) {
      putHidden(sStag, false);
      putStyle(sStagF, 'transform', `scaleX(${st.stag.max ? Math.min(1, st.stag.v / st.stag.max).toFixed(3) : 0})`);
      putClass(sStag, st.stag.on ? 'cb-stag on' : 'cb-stag');
      const c = st.cast;
      putHidden(sCast, !c.kind || !c.foe || !c.foe.boss);
      if (c.kind) { putText(sCastN, c.name || ''); putStyle(sCastF, 'transform', `scaleX(${c.dur ? Math.max(0, Math.min(1, c.left / c.dur)).toFixed(3) : 0})`); putClass(sCast, 'cb-cast ' + (c.kind === 'hard' ? 'hard' : 'soft')); }
      putText(sPips, pips(st.ans)); sPips.title = 'Your own parries, dodges and interrupts: 3 earn +50% XP.';
      putHidden(sPips, false); putHidden(sEnr, true); putText(sPack, '');   // no Enrage timer (owner, 2026-10-01)
    } else if (packShow) {
      putHidden(sStag, true); putHidden(sCast, true); putHidden(sEnr, true); putHidden(sPips, true);
      putText(sPack, `${st.packN} of ${cbPack().n}`);
    }
    // the ability buttons' rims
    const hit = !!(st && st.rxWin), intr = !!(st && st.cast.kind === 'sig' && st.cast.foe && st.cast.foe.boss);
    if (!btns || !btns.length) btns = [...document.querySelectorAll('.stage .abil')];
    for (const b of btns) { if (b.classList.contains('cb-hit') !== (hit && !intr)) b.classList.toggle('cb-hit', hit && !intr); if (b.classList.contains('cb-intr') !== intr) b.classList.toggle('cb-intr', intr); }
  }
  onTick(dt => { t += dt; if (t < 0.1) return; t = 0; try { update(); } catch (e) { console.error('[lanternfall] combat HUD', e); } });

  // ---- haptics (a setting; try/catch, nothing when missing) ----
  const ANSWER = { heavy: 1, zone: 1, slam: 1, sig: 1, heal: 1, summon: 1 };
  const buzz = ms => { try { if (S.cb2 && S.cb2.haptic && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  on('telegraphStart', p => { if (p && ANSWER[p.kind]) buzz(20); });
  on('parry', p => { if (p && p.active) buzz(10); });
  on('dodge', () => buzz(10));
  on('interrupt', p => { if (p && p.active) buzz(10); });

  // ---- Buttons on the left (a setting) ----
  const side = () => { try { document.body.classList.toggle('cb-left', !!(S.cb2 && S.cb2.left)); } catch (e) {} };
  side();
  on('sceneReset', side);

  // ---- the settings rows (Settings > Combat) ----
  registerSection('log', {
    id: 'cb2set', title: 'Combat',
    mount(sec) {
      // st: the save object the setting lives in (S.cb2, or S.turn for the turn fight's Wider timing windows, 59k)
      const row = (label, key, note, st = () => S.cb2) => {
        const b = el('button', 'cb-toggle'); b.type = 'button';
        const put = () => { const on_ = !!(st() && st()[key]); b.textContent = `${label}: ${on_ ? 'On' : 'Off'}`; b.setAttribute('aria-pressed', on_ ? 'true' : 'false'); };
        b.addEventListener('click', () => { const o = st(); if (!o) return; o[key] = o[key] ? 0 : 1; put(); side(); save(); });
        put();
        const w = el('div', 'cb-set'); w.append(b, el('p', 'note', note));
        return w;
      };
      // Haptics and the left-thumb buttons are for touch screens: hidden with no touch pointer (60-combat2.css; desk playtest F14)
      const touch = w => { w.classList.add('touch-only'); return w; };
      sec.append(touch(row('Haptics', 'haptic', 'A short buzz when a warning starts, and when you answer it.')),
        touch(row('Buttons on the left', 'left', 'Moves the ability buttons to the left side, for your left thumb.')),
        row('Wider timing windows', 'assist', 'Gives you more time to parry and dodge, from your next fight. Rewards stay the same.', () => S.turn));
    },
    update() {}
  });
}
