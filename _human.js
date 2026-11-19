// A Balatro / Luck-be-a-Landlord player, not a robot: judges parts by their printed numbers, bets by bankroll, gets bored
// when nothing happens, and keeps a diary. Load inside the game closure:  __g(await (await fetch('_human.js')).text())
//   __human(runs, { careful: true, stages: 3 })  ->  [{ end, diary: [...] }]
window.__human = function (runs, opt = {}) {
  const diaries = [], pot0 = pot, keep = JSON.stringify(META); META.bank = 0; META.lv = {}; META.ach = {}; META.eq = []; META.seen = {}; META.fired = {};
  const VAL = { gate: 6, lucky: 5, gold: 4, split: 4, big: 3, wreck: 2, bomb: 2, wing: 3, rust: 3, hollow: 2, cat: 2, lead: 0 }, hasGate = () => BAG.concat(RACK).some(q => q.k === 'gate'), value = c => c.id === 'lead' ? (hasGate() ? 4 : 0) : VAL[c.id] || 0;   // a lead is only worth it next to a doubling ball   // a Balatro player reads the card and guesses
  for (let r = 0; r < runs; r++) {
    pot = POT0; resetRun(); let steps = 0; const diary = []; let aim = opt.aim !== undefined ? opt.aim : .45 + Math.random() * .3, tapCd = 0, taps = 0, nightFrames = 0, nightStartTray = tray, big = 0, bets = {}, c0 = { ...STAT }, burst = 0, rest = 0, bought = [], boredom = 0;
    const closeNight = how => {
      const stage0 = STAT.stage - c0.stage, v0 = STAT.v - c0.v;
      let mood = v0 ? '爽' : big >= 20 ? '有点意思' : stage0 >= 15 ? '平' : '闷';
      if (!v0 && big < 20) boredom++; else boredom = 0; if (boredom >= 3) mood += '（连闷 ' + boredom + ' 晚，想关游戏）';
      diary.push('第' + night + '晚(余' + nightsLeft() + ') ' + how + ' ' + zoneOf(aim).n + ' ' + nightStartTray + '→' + tray + ' 押' + Object.keys(bets).join('/') + ' 进台' + stage0 + ' 过门' + NS.gates + ' 漏' + NS.leak + ' V' + v0 + ' 好球' + BAG.filter(o => o.k !== 'plain' && o.k !== 'lead').length + ' 架' + RACK.length + ' 碎' + NS.broke + (NS.bit ? ' 猫叼' + NS.bit : '') + ' 最大×' + Math.max(...BAG.map(o => o.v || 1)) + ' 最大' + big + ' ' + Math.round(nightFrames / 60) + 's ' + mood + (bought.length ? ' 买' + bought.join(',') : ''));
      bought = [];
    };
    let lastState = state;
    while (steps < 60 * 60 * 25 && state !== 'over' && !(state === 'win' && stage >= (opt.stages || 3))) {
      if (state === 'letter') afterLetter();
      else if (state === 'brief') { nightFrames = 0; nightStartTray = tray; big = 0; bets = {}; c0 = { ...STAT }; if (opt.careful && opt.aim === undefined) aim = (tray < quota * 2 && pot < 150) ? .97 : .3; startNight(); }   // the careful player grinds the cash lane when the interest is short and the pot is small, else gambles on the wings
      else if (state === 'summary') { closeNight(won ? '还清' : '天亮'); go('pay'); }
      else if (state === 'loan') { diary.push('  借 ' + loanAmt + ' 欠 ' + (debt + quota + loanAmt)); takeLoan(); }
      else if (state === 'win') { diary.push('  还清第' + stage + '张 剩' + tray + (tray >= debtOf() ? ' 再借' : ' 走人')); if (tray >= debtOf()) nextStage(); else break; }
      else if (state === 'pick') { if (!opt.noshop && BAG.some(o => o.cursed) && tray - tossCost() >= quota * 2 + 20) toss(); const c = opt.noshop ? null : picks.filter(c => tray - costOf(c) >= (opt.greedy ? quota : quota + 15) && (!c.place || (slotsFor(c).length && PLACED.length < SLOT_MAX)) && value(c) >= 3).sort((a, b) => value(b) / costOf(b) - value(a) / costOf(a))[0]; if (c) { bought.push(c.name); applyPick(c); } else afterShop(); }
      else if (state === 'pack') {   // the best balls by printed value go in the bag, the rest on the rack
        const sc = o => (o.k === 'lead' ? (hasGate() ? 4 : 0) : VAL[o.k] || 1) * (o.v || 1), all = BAG.filter(movable).concat(RACK).sort((a, b) => sc(b) - sc(a)), fix = BAG.filter(o => o.cursed), inb = all.filter(o => sc(o) > 0).slice(0, BAG0 - fix.length);
        RACK.length = 0; RACK.push(...all.filter(o => !inb.includes(o)).slice(0, RACK_MAX)); BAG.length = 0; BAG.push(...fix, ...inb); while (BAG.length < BAG0) BAG.push({ k: 'plain', cr: 0, v: 1 }); pile = []; go('brief');
      }
      else if (state === 'swap') { swapPick = null; go('pick'); }
      else if (state === 'discard') { let j = 0; BAG.forEach((o, i) => { if ((VAL[o.k] || 0) * (o.v || 1) < (VAL[BAG[j].k] || 0) * (BAG[j].v || 1)) j = i; }); if ((VAL[BAG[j].k] || 0) < value(swapPick)) { const q = swapPick; swapPick = null; takeBall(q, j); } else { swapPick = null; go('brief'); } }
      else if (state === 'remove') { const q = pins.find(q => q.kind === 'red') || DEAD[0]; if (q) onPress({ x: q.x, y: q.y }); else go('pick'); }
      else if (state === 'place') { const sl = slotsFor(placing); if (sl.length) { const best = placing.id === 'rail' ? sl.find(q => q[1] < CY) || sl[0] : placing.id === 'tulip' ? sl.find(q => q[1] >= 210) || sl[0] : sl[0]; onPress({ x: best[0], y: best[1] }); } else { placing = null; go('pick'); } }
      else if (state === 'play') {
        if (rest > 0) { rest--; firing = false; } else { firing = true; if (++burst > 600) { burst = 0; rest = 30; aim = clamp(aim + rand(-.15, .15), .2, .9); } }
        power = clamp(aim + rand(-.03, .03), 0, 1);
        // the player only holds the handle: nothing to aim
        const want = BETS().filter(v => v <= tray / (opt.careful ? 120 : 40)); const b2 = want.length ? want[want.length - 1] : unit(); if (b2 !== bet) bet = b2; bets[bet] = 1;
        if (tray >= debt && quiet()) endNight();
        nightFrames++;
      }
      lastState = state; const tr = tray; update(1 / 60); if (tray - tr > big) big = tray - tr; steps++;
    }
    if (state === 'over') diary.push('  被带走 欠' + debt + (payMsg === '到期了' ? '（到期）' : ''));
    diaries.push({ end: state + ' stage' + stage + ' n' + night + ' ' + Math.round(steps / 60) + 's', diary });
  }
  pot = pot0; const o = JSON.parse(keep); META.bank = o.bank; META.lv = o.lv; META.ach = o.ach; META.eq = o.eq || []; META.seen = o.seen || {}; META.fired = o.fired || {}; save('meta', META); save('pot', pot); firing = false; bet = 1; return diaries;
};
