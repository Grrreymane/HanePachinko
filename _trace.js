window.__trace = function (p, n, opt) {
  opt = opt || {};
  const keep = { tray, shots, state, fired, fever, firing }, s0 = { ...STAT };
  simMode = true; for (const b of balls) Composite.remove(world, b); balls.length = 0; LAUNCH.length = 0;
  fever = null; wing.open = false; wing.queue = 0; wing.cd = 0; wing.opened = 0; state = 'play'; tray = 1e6; shots = 1e6; firing = false;
  const h = 1 / 120, dtF = opt.dt || FIRE_DT; let t = 0, k = 0, next = 0; const hist = {}, hist2 = {}, lostAt = {}, stuckAt = {}, paths = [];
  while ((k < n || balls.length || LAUNCH.length || (fever && opt.keepFiring)) && t < n * dtF + 60) {
    if (t >= next && (k < n || (fever && opt.keepFiring))) { fire(typeof p === 'function' ? p() : p); k++; next += dtF; }
    if (opt.wingsOpen) { wing.open = true; wing.t = 1; }
    if (opt.wingsShut) { wing.open = false; wing.queue = 0; }
    const wasOpen = wing.open; tick(h); t += h; if (wing.open && !wasOpen) wing.opened = (wing.opened || 0) + 1;
    for (const b of balls) { const x = b.position.x / PS, y = b.position.y / PS; const bin = 'x' + Math.floor(x / 10) * 10;
      if (opt.paths && !b.pth) { b.pth = []; if (paths.length < opt.paths) paths.push(b.pth); }
      if (b.pth && Math.round(t * 120) % 4 === 0) b.pth.push(Math.round(x) + ',' + Math.round(y));
      if (!b.m1 && y >= 104) { b.m1 = 1; hist[bin] = (hist[bin] || 0) + 1; } if (!b.m2 && y >= 178) { b.m2 = 1; hist2[bin] = (hist2[bin] || 0) + 1; } if (y > 255 && !b.m3) { b.m3 = 1; lostAt[bin] = (lostAt[bin] || 0) + 1; }
      if (b.slow > 1.3 && !b.m4) { b.m4 = 1; const k2 = Math.round(x) + ',' + Math.round(y); stuckAt[k2] = (stuckAt[k2] || 0) + 1; } }
  }
  const out = { time: Math.round(t * 10) / 10, net: tray - 1e6, fired: k, opens: wing.opened || 0 }; for (const key in STAT) out[key] = STAT[key] - s0[key];
  for (const b of balls) Composite.remove(world, b); balls.length = 0; LAUNCH.length = 0;
  tray = keep.tray; shots = keep.shots; state = keep.state; fired = keep.fired; fever = keep.fever; firing = keep.firing; wing.open = false; wing.queue = 0; simMode = false;
  const srt = o => Object.keys(o).sort((a, b) => +a.slice(1) - +b.slice(1)).map(k => k.slice(1) + ':' + o[k]).join(' ');
  return JSON.stringify({ out, atWings: srt(hist), lower: srt(hist2), lostAt: srt(lostAt), stuckAt, paths: paths.map(q => q.join(' ')) });
};
