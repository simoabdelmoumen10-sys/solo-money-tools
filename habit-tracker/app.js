/* Habit Tracker — daily habits + streaks, localStorage. */
(function () {
  'use strict';

  var KEY = 'habits_v1';
  var db = { habits: [] };

  function load() { try { var r = JSON.parse(localStorage.getItem(KEY)); if (r) db = r; } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  function today() { return new Date().toISOString().slice(0, 10); }
  function dayName(offset) {
    var d = new Date(); d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  }
  function fmt(d) {
    var p = d.split('-');
    var names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return names[new Date(d).getDay()] + ' ' + p[1] + '/' + p[2];
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* XSS-safe: user-entered habit names pass through esc() before innerHTML;
     interaction uses addEventListener with captured indices. */
  function isDue(h, d) {
    if (h.freq === 'daily') return true;
    if (h.freq === 'weekday') { var wd = new Date(d).getDay(); return wd >= 1 && wd <= 5; }
    return true;
  }
  function streakOf(h) {
    var s = 0;
    for (var i = 0; i < 365; i++) {
      var d = dayName(i);
      if (h.done[d]) { s++; }
      else if (isDue(h, d)) { break; }
    }
    return s;
  }

  try { document.getElementById('today-label').textContent = fmt(today()); } catch(e) { console.error('today-label err:', e.message); }

  function render() {
    console.log('RENDER called from:', new Error().stack.split('\n')[2].trim());
    var list = document.getElementById('habits');
    list.innerHTML = '';
    var doneCount = 0, dueCount = 0;

    console.log('RENDER: db.habits.length =', db.habits.length, 'today =', today());
    db.habits.forEach(function (h, idx) {
      var isDone = !!h.done[today()];
      var due = isDue(h, today());
      console.log('  habit', idx, h.name, 'isDone:', isDone, 'due:', due, 'done keys:', Object.keys(h.done));
      if (due) dueCount++;
      if (isDone) doneCount++;

      var el = document.createElement('div');
      el.className = 'habit' + (isDone ? ' done' : '');
      var week = '';
      for (var i = 6; i >= 0; i--) {
        var d = dayName(i);
        week += '<span class="day' + (h.done[d] ? ' on' : '') + '" title="' + fmt(d) + '"></span>';
      }
      el.innerHTML =
        '<div class="check" data-i="' + idx + '">✓</div>' +
        '<div style="flex:1"><div class="name">' + esc(h.name) + '</div>' +
        '<div class="week">' + week + '</div></div>' +
        (due && !isDone ? '<span class="streak">🔥 ' + streakOf(h) + '</span>' : '<span class="streak" style="color:var(--up)">✓ ' + streakOf(h) + '</span>') +
        '<button class="del" data-del="' + idx + '">✕</button>';
      list.appendChild(el);
    });

    el = list.querySelectorAll('.habit');
    if (!db.habits.length) {
      list.innerHTML = '<div class="card"><div class="label">No habits yet</div><div style="font-size:13px;color:var(--ink-3);margin-top:6px">Add one above — small, daily, repeatable.</div></div>';
    }

    document.getElementById('today-count').textContent = doneCount + ' / ' + dueCount;
    var pct = dueCount ? Math.round(doneCount / dueCount * 100) : 0;
    document.getElementById('today-bar').style.width = pct + '%';

    el = list.querySelectorAll('.check');
    for (var j = 0; j < el.length; j++) {
      (function (idx) {
        el[j].addEventListener('click', function () {
          var h = db.habits[idx];
          if (h.done[today()]) { delete h.done[today()]; }
          else { h.done[today()] = true; }
          save(); render();
        });
      })(j);
    }
    var dels = list.querySelectorAll('.del');
    for (var k = 0; k < dels.length; k++) {
      (function (idx) {
        dels[k].addEventListener('click', function () {
          db.habits.splice(idx, 1);
          save(); render();
        });
      })(k);
    }
  }

  document.getElementById('btn-add').addEventListener('click', function () {
    var name = document.getElementById('new-habit').value.trim();
    if (!name) return;
    db.habits.push({ name: name, freq: document.getElementById('new-freq').value, done: {} });
    document.getElementById('new-habit').value = '';
    save(); render();
  });
  document.getElementById('new-habit').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
  });

  load();
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
