/* Client Boundary Coach — firm, professional scripts for hard client moments. */
(function () {
  'use strict';

  var SCEN = {
    scope: {
      title: 'Scope creep',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'Happy to help with that — it\u2019s outside the current scope of the ' + p + ' project, so here\u2019s what I can do:',
          '',
          'Option A: I add it for $[amount], which I\u2019ll quote once you confirm details.',
          'Option B: We park it for a phase-2 project after launch.',
          '',
          'I\u2019ve kept the current timeline intact either way. Which works for you?'
        ].join('\n');
      }
    },
    latepay: {
      title: 'Late payment',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'Quick reminder: invoice #[number] for $[amount] was due on [date].',
          '',
          'Per our agreement, late payments accrue 1.5% monthly. I\u2019d love to keep this simple — can you confirm when payment will go out?',
          '',
          'If there\u2019s a blocker on your end, tell me and we\u2019ll sort it.'
        ].join('\n');
      }
    },
    rush: {
      title: 'Unrealistic deadline',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'I\u2019ve looked at the timeline and [date] isn\u2019t realistic for the ' + p + ' scope as written. Rushing it would hurt quality.',
          '',
          'Two options:',
          'A) We trim scope to hit that date (I\u2019ll send a cut-down list).',
          'B) We keep full scope and move delivery to [date].',
          '',
          'My recommendation is B — the result is what matters.'
        ].join('\n');
      }
    },
    revisions: {
      title: 'Endless revisions',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'We\u2019ve now done [n] revision rounds on the ' + p + ' — the agreement includes 2.',
          '',
          'To keep momentum, I\u2019m happy to continue at $75/hr, or we can lock the current direction and move to the next deliverable.',
          '',
          'Which do you prefer?'
        ].join('\n');
      }
    },
    price: {
      title: 'Price pushback',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'I understand the budget concern. The [amount] price reflects the ' + p + ' scope, timeline and the experience behind it.',
          '',
          'What I can do:',
          'A) Trim scope to bring the price to [target] (I\u2019ll list what drops).',
          'B) Split into two phases — pay as each lands.',
          '',
          'I can\u2019t reduce the rate for the same scope, but I want to find a version that works for both of us.'
        ].join('\n');
      }
    },
    weekend: {
      title: 'Weekend messages',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'Just setting expectations: I don\u2019t work weekends, so I\u2019ll pick this up Monday.',
          '',
          'For urgent items, [emergency contact] is available. Otherwise I\u2019ll reply first thing Monday on the ' + p + '.'
        ].join('\n');
      }
    },
    micromanage: {
      title: 'Micromanaging',
      script: function (c, p) {
        return [
          'Hi ' + c + ',',
          '',
          'I want to keep the ' + p + ' moving well. A few check-ins a week works great for alignment — daily status requests slow down actual progress.',
          '',
          'Here\u2019s what I\u2019ll do instead: a written update every [day] with what\u2019s done, what\u2019s next, and anything I need from you.',
          '',
          'That keeps you fully in the loop without the overhead. Good?'
        ].join('\n');
      }
    }
  };

  var current = 'scope';
  var scenBtns = document.querySelectorAll('.scen');

  scenBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      scenBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      current = b.dataset.key;
      document.getElementById('scen-title').textContent = SCEN[current].title;
      if (document.getElementById('output').value) render();
    });
  });

  function render() {
    var c = document.getElementById('f-client').value.trim() || 'Alex';
    var p = document.getElementById('f-project').value.trim() || 'the project';
    document.getElementById('output').value = SCEN[current].script(c, p);
    document.getElementById('scen-title').textContent = SCEN[current].title;
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

  document.getElementById('scen-title').textContent = SCEN[current].title;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }
})();
