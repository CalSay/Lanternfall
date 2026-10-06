// 75-intro-ui: the drawn opening (intro-and-picker; docs/design/first-hour.md beats 1 to 3). Browser-only; the logic is 55-story.js
// (storyIntro, storyIntroDone) and the words are 21k-story-hollow.js (STORY_BEATS.intro and the Chapter 1 region card).
//
// A new game plays two full screens, one line a tap, with Skip always on screen:
//   open  three lines over two stills (the lamp on its hook; the dark coming up through the moss), BEFORE the hero picker. It opens the picker
//         when it ends: 76-create asks introUI.gate() before it opens, and gate() starts this screen when it is due.
//   fire  Hesketh's roadside fire over the third still (the road at night), right AFTER the pick (the picker's `createDone`), then the game runs.
// The game is held while a screen is up (holdGame), so nothing fights behind it. Reduced motion: no fade, no flicker.
// Stills: INTRO_STILLS[id] (21k) is '' until the first-hour-art pack is vetted; each still then shows the approved Mossy Hollow night background
// (BG_ART.forest, 21zb), darkened, with the lamp icon (bible 10.3). A vetted still goes in the data as a URI and replaces all of that.
// Test pages (check.mjs's nostory key) skip it, like every story scene. API: introUI { gate() -> bool, open() }.
var introUI;   // var: 76-create (loaded after this file) reads it at run time
{
  const TEST_SKIP = (() => { try { return localStorage.getItem('lanternfall.test.nostory') === '1'; } catch (e) { return false; } })();
  if (!TEST_SKIP && typeof storyIntroClaim === 'function') storyIntroClaim();   // the engine leaves a new game's Chapter 1 card to this screen

  let root = null, part = '', data = null, i = 0, shownAt = 0, lastFocus = null, img = null;
  holdGame(() => !!root);

  const bgSrc = () => {
    const B = typeof BG_ART === 'object' && BG_ART.forest; if (!B) return '';
    const E = window.innerHeight > window.innerWidth ? B.port : B.land;
    return E && E.src ? 'data:image/webp;base64,' + E.src : '';
  };
  const stillArt = id => (typeof INTRO_STILLS === 'object' && INTRO_STILLS[id]) || '';
  const lamp = (cls, dead) => {
    const im = el('img', 'intro-lamp ' + cls); im.alt = '';
    im.src = dead ? iconURL('flame', '#6A6470', { 5: '#554F5E', 7: '#7B7586' }) : iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' });
    return im;
  };
  // one still: the vetted art, or the placeholder (the approved background, darkened, with the lamp icon)
  function still(id) {
    const d = el('div', 'intro-still s-' + id);
    const art = stillArt(id);
    if (art) { const im = el('img', 'intro-img art'); im.alt = ''; im.src = art; d.append(im); return d; }
    const im = el('img', 'intro-img'); im.alt = ''; im.src = bgSrc(); d.append(im);
    d.append(el('div', 'intro-shade'));
    if (id === 'lamp') d.append(lamp('lp-big'));
    else if (id === 'dark') d.append(lamp('lp-small'));
    else { d.append(lamp('lp-mine'), lamp('lp-dead', true)); }
    return d;
  }

  function build() {
    const n = data.beats ? data.beats.length : data.lines.length;
    root = el('div', 'intro'); root.id = 'introScreen';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', part === 'fire' ? 'Old Hesketh' : 'How the lamp came to you');
    const stage = el('div', 'intro-stage'); root.append(stage);
    const foot = el('div', 'intro-foot');
    const tx = el('div', 'intro-tx');
    const who = data.who ? el('p', 'intro-who', data.who) : null;
    const line = el('p', 'intro-line'); line.setAttribute('aria-live', 'polite');
    const dots = el('div', 'intro-dots'); dots.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < n; k++) dots.append(el('span'));
    if (who) tx.append(who);
    tx.append(line, dots);
    const go = el('button', 'big forge intro-go', 'Next'); go.type = 'button';
    foot.append(tx, go); root.append(foot);
    const skip = el('button', 'mini intro-skip', 'Skip'); skip.type = 'button';
    skip.setAttribute('aria-label', 'Skip this. It stays in the Journal.');
    root.append(skip);

    let cur = '';
    const draw = () => {
      const b = data.beats ? data.beats[i] : { still: data.still, line: data.lines[i] };
      if (b.still !== cur) { cur = b.still; stage.textContent = ''; stage.append(still(b.still)); }
      line.textContent = b.line;
      line.classList.remove('in'); if (!reduced) { void line.offsetWidth; line.classList.add('in'); }
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
      go.textContent = i === n - 1 ? 'Continue' : 'Next';
      shownAt = Date.now();
    };
    const advance = () => {
      if (Date.now() - shownAt < 250) return;   // a tap that opened this screen (or a double tap) does not skip a line
      if (i >= n - 1) end('done'); else { i++; draw(); }
    };
    go.addEventListener('click', e => { e.stopPropagation(); advance(); });
    skip.addEventListener('click', e => { e.stopPropagation(); end('skipped'); });
    root.addEventListener('click', advance);
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); end('skipped'); return; }
      if (e.key === 'ArrowRight' || e.key === ' ' && e.target === root) { e.preventDefault(); advance(); return; }
      if (e.key !== 'Tab') return;
      const f = [skip, go], at = f.indexOf(document.activeElement);
      if (e.shiftKey && at <= 0) { e.preventDefault(); go.focus(); } else if (!e.shiftKey && at === 1) { e.preventDefault(); skip.focus(); }
    });
    draw();
    shownAt = Date.now() - 200;   // the first line takes a tap after a moment, so the tap that closed the picker does not skip it
    return go;
  }

  function show(p, d) {
    if (root) return;
    part = p; data = d; i = 0; lastFocus = document.activeElement;
    try { storyIntroDone(p, 'shown'); save(); } catch (e) { console.error('[lanternfall] intro', e); }   // filed as it opens: a reload goes on to the picker, not back to the stills
    const go = build();
    document.body.append(root);
    try { go.focus({ preventScroll: true }); } catch (e) {}
  }
  function end(how) {
    if (!root) return;
    const p = part, r = root;
    root = null; part = ''; data = null;
    r.remove();
    try { storyIntroDone(p, how); save(); } catch (e) { console.error('[lanternfall] intro', e); }
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    ui(true);
    if (p === 'open' && typeof classUI === 'object' && classUI) classUI.open();   // then "Who are you?"
  }

  // The hero picker asks before it opens: true while the opening is on screen (it starts it when it is due).
  function gate() {
    if (root) return true;
    if (TEST_SKIP || typeof storyIntro !== 'function') return false;
    const d = storyIntro('open');
    if (!d || !d.beats.length) return false;
    show('open', d);
    return true;
  }
  // The pick is made: Hesketh's fire plays before the first fight.
  on('createDone', () => {
    if (TEST_SKIP || root || typeof storyIntro !== 'function') return;
    const d = storyIntro('fire');
    if (d && d.lines.length) show('fire', d);
    else storyIntroDone('release', 'done');   // nothing more to show: what waited under the opening may play
  });
  window.addEventListener('resize', () => { if (!root) return; const im = root.querySelector('.intro-still:not(.s-art) .intro-img'); if (im && !stillArt(im.parentNode.className.replace(/.*s-/, ''))) im.src = bgSrc(); });

  introUI = { gate, open: () => gate(), state: () => root ? { part, i, n: data.beats ? data.beats.length : data.lines.length } : null };
}
