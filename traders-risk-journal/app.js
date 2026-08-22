(() => {
  'use strict';

  const LS = {
    trades: 'riskos.trades.v1',
    settings: 'riskos.settings.v1'
  };
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let trades = load(LS.trades, []);
  let settings = load(LS.settings, { balance: 10000, risk: 1 });

  const $ = id => document.getElementById(id);
  const fmt = n => '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function tabs() {
    document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'stats') renderStats();
    }));
  }

  function calcForm() {
    $('c-balance').value = settings.balance;
    $('c-risk').value = settings.risk;
    $('calc-form').addEventListener('submit', e => {
      e.preventDefault();
      const balance = parseFloat($('c-balance').value);
      const riskPct = parseFloat($('c-risk').value);
      const entry = parseFloat($('c-entry').value);
      const stop = parseFloat($('c-stop').value);
      const target = parseFloat($('c-target').value);
      const dir = $('c-direction').value;
      if (!(balance > 0) || !(entry > 0) || !(stop > 0)) return;
      const riskAmount = balance * (riskPct / 100);
      const perUnitRisk = Math.abs(entry - stop);
      if (perUnitRisk === 0) return;
      const invalid = dir === 'long' ? stop >= entry : stop <= entry;
      if (invalid) {
        $('calc-result').classList.remove('hidden');
        $('calc-result').innerHTML = '<div class="warn-box">Stop is on the wrong side of entry for a ' + dir + '. Check your levels.</div>';
        return;
      }
      const size = riskAmount / perUnitRisk;
      const notional = size * entry;
      let html =
        '<div class="row"><span>Risk amount</span><span>' + fmt(riskAmount) + '</span></div>' +
        '<div class="row"><span>Per-unit risk</span><span>$' + perUnitRisk.toFixed(5) + '</span></div>' +
        '<div class="big">' + size.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' units</div>' +
        '<div class="row"><span>Position value</span><span>' + fmt(notional) + '</span></div>';
      if (target > 0) {
        const reward = Math.abs(target - entry);
        const rr = reward / perUnitRisk;
        html += '<div class="row"><span>Reward : Risk</span><span>' + rr.toFixed(2) + ' R</span></div>' +
                '<div class="row"><span>Potential profit</span><span>' + fmt(size * reward) + '</span></div>';
        if (rr < 1) html += '<div class="warn-box">R:R below 1 — you need a win rate above ' + (100 / (1 + rr)).toFixed(0) + '% just to break even.</div>';
      }
      $('calc-result').classList.remove('hidden');
      $('calc-result').innerHTML = html;
      save(LS.settings, { balance, risk: riskPct });
    });
  }

  function renderTrades() {
    const list = $('trade-list');
    if (!trades.length) {
      list.innerHTML = '<div class="empty-state">No trades logged yet. Hit “+ Log Trade” after your first close.</div>';
      return;
    }
    list.innerHTML = trades.slice().reverse().map((t, i) => {
      const idx = trades.length - 1 - i;
      const pnl = t.direction === 'Short'
        ? (t.entry - t.exit) * t.size
        : (t.exit - t.entry) * t.size;
      const cls = pnl >= 0 ? 'pnl-pos' : 'pnl-neg';
      const sign = pnl >= 0 ? '+' : '';
      return '<div class="trade-card">' +
        '<div class="trade-meta"><div class="trade-sym">' + esc(t.symbol) + ' · ' + esc(t.direction) + '</div>' +
        '<div class="trade-sub">' + esc(t.date || '') + (t.notes ? ' — ' + esc(t.notes) : '') + '</div></div>' +
        '<div class="trade-pnl ' + cls + '">' + sign + fmt(pnl) + '</div>' +
        '<button class="del-btn" data-del="' + idx + '" title="Delete">×</button></div>';
    }).join('');
    list.querySelectorAll('[data-del]').forEach(btn =>
      btn.addEventListener('click', () => { trades.splice(+btn.dataset.del, 1); save(LS.trades, trades); renderTrades(); }));
  }

  function tradeDialog() {
    const dlg = $('trade-dialog');
    $('add-trade').addEventListener('click', () => {
      $('trade-form').reset();
      $('t-date').value = new Date().toISOString().slice(0, 10);
      dlg.showModal();
    });
    $('t-cancel').addEventListener('click', () => dlg.close());
    $('trade-form').addEventListener('submit', e => {
      e.preventDefault();
      trades.push({
        symbol: $('t-symbol').value.trim().toUpperCase(),
        direction: $('t-direction').value,
        entry: parseFloat($('t-entry').value),
        exit: parseFloat($('t-exit').value),
        size: parseFloat($('t-size').value),
        date: $('t-date').value,
        notes: $('t-notes').value.trim()
      });
      save(LS.trades, trades);
      renderTrades();
      dlg.close();
    });
  }

  function stats(tradeArr) {
    const pnls = tradeArr.map(t => t.direction === 'Short' ? (t.entry - t.exit) * t.size : (t.exit - t.entry) * t.size);
    const wins = pnls.filter(p => p > 0), losses = pnls.filter(p => p <= 0);
    const grossW = wins.reduce((a, b) => a + b, 0), grossL = Math.abs(losses.reduce((a, b) => a + b, 0));
    return {
      count: pnls.length,
      net: pnls.reduce((a, b) => a + b, 0),
      winRate: pnls.length ? wins.length / pnls.length * 100 : 0,
      pf: grossL > 0 ? grossW / grossL : (grossW > 0 ? Infinity : 0),
      avgWin: wins.length ? grossW / wins.length : 0,
      avgLoss: losses.length ? grossL / losses.length : 0
    };
  }

  function drawChart(cumDollar) {
    const cv = $('equity-chart'), ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, pad = 34;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#232c3f'; ctx.fillStyle = '#8b96ab'; ctx.font = '11px sans-serif';
    if (cumDollar.length < 2) {
      ctx.fillText('Log at least 2 trades to see your equity curve.', pad, H / 2);
      return;
    }
    const vals = [0].concat(cumDollar);
    const min = Math.min(...vals, 0), max = Math.max(...vals, 0);
    const x = i => pad + (W - 2 * pad) * i / (vals.length - 1);
    const y = v => H - pad - (H - 2 * pad) * ((v - min) / ((max - min) || 1));
    ctx.beginPath(); ctx.moveTo(x(0), y(0));
    vals.forEach((v, i) => ctx.lineTo(x(i), y(v)));
    ctx.strokeStyle = cumDollar[cumDollar.length - 1] >= 0 ? '#22d3a5' : '#f4536b';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#232c3f';
    ctx.beginPath(); ctx.moveTo(pad, y(0)); ctx.lineTo(W - pad, y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#8b96ab';
    ctx.fillText('$' + max.toFixed(0), pad, y(max) - 4);
    ctx.fillText('$' + min.toFixed(0), pad, Math.min(H - 6, y(min) + 12));
  }

  function renderStats() {
    const s = stats(trades);
    const pfStr = !isFinite(s.pf) ? '∞' : s.pf.toFixed(2);
    $('stat-cards').innerHTML = [
      ['Trades', s.count],
      ['Net P&L', (s.net >= 0 ? '+' : '') + fmt(s.net)],
      ['Win rate', s.winRate.toFixed(0) + '%'],
      ['Profit factor', pfStr],
      ['Avg win', fmt(s.avgWin)],
      ['Avg loss', fmt(s.avgLoss)]
    ].map(([k, v]) => '<div class="stat-card"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>').join('');
    let cum = 0;
    drawChart(trades.map(t => {
      cum += t.direction === 'Short' ? (t.entry - t.exit) * t.size : (t.exit - t.entry) * t.size;
      return cum;
    }));
  }

  function exportJson() {
    $('export-json').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), settings, trades }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'riskos-export-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  function wipeData() {
    $('wipe').addEventListener('click', () => {
      if (!confirm('Erase ALL trades and settings on this device? This cannot be undone.')) return;
      localStorage.removeItem(LS.trades); localStorage.removeItem(LS.settings);
      trades = []; settings = { balance: 10000, risk: 1 };
      $('s-balance').value = settings.balance; $('s-risk').value = settings.risk;
      renderTrades(); renderStats();
    });
  }

  function settingsForm() {
    $('s-balance').value = settings.balance; $('s-risk').value = settings.risk;
    $('settings-form').addEventListener('submit', e => e.preventDefault());
    $('s-balance').addEventListener('change', () => { settings.balance = parseFloat($('s-balance').value) || settings.balance; save(LS.settings, settings); });
    $('s-risk').addEventListener('change', () => { settings.risk = parseFloat($('s-risk').value) || settings.risk; save(LS.settings, settings); });
  }

  tabs(); calcForm(); renderTrades(); tradeDialog(); exportJson(); settingsForm(); wipeData();
})();
