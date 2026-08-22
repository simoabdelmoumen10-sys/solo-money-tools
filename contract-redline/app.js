/* Contract Redline — client-side risk analyzer. No uploads, no backend.
   Rule-based clause detection with severity scoring and redline suggestions.
   Not legal advice. */
(function () {
  'use strict';

  var KEY = 'redline_history_v1';

  /* Each rule: name, severity, trigger regexes, explanation, suggested redline. */
  var RULES = [
    {
      name: 'Automatic renewal',
      sev: 'high',
      re: /auto(?:matic)?-?renew|automatically renew|renew(s|ed)? automatically|rollover|evergreen/i,
      why: 'Contract renews without action — you can get locked in for another term by doing nothing.',
      fix: 'Change to: "This agreement renews only upon written mutual consent. Either party may terminate with 30 days notice before the renewal date."'
    },
    {
      name: 'Unilateral termination',
      sev: 'high',
      re: /(?:client|company|party a|licensor).{0,80}(?:may|can|reserves the right to).{0,80}terminate.{0,80}(?:without cause|at any time|for convenience|for any reason)/i,
      why: 'The other side can walk away anytime, but you likely cannot. Unbalanced power.',
      fix: 'Require mutual termination rights and a notice period: "Either party may terminate for convenience with 30 days written notice. Termination for cause requires 15 days cure period."'
    },
    {
      name: 'Broad indemnification',
      sev: 'high',
      re: /indemnif(y|ication|ies).{0,120}(?:all claims|any claims|against all|hold harmless|defend)/i,
      why: 'You may be covering their losses and legal costs, including things outside your control.',
      fix: 'Cap indemnity to third-party claims caused by your gross negligence or willful misconduct; exclude consequential damages and carve out their own fault.'
    },
    {
      name: 'Liability cap missing or one-sided',
      sev: 'high',
      re: /unlimited liability|no cap on liability|liable for (?:any|all)|without limitation of liability/i,
      why: 'No cap on what you owe if something goes wrong — exposure is unlimited.',
      fix: 'Add: "Each party\u2019s aggregate liability is capped at the fees paid in the 12 months preceding the claim. Neither party is liable for consequential, indirect or lost-profit damages."'
    },
    {
      name: 'Non-compete',
      sev: 'med',
      re: /non-?compete|shall not (?:compete|work for|provide services to)|compet(?:e|ing) business/i,
      why: 'You may be barred from working in your entire field, even outside this engagement.',
      fix: 'Narrow it: scope to the client\u2019s direct competitors, duration max 6 months post-termination, geographic scope limited to the market where you actually worked.'
    },
    {
      name: 'Non-solicitation of your clients',
      sev: 'med',
      re: /non-?solicit|shall not solicit|not (?:solicit|approach|contact).{0,60}(?:client|customer)/i,
      why: 'You may be blocked from contacting clients you brought in or worked with before.',
      fix: 'Carve out pre-existing relationships: "Restriction applies only to clients introduced by the counterparty during this engagement, excluding clients you had before."'
    },
    {
      name: 'Mandatory arbitration / venue',
      sev: 'med',
      re: /arbitrat|binding arbitration|exclusive jurisdiction|governed by the laws of.{0,60}(?:california|new york|delaware|england|uae|saudi|dubai|abu dhabi)/i,
      why: 'Disputes must go to a specific city or country — expensive travel and unfamiliar law.',
      fix: 'Move venue to your jurisdiction or a neutral location: "Disputes resolved in [your city], governed by [your state/country] law. Either party may seek injunctive relief in any court of competent jurisdiction."'
    },
    {
      name: 'Payment terms stretched',
      sev: 'med',
      re: /net[- ]?(?:60|90|120)|within (?:60|90|120) days|payment.{0,30}(?:60|90|120) days/i,
      why: 'You wait 2-4 months to get paid — cash flow killer for a freelancer.',
      fix: 'Ask for net-15 or net-30 with late interest: "Fees due within 15 days of invoice. Late payments accrue 1.5% monthly interest and suspend deliverables until paid."'
    },
    {
      name: 'No late-payment interest',
      sev: 'low',
      re: /late (?:payment|fees|charges)|interest on late|penalty for late/i,
      why: 'No penalty for late payment — no incentive for them to pay on time.',
      fix: 'Add: "Any amount unpaid 15 days past due accrues interest at 1.5% per month (18% APR) until paid."'
    },
    {
      name: 'IP assignment to them (all rights)',
      sev: 'med',
      re: /all right,? title.{0,40}(?:and|&).{0,40}interest|work made for hire|assign.{0,60}(?:all|entire).{0,60}(?:intellectual property|ip|rights)|exclusively owned by/i,
      why: 'Everything you create — including reusable code, templates, processes — becomes theirs.',
      fix: 'Grant a license, not assignment: "Client receives a perpetual, non-exclusive license to the deliverables. Pre-existing tools, templates and methodologies remain yours."'
    },
    {
      name: 'Exclusivity',
      sev: 'med',
      re: /exclusi(?:ve|vity)|sole provider|only.{0,40}(?:freelancer|contractor|consultant)/i,
      why: 'You may be barred from working with anyone else in the same field.',
      fix: 'Remove or scope it: "Exclusivity applies only to competing work for direct competitors, and expires at termination."'
    },
    {
      name: 'Deliverable acceptance loophole',
      sev: 'med',
      re: /acceptance.{0,80}(?:in (?:their|its) sole discretion|unreasonably|without limitation)|deemed accepted.{0,80}(?:at their|in their)/i,
      why: 'They can reject work forever with no objective standard — you never finish.',
      fix: 'Add: "Deliverables are accepted within 10 business days unless written defects are listed. Undisclosed defects are deemed accepted; revisions limited to 2 rounds."'
    },
    {
      name: 'No limitation on scope creep',
      sev: 'med',
      re: /additional services.{0,60}(?:without|no).{0,60}(?:charge|fee|cost)|services.{0,60}(?:as requested|as needed)|such other services/i,
      why: 'Unlimited extra work for the same price.',
      fix: 'Define scope: "Any work beyond the Statement of Work requires a written change order with agreed pricing before work begins."'
    },
    {
      name: 'Confidentiality — indefinite/overbroad',
      sev: 'low',
      re: /confidential.{0,60}(?:indefinitely|perpetually|forever|without time limit)/i,
      why: 'Confidentiality that never expires is unworkable in practice.',
      fix: 'Cap the term: "Confidentiality obligations survive termination for 2 years, except trade secrets which survive as required by law."'
    },
    {
      name: 'Assignment by them (you can\u2019t)',
      sev: 'low',
      re: /(?:client|company).{0,80}(?:may|can|reserves).{0,60}assign.{0,80}(?:without|no).{0,60}(?:consent|approval)/i,
      why: 'They can sell the contract to anyone; you\u2019re locked in.',
      fix: 'Require mutual consent: "Neither party may assign this agreement without the other\u2019s prior written consent, not to be unreasonably withheld."'
    },
    {
      name: 'No notice period for termination',
      sev: 'med',
      re: /terminate.{0,40}(?:effective immediately|immediately upon|without notice)/i,
      why: 'They can cut you off with zero runway.',
      fix: 'Require notice: "Termination for convenience requires 30 days written notice. Work performed up to termination is paid at the agreed rate."'
    },
    {
      name: 'Kill fee / cancellation terms missing',
      sev: 'low',
      re: /cancel(?:lation)?(?:ed)?.{0,80}(?:refund|deposit|kill fee)/i,
      why: 'No protection if the project is cancelled after you\u2019ve started.',
      fix: 'Add: "If the project is cancelled after commencement, fees for work completed plus 50% of scheduled work are due as a kill fee within 15 days."'
    }
  ];

  var scoreEl, listEl, textEl, historyEl;

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function saveHistory(h) {
    try { localStorage.setItem(KEY, JSON.stringify(h.slice(0, 20))); } catch (e) {}
  }
  /* innerHTML usage is XSS-safe: every interpolated value derived from user
     input (contract text) or localStorage (history) passes through esc()
     before insertion; no inline handlers are built from strings. */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function analyze(text) {
    if (!text || text.trim().length < 40) return [];
    var findings = [];
    RULES.forEach(function (rule) {
      var m = text.match(rule.re);
      if (m) {
        var start = Math.max(0, m.index - 40);
        var quote = text.slice(start, Math.min(text.length, m.index + m[0].length + 120)).replace(/\s+/g, ' ').trim();
        findings.push({ name: rule.name, sev: rule.sev, why: rule.why, fix: rule.fix, quote: quote });
      }
    });
    return findings;
  }

  function scoreOf(findings) {
    var w = { high: 3, med: 2, low: 1 };
    return findings.reduce(function (s, f) { return s + w[f.sev]; }, 0);
  }

  function render(findings) {
    var count = findings.length;
    var score = scoreOf(findings);
    listEl.innerHTML = '';
    if (!count) {
      listEl.innerHTML = '<div class="item"><span class="meta">No common risk clauses detected in this text.</span></div>';
      return;
    }
    findings.forEach(function (f) {
      var el = document.createElement('div');
      el.className = 'finding ' + f.sev;
      el.innerHTML =
        '<div class="head"><span class="name">' + esc(f.name) + '</span><span class="sev ' + f.sev + '">' + f.sev + '</span></div>' +
        '<div class="quote">…' + esc(f.quote) + '…</div>' +
        '<div class="redline"><b>REDLINE:</b> ' + esc(f.fix) + '</div>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:8px">' + esc(f.why) + '</div>';
      listEl.appendChild(el);
    });

    var scoreEl = document.getElementById('score');
    scoreEl.textContent = count + ' flags · risk ' + score;
    scoreEl.className = 'score ' + (score >= 12 ? 'high' : score >= 5 ? 'med' : 'low');
  }

  function sampleText() {
    return [
      '1. TERM. This Agreement shall renew automatically for successive one-year terms unless either party provides notice of non-renewal at least 60 days prior to the expiration of the then-current term.',
      '2. TERMINATION. Client may terminate this Agreement at any time and for any reason upon written notice. Contractor may not terminate this Agreement.',
      '3. INDEMNIFICATION. Contractor shall indemnify, defend and hold harmless Client against all claims, damages and expenses arising out of the services.',
      '4. LIABILITY. Contractor shall be liable for any and all damages arising from the services without limitation, including consequential damages.',
      '5. PAYMENT. All fees are due within ninety (90) days of invoice. No interest accrues on late payments.',
      '6. INTELLECTUAL PROPERTY. All right, title and interest in and to all work product, including all intellectual property, shall vest exclusively in Client. Contractor shall not use any such materials for any other purpose.',
      '7. NON-COMPETE. Contractor shall not, during the term and for two years thereafter, provide services to any business that competes with Client.',
      '8. ARBITRATION. Any dispute shall be resolved by binding arbitration in Dubai, United Arab Emirates, governed by the laws of the UAE.',
      '9. CONFIDENTIALITY. Contractor shall maintain the confidentiality of all Client information indefinitely and forever.',
      '10. ASSIGNMENT. Client may assign this Agreement without Contractor\u2019s consent.'
    ].join('\n\n');
  }

  /* navigation */
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      navBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      document.querySelectorAll('.view').forEach(function (v) { v.hidden = true; });
      document.getElementById('view-' + b.dataset.view).hidden = false;
      if (b.dataset.view === 'history') renderHistory();
    });
  });

  document.getElementById('btn-analyze').addEventListener('click', function () {
    var text = textEl.value;
    var findings = analyze(text);
    render(findings);
    var h = loadHistory();
    h.unshift({ at: new Date().toISOString(), chars: text.length, flags: findings.length, score: scoreOf(findings) });
    saveHistory(h);
    document.getElementById('results').hidden = false;
  });
  document.getElementById('btn-sample').addEventListener('click', function () {
    textEl.value = sampleText();
    document.getElementById('results').hidden = true;
  });
  document.getElementById('btn-clear').addEventListener('click', function () {
    textEl.value = '';
    document.getElementById('results').hidden = true;
  });
  document.getElementById('btn-clear-history').addEventListener('click', function () {
    saveHistory([]);
    renderHistory();
  });

  function renderHistory() {
    historyEl.innerHTML = '';
    var h = loadHistory();
    if (!h.length) {
      historyEl.innerHTML = '<div class="item"><span class="meta">No analyses yet.</span></div>';
      return;
    }
    h.forEach(function (rec) {
      var el = document.createElement('div');
      el.className = 'item';
      el.innerHTML =
        '<div><span class="meta">' + new Date(rec.at).toLocaleString() + '</span> · ' + rec.chars + ' chars</div>' +
        '<div class="count">' + rec.flags + ' flags · risk ' + rec.score + '</div>';
      historyEl.appendChild(el);
    });
  }

  /* init */
  textEl = document.getElementById('contract-text');
  listEl = document.getElementById('result-list');
  historyEl = document.getElementById('history-list');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
