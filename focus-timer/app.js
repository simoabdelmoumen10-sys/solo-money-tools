/* Focus Timer — pomodoro-style timer with daily stats, localStorage. */
(function () {
  'use strict';

  var KEY = 'focus_v1';
  var db = { days: {} };

  function load() { try { var r = JSON.parse(localStorage.getItem(KEY)); if (r) db = r; } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  var mode = 25;
  var remaining = mode * 60;
  var running = false;
  var ticker = null;
  var display = document.getElementById('display');
  var toggle = document.getElementById('btn-toggle');

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function dayKey(offset) { var d = new Date(); d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); }
  function dayNames() { return ['S','M','T','W','T','F','S']; }

  function tick() {
    remaining--;
    if (remaining <= 0) { completeSession(); return; }
    display.textContent = fmt(remaining);
  }

  function completeSession() {
    stopTicking();
    running = false;
    toggle.textContent = 'Start';
    display.classList.remove('running');
    var d = db.days[today()] || { sessions: 0, minutes: 0 };
    d.sessions += 1;
    d.minutes += mode;
    db.days[today()] = d;
    save();
    display.textContent = fmt(mode * 60);
    renderStats();
    try { new Notification('Focus session done', { body: mode + ' minutes completed.' }); } catch (e) {}
  }

  function stopTicking() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  toggle.addEventListener('click', function () {
    if (running) {
      stopTicking();
      running = false;
      toggle.textContent = 'Start';
      display.classList.remove('running');
    } else {
      if (remaining <= 0) remaining = mode * 60;
      running = true;
      toggle.textContent = 'Pause';
      display.classList.add('running');
      ticker = setInterval(tick, 1000);
    }
  });

  document.getElementById('btn-skip').addEventListener('click', function () {
    stopTicking();
    running = false;
    toggle.textContent = 'Start';
    display.classList.remove('running');
    remaining = mode * 60;
    display.textContent = fmt(remaining);
  });

  document.getElementById('btn-reset').addEventListener('click', function () {
    db.days = {};
    save();
    renderStats();
  });

  document.querySelectorAll('.mode').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.mode').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      stopTicking();
      running = false;
      toggle.textContent = 'Start';
      display.classList.remove('running');
      mode = parseInt(b.dataset.min, 10);
      remaining = mode * 60;
      display.textContent = fmt(remaining);
    });
  });

  /* XSS-safe: week bars interpolate only static day letters and numeric
     heights (no user-controlled strings). */
  function renderStats() {
    var d = db.days[today()] || { sessions: 0, minutes: 0 };
    document.getElementById('stat').textContent = d.sessions + ' sessions · ' + d.minutes + ' min focused';
    var week = document.getElementById('week');
    week.innerHTML = '';
    var max = 1;
    var vals = [];
    for (var i = 6; i >= 0; i--) {
      var rec = db.days[dayKey(i)] || { minutes: 0 };
      vals.push(rec.minutes);
      if (rec.minutes > max) max = rec.minutes;
    }
    vals.forEach(function (v, idx) {
      var el = document.createElement('div');
      el.className = 'wd';
      var h = Math.max(2, Math.round(v / max * 46));
      el.innerHTML = '<div class="bar"><div style="height:' + h + 'px"></div></div><div class="n">' + dayNames()[(new Date().getDay() - (6 - idx) + 7) % 7] + '</div>';
      week.appendChild(el);
    });
  }

  load();
  display.textContent = fmt(remaining);
  renderStats();

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(function () {});
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
