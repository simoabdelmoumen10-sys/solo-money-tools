/* Cold Email Generator — template engine, runs entirely on-device. */
(function () {
  'use strict';

  function v(id) { return document.getElementById(id).value.trim(); }

  var TONES = {
    direct: {
      subj: function (f) { return f.company + ' — quick one'; },
      body: function (f) {
        return [
          'Hi ' + f.prospect + ',',
          '',
          'I saw ' + f.detail + '. I help businesses like ' + f.company + ' with ' + f.service + '.',
          '',
          'Concretely: ' + f.result + '. ' + f.proof + '.',
          '',
          'Worth a 10-minute call this week?',
          '',
          f.name,
          f.email
        ].join('\n');
      }
    },
    casual: {
      subj: function (f) { return 're: ' + f.company; },
      body: function (f) {
        return [
          'Hey ' + f.prospect + ',',
          '',
          'Not a pitch — genuinely liked ' + f.detail + '.',
          '',
          'I do ' + f.service + ' and mostly work with folks like you: ' + f.result + '. ' + f.proof + '.',
          '',
          'If it\u2019s useful, happy to share a few ideas. No pressure.',
          '',
          '— ' + f.name,
          f.email
        ].join('\n');
      }
    },
    value: {
      subj: function (f) { return f.company + ': 1 idea for ' + f.service; },
      body: function (f) {
        return [
          'Hi ' + f.prospect + ',',
          '',
          'Saw ' + f.detail + '. One idea, no strings:',
          '',
          'Most ' + f.service + ' projects miss on [specific gap]. If you did X, you\u2019d get ' + f.result + '.',
          '',
          'I did this for a client recently — ' + f.proof + '. Happy to walk you through it in 15 min.',
          '',
          f.name,
          f.email
        ].join('\n');
      }
    }
  };

  var PROMPTS = [
    'your new product launch post',
    'your recent rebrand',
    'your hiring announcement',
    'your podcast episode',
    'your redesigned website'
  ];
  var RESULTS = [
    'a landing page that converts',
    'a funnel that turns visitors into leads',
    'an onboarding flow that keeps users',
    'a dashboard your team actually uses',
    'an automation that saves 10 hrs/week'
  ];
  var PROOFS = [
    'Tripled signups for a SaaS client in 6 weeks.',
    'Cut a client\u2019s support tickets 40% with self-serve docs.',
    'Grew a coach\u2019s email list 3x in 2 months.',
    'Built an MVP for a startup that closed its seed round.',
    'Saved a studio 15 hours a week on manual reporting.'
  ];

  function build() {
    var f = {
      name: v('f-name') || 'Sara',
      service: v('f-service') || 'web design',
      prospect: v('f-prospect') || 'Alex',
      company: v('f-company') || 'Brightline Studio',
      detail: v('f-detail') || 'your new product launch post',
      result: v('f-result') || 'a landing page that converts',
      proof: v('f-proof') || 'tripled signups for a SaaS client',
      email: v('f-email') || 'sara@example.com'
    };
    var tone = TONES[v('f-tone')] || TONES.direct;
    return 'Subject: ' + tone.subj(f) + '\n\n' + tone.body(f);
  }

  document.getElementById('btn-gen').addEventListener('click', function () {
    document.getElementById('output').value = build();
    document.getElementById('note').textContent = 'Generated ' + new Date().toLocaleTimeString();
  });
  document.getElementById('btn-copy').addEventListener('click', function () {
    var o = document.getElementById('output');
    o.select();
    try { document.execCommand('copy'); document.getElementById('note').textContent = 'Copied.'; }
    catch (e) { document.getElementById('note').textContent = 'Select + Ctrl+C to copy.'; }
  });
  document.getElementById('btn-random').addEventListener('click', function () {
    var r = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    document.getElementById('f-detail').value = r(PROMPTS);
    document.getElementById('f-result').value = r(RESULTS);
    document.getElementById('f-proof').value = r(PROOFS);
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
