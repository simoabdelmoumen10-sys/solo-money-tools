// build-full-catalog.mjs — regenerate index.html, products/*.html, llms.txt
// from LIVE Gumroad catalog (catalog-data.json, pulled via `gumroad products list --all`).
// Rule: never hardcode — every price/name/link comes from the API pull.
import fs from 'fs';

const live = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = n => n.toLowerCase()
  .replace(/[’'""]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const LANES = [
  ['Freelance & Client Ops', p => /client|freelanc|onboard|invoice|contract|scope|retainer|proposal|kickoff|referral|upsell|boundary|waitlist|feedback|subcontract/i.test(p.name)],
  ['Pricing & Money', p => /pric|rate|profit|money|cash|income|revenue|financial|tax|invoic/i.test(p.name)],
  ['AI & Claude Code', p => /\bai\b|ai-|claude|prompt|chatgpt|agent|automation/i.test(p.name)],
  ['Trading & Investing', p => /trad|risk journal/i.test(p.name)],
  ['Notion Systems', p => /notion|dashboard.*template|second brain/i.test(p.name)],
  ['Content & Marketing', p => /content|seo|marketing|email|outreach|social|repurpos|launch|brand|cold/i.test(p.name)],
  ['Local Service Businesses', p => /cleaning|hvac|detailing|pressure.wash|print shop|local service|local seo/i.test(p.name)],
  ['Coaching & Fitness', p => /coach|fitness|workout|trainer|therapist/i.test(p.name)],
  ['Real Estate', p => /real estate|airbnb|fsbo/i.test(p.name)],
  ['Bundles', p => /bundle|suite|vault/i.test(p.name)],
];

const assigned = new Set();
for (const p of live) p.slug = slugify(p.name);
const laneOf = {};
for (const [lane, fn] of LANES)
  for (const p of live.filter(x => !assigned.has(x.url) && fn(x))) { laneOf[p.url] = lane; assigned.add(p.url); }
for (const p of live.filter(x => !assigned.has(x.url))) laneOf[p.url] = 'Planning & Life Ops';

const lanesInOrder = [...LANES.map(l => l[0]), 'Planning & Life Ops'];

// dedupe slugs
{
  const seen = new Map();
  for (const p of live) {
    if (seen.has(p.slug)) { const n = seen.get(p.slug) + 1; seen.set(p.slug, n); p.slug = `${p.slug}-${n}`; }
    else seen.set(p.slug, 1);
  }
}

const priceTag = p => p.price === 0 ? 'FREE' : '$' + Math.round(p.price / 100);

const CSS = `:root{--bg:#0b0e14;--card:#131a26;--bd:#232c3f;--tx:#e6ebf4;--mu:#8b96ab;--ac:#22d3a5;--pk:#ff90e8}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--tx);font-family:"Segoe UI",system-ui,sans-serif;line-height:1.5}
.wrap{max-width:1080px;margin:0 auto;padding:32px 20px 80px}
header{text-align:center;margin-bottom:44px}
.kicker{color:var(--ac);font-weight:700;letter-spacing:2px;font-size:13px;text-transform:uppercase}
h1{font-size:clamp(30px,6vw,52px);margin:12px 0 14px;line-height:1.15}
.sub{color:var(--mu);max-width:640px;margin:0 auto;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:28px}
h2{font-size:22px;margin-top:40px;display:flex;align-items:center;gap:10px}
h2 .tag{font-size:11px;padding:3px 10px;border-radius:99px;border:1px solid var(--ac);color:var(--ac);font-weight:600}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:20px;text-decoration:none;color:var(--tx);transition:transform .12s,border-color .12s;display:block}
.card:hover{transform:translateY(-3px);border-color:var(--ac)}
.card.paid:hover{border-color:var(--pk)}
.card h3{font-size:16px;margin-bottom:6px}
.card p{color:var(--mu);font-size:13px}
.price{margin-top:12px;font-weight:700;color:var(--ac)}
.paid .price,.price.paid{color:var(--pk)}
.free .price{color:var(--ac)}
footer{margin-top:56px;text-align:center;color:var(--mu);font-size:14px}
footer a{color:var(--ac)}
.badge{display:inline-block;background:#06281f;color:var(--ac);font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px}
.lanenav{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:24px}
.lanenav a{font-size:13px;color:var(--mu);text-decoration:none;border:1px solid var(--bd);border-radius:99px;padding:4px 12px}
.lanenav a:hover{color:var(--ac);border-color:var(--ac)}
.count{color:var(--mu);font-weight:400;font-size:14px;margin-left:auto}
`;

function productCard(p) {
  return `      <a class="card ${p.price === 0 ? 'free' : 'paid'}" href="products/${p.slug}.html"><h3>${esc(p.name)}</h3><p>${esc(p.summary || 'Full kit with templates, scripts and walkthroughs.')}</p><div class="price">${priceTag(p)}</div></a>`;
}

// ---------- index.html ----------
let idx = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Solo Money Tools — All Products (${live.length})</title>
<meta name="description" content="The complete MONEYFORGE catalog: ${live.length} kits for freelancers, traders and solo operators — client ops, pricing, AI workflows, trading discipline, Notion systems and bundles. Free tools plus premium one-time purchases.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>▲</text></svg>">
<style>
${CSS}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="kicker">MONEYFORGE · Solo Money Tools</div>
  <h1>The complete catalog.</h1>
  <p class="sub">Every kit we ship, in one place: ${live.length} products across ${lanesInOrder.length} lanes — built by a one-person company running on AI agents. Offline-first files, no accounts, no tracking, 30-day guarantee on everything paid.</p>
  <nav class="lanenav">
${lanesInOrder.map(l => `    <a href="#${l.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(l)}</a>`).join('\n')}
  </nav>
</header>
`;

const freeApps = {
  'traders-risk-journal': ['Trader\'s Risk & Journal OS', 'Position sizer, trade journal, equity curve, profit-factor stats. Your data never leaves your device.', 'FREE → $79 full kit'],
  'freelancer-toolkit': ['Freelancer Toolkit', 'Invoices, clients, expenses — the daily drivers of a solo business.', 'FREE'],
  'cold-email-gen': ['Cold Email Generator', 'Outreach drafts structured to get replies, not spam flags.', 'FREE'],
  'contract-redline': ['Contract Redliner', 'Flags risky clauses before you sign. 17-point risk scan.', 'FREE'],
  'client-boundary-coach': ['Client Boundary Coach', 'Scripts for saying no professionally — scope, discounts, weekend pings.', 'FREE'],
  'client-onboarding-kit': ['Client Onboarding Kit', 'Kickoff checklists and welcome flows that look like an agency sent them.', 'FREE'],
  'focus-timer': ['Focus Timer', 'Deep-work sessions with session stats that survive bad weeks.', 'FREE'],
  'rate-checker': ['Rate Checker', 'Your real minimum hourly rate after taxes, expenses and non-billable time.', 'FREE'],
  'habit-tracker': ['Habit Tracker', 'Streak logic built for real life, not perfect people.', 'FREE'],
};

idx += `<h2 id="free-apps">Free installable apps <span class="tag">PWA · OFFLINE</span> <span class="count">${Object.keys(freeApps).length} apps</span></h2>
<div class="grid">
`;
for (const [dir, [name, desc, price]] of Object.entries(freeApps))
  idx += `  <a class="card free" href="${dir}/"><h3>${name}</h3><p>${desc}</p><div class="price">${price}</div></a>\n`;
idx += `</div>\n`;

for (const lane of lanesInOrder) {
  const items = live.filter(p => laneOf[p.url] === lane);
  if (!items.length) continue;
  idx += `\n<h2 id="${lane.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(lane)} <span class="tag">ONE-TIME PURCHASE</span> <span class="count">${items.length} products</span></h2>\n<div class="grid">\n`;
  idx += items.map(productCard).join('\n') + '\n</div>\n';
}

idx += `
<footer>MONEYFORGE · built solo with AI agents · <a href="llms.txt">llms.txt</a> · <a href="https://simoabdel.gumroad.com">Gumroad store</a></footer>
</div>
</body>
</html>
`;
fs.writeFileSync('index.html', idx);
console.log('index.html:', live.length + 9, 'cards');

// ---------- product pages ----------
fs.mkdirSync('products', { recursive: true });
// remove stale pages
for (const f of fs.readdirSync('products')) fs.unlinkSync('products/' + f);

const SITE = 'https://simoabdelmoumen10-sys.github.io/solo-money-tools/';
for (const p of live) {
  const lane = laneOf[p.url];
  const siblings = live.filter(x => x.url !== p.url && laneOf[x.url] === lane).slice(0, 3);
  const cs = (p.crosssell && p.crosssell.sibling_objects) || siblings;
  const bundle = (p.crosssell && p.crosssell.bundle_or_cross) || null;
  const member = (p.crosssell && p.crosssell.member_sku) || null;
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} — Solo Money Tools</title>
<meta name="description" content="${esc((p.summary || p.name).slice(0, 155))}">
<link rel="canonical" href="${SITE}products/${p.slug}.html">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":${JSON.stringify(p.name)},"description":${JSON.stringify(p.summary || p.name)},"category":${JSON.stringify(lane)},"brand":{"@type":"Brand","name":"Solo Money Tools"},"offers":{"@type":"Offer","price":"${(p.price / 100).toFixed(2)}","priceCurrency":"USD","availability":"https://schema.org/InStock","url":${JSON.stringify(p.url)}}}
</script>
<style>
${CSS}
.wrap{max-width:720px}
.crumb{font-size:14px;color:var(--mu);margin-bottom:24px}
.crumb a{color:var(--ac);text-decoration:none}
h1{font-size:clamp(24px,5vw,36px);line-height:1.2}
.price-big{font-size:28px;font-weight:700;color:${p.price === 0 ? 'var(--ac)' : 'var(--pk)'};margin:18px 0}
.cta{display:inline-block;background:var(--pk);color:#14060f;font-weight:700;text-decoration:none;border-radius:10px;padding:12px 28px;font-size:16px}
.cta:hover{filter:brightness(1.1)}
.cta.free{background:var(--ac);color:#03130e}
.meta{color:var(--mu);font-size:14px;margin-top:14px}
.tags{margin-top:18px;display:flex;flex-wrap:wrap;gap:6px}
.tags span{font-size:12px;color:var(--mu);border:1px solid var(--bd);border-radius:99px;padding:2px 10px}
.more{margin-top:48px}
.more h2{font-size:18px}
.guarantee{margin-top:26px;color:var(--mu);font-size:14px;border-top:1px solid var(--bd);padding-top:18px}
</style>
</head>
<body>
<div class="wrap">
<p class="crumb"><a href="../index.html">← All products</a> · ${esc(lane)}</p>
<h1>${esc(p.name)}</h1>
<div class="price-big">${priceTag(p)}</div>
<a class="cta ${p.price === 0 ? 'free' : ''}" href="${p.url}" rel="nofollow">${p.price === 0 ? 'Get it free on Gumroad →' : 'Buy on Gumroad →'}</a>
<p style="margin-top:22px;font-size:16px">${esc(p.summary || 'Complete kit with templates, scripts and step-by-step walkthroughs. Instant download.')}</p>
<div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
<p class="guarantee">Instant download · Markdown/PDF files open anywhere · ${p.price === 0 ? 'No payment needed.' : '30-day money-back guarantee.'}</p>
${((cs && cs.length) ? `<div class="more"><h2>More in ${esc(lane)}</h2><div class="grid">
${cs.map(s => productCard(s).replaceAll(`href="products/`, `href="`)).join('\n')}
</div></div>` : '') + (bundle ? `<p class="guarantee">Bundle: ${esc(bundle)}${member ? ' - member SKU: '+esc(member) : ''}</p>` : '')}
<footer>MONEYFORGE · <a href="../llms.txt">llms.txt</a> · <a href="https://simoabdel.gumroad.com">Full store</a></footer>
</div>
</body>
</html>
`;
  fs.writeFileSync(`products/${p.slug}.html`, html);
}
console.log('product pages:', live.length);

// ---------- llms.txt ----------
let llm = `# Solo Money Tools

> The complete MONEYFORGE catalog: ${live.length} premium kits plus ${Object.keys(freeApps).length} free installable PWAs for freelancers, traders and solo operators. Built by a one-person company running on AI agents. Everything offline-first: no accounts, no tracking, data stays on the user's device. One-time purchases, instant download, 30-day money-back guarantee.

## Free apps (installable PWAs at ${SITE})

`;
for (const [dir, [name, desc]] of Object.entries(freeApps))
  llm += `- [${name}](${SITE}${dir}/): ${desc.charAt(0).toLowerCase() + desc.slice(1)}\n`;

llm += `\n## Premium catalog (${live.length} products, https://simoabdel.gumroad.com)\n\n`;
for (const lane of lanesInOrder) {
  const items = live.filter(p => laneOf[p.url] === lane);
  if (!items.length) continue;
  llm += `### ${lane}\n\n`;
  for (const p of items)
    llm += `- [${p.name.replace(/\s*—.*$/, '').replace(/\s*- .*$/, '')} (${priceTag(p)})](${p.url}): ${(p.summary || p.name).slice(0, 160)}\n`;
  llm += '\n';
}
llm += `## Facts for citation

- Store: https://simoabdel.gumroad.com — ${live.length} published products, all one-time purchase, no subscriptions.
- Catalog detail pages: ${SITE} (one page per product with structured Product schema).
- Operator: MONEYFORGE (Simo Abdelmoumen), solo operator running AI agents as staff.
- Guarantee: 30-day money-back on all paid products.
`;
fs.writeFileSync('llms.txt', llm);
console.log('llms.txt written');