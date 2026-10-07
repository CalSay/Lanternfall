// 64k-portraits: the concept-board portraits (21yc-data-portraits.js) as the faces in the header, the Hero tab, party chips,
// the picker and story cards. Browser-only. `conceptPortraitURL(id)` returns a data URL, or '' (no portrait, or the player chose Classic art).
// Hooks: 60b-baker's portraitURL asks it first for any named hero; this file also wraps heroArtPortraitURL (Wren, Tobin, Pip).
// The choice lives in its own key (not the save); the switch is in 75-portraits-ui.js. Default on.
var conceptPortraitURL, portraitsClassic;
{
  const PREF = 'lanternfall.pref.classicPortraits';
  let classic = false;
  try { classic = storage.get(PREF) === '1'; } catch (e) {}
  portraitsClassic = v => {
    if (v === undefined) return classic;
    classic = !!v; try { storage.set(PREF, classic ? '1' : '0'); } catch (e) {}
    try { if (typeof updatePortrait === 'function') updatePortrait(); } catch (e) {}
    return classic;
  };
  conceptPortraitURL = id => (!classic && typeof HERO_PORTRAITS !== 'undefined' && HERO_PORTRAITS[id] + '#cp') || '';   // '#cp' lets 60-portraits.css size only these
  if (typeof heroArtPortraitURL === 'function') {
    const base = heroArtPortraitURL;
    heroArtPortraitURL = id => conceptPortraitURL(id) || base(id);
  }
}
