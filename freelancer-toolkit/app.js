/* Freelancer Toolkit — app logic, localStorage-backed, offline-first */
(function () {
  'use strict';

  var DB_KEY = 'fk_db_v1';

  var db = {
    invoices: [],
    clients: [],
    expenses: [],
    nextInv: 1
  };

  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (raw) db = Object.assign(db, JSON.parse(raw));
    } catch (e) { /* fresh start */ }
  }
  function save() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function money(n) { return '$' + Number(n || 0).toFixed(2); }
  function monthKey(iso) { return (iso || '').slice(0, 7); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* innerHTML usage is XSS-safe: every interpolated value (user input or
     localStorage) passes through esc() before insertion; delete buttons use
     addEventListener with captured ids, never inline handlers. */
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      navBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      document.querySelectorAll('.view').forEach(function (v) { v.hidden = true; });
      document.getElementById('view-' + b.dataset.view).hidden = false;
      if (b.dataset.view === 'dashboard') renderDashboard();
    });
  });

  /* ---------- invoices ---------- */
  var invClient = document.getElementById('inv-client');
  var invNumber = document.getElementById('inv-number');
  var invDesc = document.getElementById('inv-desc');
  var invAmount = document.getElementById('inv-amount');
  var invDate = document.getElementById('inv-date');
  var invStatus = document.getElementById('inv-status');

  document.getElementById('btn-new-invoice').addEventListener('click', function () {
    fillClientSelect();
    invNumber.value = 'INV-' + String(db.nextInv).padStart(3, '0');
    invDesc.value = '';
    invAmount.value = '';
    invDate.value = new Date().toISOString().slice(0, 10);
    invStatus.value = 'sent';
    document.getElementById('invoice-form').hidden = false;
  });
  document.getElementById('btn-cancel-invoice').addEventListener('click', function () {
    document.getElementById('invoice-form').hidden = true;
  });
  document.getElementById('btn-save-invoice').addEventListener('click', function () {
    var client = invClient.value;
    var desc = invDesc.value.trim();
    var amount = parseFloat(invAmount.value);
    if (!client || !desc || isNaN(amount) || amount <= 0) { alert('Client, description and a positive amount are required.'); return; }
    db.invoices.push({
      id: uid(), client: client, number: invNumber.value.trim() || ('INV-' + db.nextInv),
      desc: desc, amount: amount, date: invDate.value || new Date().toISOString().slice(0, 10),
      status: invStatus.value
    });
    db.nextInv += 1;
    save();
    document.getElementById('invoice-form').hidden = true;
    renderInvoices();
  });

  function fillClientSelect() {
    invClient.innerHTML = '<option value="">— select client —</option>';
    db.clients.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id; o.textContent = c.name;
      invClient.appendChild(o);
    });
  }

  function renderInvoices() {
    var list = document.getElementById('invoice-list');
    list.innerHTML = '';
    if (!db.invoices.length) { list.innerHTML = '<div class="item"><span class="meta">No invoices yet. Create your first.</span></div>'; return; }
    db.invoices.slice().reverse().forEach(function (inv) {
      var el = document.createElement('div');
      el.className = 'item';
      el.innerHTML =
        '<div><div class="name">' + esc(inv.number) + ' — ' + esc(inv.desc) + '</div>' +
        '<div class="meta">' + esc(inv.client) + ' · ' + esc(inv.date) + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
        '<span class="tag ' + esc(inv.status) + '">' + esc(inv.status) + '</span>' +
        '<span class="amt">' + money(inv.amount) + '</span>' +
        '<button class="small-btn" data-del="' + inv.id + '">✕</button></div>';
      el.querySelector('[data-del]').addEventListener('click', function () {
        db.invoices = db.invoices.filter(function (i) { return i.id !== inv.id; });
        save(); renderInvoices();
      });
      list.appendChild(el);
    });
  }

  /* ---------- clients ---------- */
  var cliName = document.getElementById('cli-name');
  var cliEmail = document.getElementById('cli-email');
  var cliRate = document.getElementById('cli-rate');
  var cliStatus = document.getElementById('cli-status');

  document.getElementById('btn-new-client').addEventListener('click', function () {
    cliName.value = ''; cliEmail.value = ''; cliRate.value = ''; cliStatus.value = 'active';
    document.getElementById('client-form').hidden = false;
  });
  document.getElementById('btn-cancel-client').addEventListener('click', function () {
    document.getElementById('client-form').hidden = true;
  });
  document.getElementById('btn-save-client').addEventListener('click', function () {
    var name = cliName.value.trim();
    if (!name) { alert('Client name is required.'); return; }
    db.clients.push({ id: uid(), name: name, email: cliEmail.value.trim(), rate: parseFloat(cliRate.value) || 0, status: cliStatus.value });
    save();
    document.getElementById('client-form').hidden = true;
    renderClients();
  });

  function renderClients() {
    var list = document.getElementById('client-list');
    list.innerHTML = '';
    if (!db.clients.length) { list.innerHTML = '<div class="item"><span class="meta">No clients yet.</span></div>'; return; }
    db.clients.forEach(function (c) {
      var el = document.createElement('div');
      el.className = 'item';
      el.innerHTML =
        '<div><div class="name">' + esc(c.name) + '</div>' +
        '<div class="meta">' + esc(c.email) + ' · $' + (c.rate || 0).toFixed(2) + '/hr</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
        '<span class="tag ' + esc(c.status) + '">' + esc(c.status) + '</span>' +
        '<button class="small-btn" data-del="' + c.id + '">✕</button></div>';
      el.querySelector('[data-del]').addEventListener('click', function () {
        db.clients = db.clients.filter(function (x) { return x.id !== c.id; });
        save(); renderClients();
      });
      list.appendChild(el);
    });
  }

  /* ---------- expenses ---------- */
  var expDesc = document.getElementById('exp-desc');
  var expAmount = document.getElementById('exp-amount');
  var expDate = document.getElementById('exp-date');
  var expCat = document.getElementById('exp-cat');

  document.getElementById('btn-new-expense').addEventListener('click', function () {
    expDesc.value = ''; expAmount.value = ''; expDate.value = new Date().toISOString().slice(0, 10); expCat.value = 'Software';
    document.getElementById('expense-form').hidden = false;
  });
  document.getElementById('btn-cancel-expense').addEventListener('click', function () {
    document.getElementById('expense-form').hidden = true;
  });
  document.getElementById('btn-save-expense').addEventListener('click', function () {
    var desc = expDesc.value.trim();
    var amount = parseFloat(expAmount.value);
    if (!desc || isNaN(amount) || amount <= 0) { alert('Description and a positive amount are required.'); return; }
    db.expenses.push({ id: uid(), desc: desc, amount: amount, date: expDate.value || new Date().toISOString().slice(0, 10), cat: expCat.value });
    save();
    document.getElementById('expense-form').hidden = true;
    renderExpenses();
  });

  function renderExpenses() {
    var list = document.getElementById('expense-list');
    list.innerHTML = '';
    if (!db.expenses.length) { list.innerHTML = '<div class="item"><span class="meta">No expenses yet.</span></div>'; return; }
    db.expenses.slice().reverse().forEach(function (e) {
      var el = document.createElement('div');
      el.className = 'item';
      el.innerHTML =
        '<div><div class="name">' + esc(e.desc) + '</div>' +
        '<div class="meta">' + esc(e.cat) + ' · ' + esc(e.date) + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
        '<span class="amt">' + money(e.amount) + '</span>' +
        '<button class="small-btn" data-del="' + e.id + '">✕</button></div>';
      el.querySelector('[data-del]').addEventListener('click', function () {
        db.expenses = db.expenses.filter(function (x) { return x.id !== e.id; });
        save(); renderExpenses();
      });
      list.appendChild(el);
    });
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    var outstanding = 0, paidThisMonth = 0, expensesTotal = 0;
    var now = new Date(), ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    db.invoices.forEach(function (inv) {
      if (inv.status !== 'paid' && inv.status !== 'draft') outstanding += inv.amount;
      if (inv.status === 'paid' && monthKey(inv.date) === ym) paidThisMonth += inv.amount;
    });
    db.expenses.forEach(function (e) { expensesTotal += e.amount; });

    document.getElementById('stat-outstanding').textContent = money(outstanding);
    document.getElementById('stat-paid').textContent = money(paidThisMonth);
    document.getElementById('stat-net').textContent = money(paidThisMonth - expensesTotal);
    document.getElementById('stat-invoices').textContent = db.invoices.length;
    document.getElementById('stat-clients').textContent = db.clients.length;
    document.getElementById('stat-expenses').textContent = db.expenses.length;

    /* cash flow chart: paid per month, last 6 months */
    var canvas = document.getElementById('cashchart');
    var ctx = canvas.getContext('2d');
    var W = canvas.width = Math.max(canvas.clientWidth, 320);
    var H = canvas.height = 140;
    ctx.clearRect(0, 0, W, H);

    var months = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
    }
    var vals = months.map(function (m) {
      return db.invoices.filter(function (inv) { return inv.status === 'paid' && monthKey(inv.date) === m; })
        .reduce(function (s, inv) { return s + inv.amount; }, 0);
    });
    var max = Math.max.apply(null, vals.concat([1]));
    var pad = 8, bw = (W - pad * 2) / 6;
    ctx.fillStyle = '#272521'; ctx.fillRect(0, 0, W, H);
    vals.forEach(function (v, idx) {
      var bh = (v / max) * (H - 40);
      var x = pad + idx * bw + bw * 0.15, y = H - 24 - bh;
      ctx.fillStyle = v > 0 ? '#7da6ff' : 'rgba(242,240,234,.12)';
      ctx.fillRect(x, y, bw * 0.7, bh);
      ctx.fillStyle = 'rgba(242,240,234,.5)';
      ctx.font = '9px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(months[idx].slice(2), x + bw * 0.35, H - 8);
    });
  }

  /* ---------- init ---------- */
  load();
  renderInvoices();
  renderClients();
  renderExpenses();
  renderDashboard();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
