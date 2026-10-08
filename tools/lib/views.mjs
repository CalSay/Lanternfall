// The screen sizes our checks play the game at (browser-first, Cal 2026-10-08: CLAUDE.md "Hard constraints").
// Shared by tools/walk.mjs, tools/eyes.mjs, tools/playtest.mjs and tools/ci/eyes.mjs.
//
//   desktop (d)   1280x720   the design size: mouse and keyboard, no touch. The default view of every check.
//   landscape (l)  740x360   a landscape phone: touch.
//   portrait (p)   360x740   a phone held upright: touch. Must not break; new features need not be designed for it.
//   laptop         1366x640   a small laptop with browser bars (the tightest desktop height): mouse.
//   tablet         1024x768   a landscape tablet: touch.
//   hd            1920x1080   full HD: mouse. The Bar's big shot.
//   WxH           any size; touch when its shorter side is under 600 px (a phone), mouse otherwise.
//
// `wide` is the game's landscape layout (menus open as a panel over the stage): src/styles/80-landscape.css and 62-stage.js
// switch on (min-aspect-ratio: 1/1) and (min-width: 600px).
const mk = (id, w, h, touch) => ({ id, w, h, touch, wide: w >= h && w >= 600 });
export const VIEWS = {
  desktop: mk('desktop', 1280, 720, false),
  landscape: mk('landscape', 740, 360, true),
  portrait: mk('portrait', 360, 740, true),
  laptop: mk('laptop', 1366, 640, false),
  tablet: mk('tablet', 1024, 768, true),
  hd: mk('hd', 1920, 1080, false),
};
const SHORT = { d: 'desktop', l: 'landscape', p: 'portrait' };
export const DEFAULT_VIEW = 'desktop';
export const VIEW_HELP = 'desktop (d, 1280x720 mouse; default), landscape (l, 740x360), portrait (p, 360x740), laptop (1366x640), tablet (1024x768), hd (1920x1080), or WxH';

// A view by name, short letter or WxH; null when the name is not one.
export function view(name) {
  const s = String(name == null ? DEFAULT_VIEW : name).trim().toLowerCase();
  const m = /^(\d+)x(\d+)$/.exec(s);
  if (m) { const v = VIEWS[Object.keys(VIEWS).find(k => VIEWS[k].w === +m[1] && VIEWS[k].h === +m[2])]; return v || mk(s, +m[1], +m[2], Math.min(+m[1], +m[2]) < 600); }
  return VIEWS[SHORT[s] || s] || null;
}
// Playwright context options: a touch view is a phone or tablet (taps), a mouse view is a desktop browser (clicks, hover).
export const contextOptions = v => ({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1, isMobile: v.touch, hasTouch: v.touch });
