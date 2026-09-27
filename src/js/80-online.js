// 80-online: the shared world over the Artifact capabilities (db, user, room): raider
// docs, world boss upkeep, presence, war horn. Browser-only. Do not change shapes here
// without coordinator sign-off (see CLAUDE.md). The `online` state object is in 30-state.js.

// ================= online world =================

async function flush() {
  const { db, uid } = online;
  if (!db || !uid || !online.canWrite || online.flushing) return;
  const body = { name: S.name, L: S.L, maxZone: S.maxZone, wyrms: S.wyrms, gear: Math.round(gear().score), dps: Math.round(totalDps()), gen: S.raid.gen, dmg: Math.round(S.raid.dmg) };
  const key = JSON.stringify(body);
  if (key === online.flushKey) return;
  online.flushing = true;
  try { await db.doc('raiders/' + uid).set({ ...body, updatedAt: Date.now() }); online.flushKey = key; }
  catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === 'revoked')) { online.canWrite = false; if (S.activity === 'raid') { S.activity = 'fight'; spawn(); } ui(true); } }
  finally { online.flushing = false; }
}

async function maintainBoss() {
  const { db, uid } = online;
  if (!db || !uid || !online.canWrite || online.advancing || !online.bossLoaded) return;
  const w = online.world, hp = worldHp();
  if (w && hp > 0) return;
  online.advancing = true;
  try {
    const ref = db.doc('world/boss');
    const lease = await ref.acquire({ holder: uid, ttlMs: 5000 });
    if (!lease.acquired) return;
    const snap = await ref.get();
    const cur = snap.exists ? snap.data() : null;
    if ((cur && w && cur.gen !== w.gen) || (cur && !w)) return;
    const gen = cur ? cur.gen + 1 : 1;
    const topDps = Math.max(0, ...online.raiders.map(r => +r.dps || 0), totalDps());
    await ref.set({ gen, name: BOSSES[(gen - 1) % BOSSES.length], maxHp: Math.max(bossHpFor(gen), Math.round(topDps * 900)), spawnedAt: Date.now() });
  } catch (e) {}
  finally { online.advancing = false; }
}

function pushPresence() {
  if (!online.room) return;
  const p = { hero: S.name, lvl: S.L, zone: S.zone, act: S.activity, raiding: S.activity === 'raid' };
  const k = JSON.stringify(p); if (k === online.presKey) return; online.presKey = k;
  online.room.presence(p).catch(() => {});
}

$('hornBtn').addEventListener('click', () => {
  if (!online.room) return;
  online.room.emit('rally', { hero: S.name }).then(() => { online.hornAt = Date.now(); ui(true); })
    .catch(e => { if (e && e.code === 'not_permitted') { online.hornOk = false; ui(true); } });
});

async function connect() {
  const cl = window.claude && typeof window.claude.use === 'function' ? window.claude : null;
  const use = async n => { try { return cl ? await cl.use(n) : null; } catch (e) { return null; } };
  const [db, user, room] = await Promise.all([use('db'), use('user'), use('room')]);
  online.db = db; online.user = user; online.room = room;
  if (user) { try { online.uid = await user.id(); } catch (e) {} try { if (await user.can('data.write') === false) online.canWrite = false; } catch (e) {} }
  online.checked = true;
  if (db && online.uid) {
    online.ready = true;
    db.doc('world/boss').onSnapshot(s => {
      online.bossLoaded = true;
      online.world = s.exists ? s.data() : null;
      if (online.world) syncGen();
    }, () => { online.ready = false; if (S.activity === 'raid') { S.activity = 'fight'; spawn(); } ui(true); });
    db.collection('raiders').onSnapshot(q => { online.raiders = q.docs.map(d => ({ id: d.id, ...d.data() })); }, () => {});
  } else if (S.activity === 'raid') { S.activity = 'fight'; spawn(); }
  if (room) {
    room.onPeers(ch => { online.peers = ch.peers; }, () => { online.room = null; });
    room.on('rally', msg => {
      const who = String((msg.data && msg.data.hero) || 'A raider').slice(0, 18);
      rallyUntil = Date.now() + 20000;
      toast(`${who} sounds the war horn! Raid damage +25% for 20 seconds.`, 'raid', iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }));
    }, () => {});
    pushPresence();
  }
  ui(true);
}

on('activity', () => pushPresence());
