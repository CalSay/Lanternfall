// 55-voice: the starting hero speaks at the big moments (card hero-voice; bible 4.4 and 4.6). CORE: no DOM; the moment layer
// (75-moments-ui.js), the Great Lantern card (75-lantern-ui.js) and the hero sheet (75-party-sheet.js) read it.
// Barks are STORY_BEATS.hero lines named 'v_<moment>' (21k-story-hollow.js), one per starter (wren, tobin, pip). A hero with no line stays silent.
//   voiceSay(id) -> { line, who, key } | null   the story hero's bark for a moment, or null (no starter, or no line)
//   voicePick(ids) -> id | ''                    the strongest of several moments (VOICE_PRIO): one bark a fight end
//   voiceOnce(id) -> bool                        true the first time for a first-only moment ('craft1'), and files it
//   voiceLoss(zone) -> bool                      true the first time a boss at a new furthest zone beats you
//   voiceRecord() -> [{ k, txt }]                the "On the road" rows on the hero sheet: bosses, uniques, best parry streak, days
// Save: registerState('voice', { v: 1, best: 0, lossZ: 0, said: {} }). best: the longest run of parries with no miss; lossZ: the last zone whose
// boss loss had a bark; said: first-only barks. All defaults, so old saves merge in; nothing is granted back.
const VOICE_PRIO = ['boss1', 'lantern', 'star1', 'unique', 'ability', 'boss', 'craft1', 'level', 'loss'];
let voiceSay, voicePick, voiceOnce, voiceLoss, voiceRecord;
{
  registerState('voice', { v: 1, best: 0, lossZ: 0, said: {} });
  const V = () => S.voice;
  let run = 0;   // the parry run now (not saved: a reload starts a new run)
  voiceSay = id => {
    const key = typeof storyHeroKey === 'function' ? storyHeroKey() : '';
    const line = key && typeof storyHeroLine === 'function' ? storyHeroLine('v_' + id) : '';
    if (!line) return null;
    const r = typeof ROSTER === 'object' && ROSTER[key];
    return { line, who: (r && r.name) || key, key };
  };
  voicePick = ids => VOICE_PRIO.find(id => ids.includes(id)) || '';
  voiceOnce = id => { const d = V().said; if (d[id]) return false; d[id] = 1; return true; };
  voiceLoss = zone => { if (!(zone > V().lossZ)) return false; V().lossZ = zone; return true; };
  on('soloParry', e => {
    if (!e) return;
    if (e.res === 'parry') { run++; if (run > V().best) V().best = run; } else if (e.res === 'miss') run = 0;
  });
  voiceRecord = () => {
    const st = S.stats || {}, since = +st.since || 0, days = since ? Math.max(1, Math.floor((Date.now() - since) / 864e5) + 1) : 1;
    return [
      { k: 'bosses', txt: `Bosses beaten: ${fmt(st.bosses || 0)}` },
      { k: 'uniques', txt: `Uniques found: ${fmt(st.uniques || 0)}` },
      { k: 'parry', txt: `Best parry streak: ${fmt(V().best || 0)}` },
      { k: 'days', txt: `Days on the road: ${fmt(days)}` }
    ];
  };
}
