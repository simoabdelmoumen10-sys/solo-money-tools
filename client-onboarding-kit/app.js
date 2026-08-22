/* Client Onboarding Kit — proposal/contract/kickoff templates. On-device. */
(function () {
  'use strict';

  var tabs = document.querySelectorAll('.tab');
  var current = 'proposal';

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      current = t.dataset.tab;
      if (document.getElementById('output').value) render();
    });
  });

  function f(id, fallback) {
    var val = document.getElementById(id).value.trim();
    return val || fallback;
  }
  function fee() {
    var n = parseFloat(f('f-fee', '2500'));
    return isNaN(n) ? '$2,500' : '$' + n.toLocaleString('en-US');
  }
  function date() {
    var d = document.getElementById('f-date').value;
    if (!d) return 'TBD';
    var p = d.split('-');
    return p[1] + '/' + p[2] + '/' + p[0];
  }

  function proposal() {
    return [
      'PROPOSAL — ' + f('f-project', 'Website redesign'),
      'Prepared for: ' + f('f-client', 'Alex') + ' · by ' + f('f-business', 'Sara Designs'),
      '',
      'SCOPE',
      f('f-scope', '5-page site, copy polish, launch'),
      '',
      'INVESTMENT',
      fee() + ' flat · ' + f('f-timeline', '4 weeks') + ' · kickoff ' + date(),
      '',
      'WHAT YOU GET',
      '· Discovery & strategy workshop',
      '· Design concepts (2 rounds of revisions)',
      '· Development, QA on desktop + mobile',
      '· Launch support + 30 days of post-launch fixes',
      '',
      'TERMS',
      '· 50% deposit to book the slot, 50% on delivery',
      '· Includes 2 revision rounds; additional rounds billed at $75/hr',
      '· Valid for 14 days from this email',
      '',
      'Next step: reply \u201Clet\u2019s go\u201D and I\u2019ll send the contract + invoice.',
      '',
      f('f-name', 'Sara'),
      f('f-business', 'Sara Designs')
    ].join('\n');
  }

  function contract() {
    return [
      'FREELANCE SERVICES AGREEMENT',
      '',
      'This agreement is between ' + f('f-business', 'Sara Designs') + ' (\u201CContractor\u201D) and ' + f('f-client', 'Alex') + ' (\u201CClient\u201D) for the project: ' + f('f-project', 'Website redesign') + '.',
      '',
      '1. SCOPE. Contractor will deliver: ' + f('f-scope', '5-page site, copy polish, launch') + '. Any work outside this scope requires a written change order with agreed pricing before work begins.',
      '',
      '2. FEES & PAYMENT. Total fee: ' + fee() + '. 50% due on signature; 50% due on delivery. Payment terms: net-15. Late payments accrue 1.5% interest monthly.',
      '',
      '3. TIMELINE. Estimated ' + f('f-timeline', '4 weeks') + ' from kickoff (' + date() + '). Delays caused by missing Client feedback extend the timeline accordingly.',
      '',
      '4. REVISIONS. Two revision rounds included. Additional revisions billed at $75/hour.',
      '',
      '5. INTELLECTUAL PROPERTY. Client receives a perpetual, non-exclusive license to the deliverables upon full payment. Contractor retains ownership of pre-existing tools, templates and methodologies.',
      '',
      '6. ACCEPTANCE. Deliverables are deemed accepted 10 business days after delivery unless written defects are listed.',
      '',
      '7. TERMINATION. Either party may terminate with 15 days written notice. Work completed up to termination is paid at the agreed rate.',
      '',
      '8. LIABILITY. Each party\u2019s aggregate liability is capped at fees paid under this agreement. Neither party is liable for consequential damages.',
      '',
      '9. GOVERNING LAW. Governed by the laws of [your state/country].',
      '',
      'Signed: ______________________  Date: ____________',
      f('f-name', 'Sara') + ' — ' + f('f-business', 'Sara Designs')
    ].join('\n');
  }

  function kickoff() {
    return [
      'KICKOFF — ' + f('f-project', 'Website redesign'),
      'Hi ' + f('f-client', 'Alex') + ',',
      '',
      'Excited to start. Here\u2019s how we work — so nothing gets lost:',
      '',
      'COMMS',
      '· Check email at least once per business day; I answer within 24h',
      '· One shared channel for decisions (email or Notion)',
      '· Weekly 15-min sync every [day] at [time]',
      '',
      'WHAT I NEED FROM YOU BY ' + date(),
      '· Brand assets (logo, fonts, colors)',
      '· Content/copy or approval for me to draft',
      '· Access to any existing accounts (hosting, analytics)',
      '',
      'REVISIONS',
      '· 2 rounds included; after that $75/hr',
      '· Feedback in written lists, not scattered comments',
      '',
      'TIMELINE',
      '· Week 1: discovery + wireframes',
      '· Week 2: design',
      '· Week 3: build',
      '· Week 4: launch + handover',
      '',
      'First deliverable lands by ' + date() + '.',
      '',
      'Ready when you are — ' + f('f-name', 'Sara')
    ].join('\n');
  }

  function render() {
    var out = current === 'proposal' ? proposal() : current === 'contract' ? contract() : kickoff();
    document.getElementById('output').value = out;
  }

  document.getElementById('btn-gen').addEventListener('click', function () {
    render();
    document.getElementById('note').textContent = 'Generated ' + new Date().toLocaleTimeString();
  });
  document.getElementById('btn-copy').addEventListener('click', function () {
    var o = document.getElementById('output');
    o.select();
    try { document.execCommand('copy'); document.getElementById('note').textContent = 'Copied.'; }
    catch (e) { document.getElementById('note').textContent = 'Select + Ctrl+C to copy.'; }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
