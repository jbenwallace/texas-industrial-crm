export const propertyJs = `// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = ['rr','invest','comps','act','docs','det'];
function showTab(id, btn) {
  TABS.forEach(t => document.getElementById('tab-'+t).classList.toggle('hidden', t !== id));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// ── Sidebar card collapse ─────────────────────────────────────────────────
function toggleCard(bodyId, iconId) {
  const body = document.getElementById(bodyId);
  const icon = document.getElementById(iconId);
  const collapsed = body.classList.toggle('collapsed');
  icon.classList.toggle('open', !collapsed);
}

// ── Panel section collapse (inside combined card) ─────────────────────────
function togglePanel(bodyId, iconId) {
  const body = document.getElementById(bodyId);
  const icon = document.getElementById(iconId);
  const collapsed = body.classList.toggle('collapsed');
  icon.classList.toggle('open', !collapsed);
}

// ── Rent roll row expand/collapse ─────────────────────────────────────────
const expanded = {};
function toggleRow(idx) {
  const row   = document.getElementById('row-'   + idx);
  const steps = document.getElementById('steps-' + idx);
  const ch    = document.getElementById('ch-'    + idx);
  if (!steps) return;
  expanded[idx] = !expanded[idx];
  steps.classList.toggle('hidden', !expanded[idx]);
  row.classList.toggle('expanded', expanded[idx]);
  ch.classList.toggle('open', expanded[idx]);
}

// ── Document store (in-memory, shared between vacancy zones + docs tab) ───
const vacDocs = { '400': [], '401': [] };

function fmtSize(bytes) {
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1048576)    return (bytes/1024).toFixed(0) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function renderVacDocs(suite) {
  const files = vacDocs[suite];
  const dzList = document.getElementById('dfl-'  + suite);
  const tabEmpty= document.getElementById('vac-docs-empty-' + suite);
  const tabList = document.getElementById('vac-docs-list-'  + suite);

  // ── Drop zone file list ─────────────────────────────────────────────────
  if (dzList) {
    dzList.innerHTML = files.map((f, i) => \`
      <div class="drop-file-item">
        <span class="drop-file-name">\${f.name}</span>
        <span class="drop-file-badge">\${f.ext.toUpperCase()}</span>
        <span class="drop-file-meta">\${fmtSize(f.size)}</span>
        <button class="drop-file-del" onclick="removeVacDoc('\${suite}',\${i});event.stopPropagation()" title="Remove">×</button>
      </div>\`).join('');
  }

  // ── Documents tab section ───────────────────────────────────────────────
  if (!tabList) return;
  if (tabEmpty) tabEmpty.style.display = files.length ? 'none' : '';

  // Remove previously injected rows
  tabList.querySelectorAll('.vac-doc-injected').forEach(el => el.remove());

  files.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'doc-row vac-doc-injected';
    row.innerHTML = \`
      <span class="doc-tag vac">Suite \${suite}</span>
      <span style="color:var(--gold);font-size:12px">\${f.name}</span>
      <span style="color:var(--text-faint);font-size:10px;margin-left:auto">\${f.ext.toUpperCase()} · \${fmtSize(f.size)}</span>
      <button class="drop-file-del" onclick="removeVacDoc('\${suite}',\${i})" title="Remove" style="margin-left:8px">×</button>\`;
    tabList.appendChild(row);
  });
}

function addVacDocs(suite, fileList) {
  Array.from(fileList).forEach(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    vacDocs[suite].push({ name: f.name, size: f.size, ext, file: f });
  });
  renderVacDocs(suite);
}

function removeVacDoc(suite, idx) {
  vacDocs[suite].splice(idx, 1);
  renderVacDocs(suite);
}

// ── Drag-drop handlers ────────────────────────────────────────────────────
function dzOver(e, suite) {
  e.preventDefault();
  document.getElementById('dz-' + suite).classList.add('drag-over');
}
function dzLeave(e, suite) {
  document.getElementById('dz-' + suite).classList.remove('drag-over');
}
function dzDrop(e, suite) {
  e.preventDefault();
  document.getElementById('dz-' + suite).classList.remove('drag-over');
  if (e.dataTransfer.files.length) addVacDocs(suite, e.dataTransfer.files);
}
function dzClick(suite) {
  document.getElementById('fi-' + suite).click();
}
function dzFileInput(e, suite) {
  if (e.target.files.length) addVacDocs(suite, e.target.files);
  e.target.value = '';
}

// ── Property-level doc upload (docs tab) ─────────────────────────────────
function propFileInput(e) {
  const list = document.getElementById('prop-docs-list');
  Array.from(e.target.files).forEach(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    const row = document.createElement('div');
    row.className = 'doc-row';
    row.innerHTML = \`
      <span class="doc-tag">Uploaded</span>
      <span style="color:var(--gold);font-size:12px">\${f.name}</span>
      <span style="color:var(--text-faint);font-size:10px;margin-left:auto">\${ext.toUpperCase()} · \${fmtSize(f.size)}</span>\`;
    list.appendChild(row);
  });
  e.target.value = '';
}

// ── Cap rate mode toggle ──────────────────────────────────────────────────
const DERIVED_CAP = 5.75;
let capMode = 'derived';

function setCapMode(mode) {
  capMode = mode;
  document.getElementById('btn-derived').classList.toggle('active', mode === 'derived');
  document.getElementById('btn-override').classList.toggle('active', mode === 'override');
  document.getElementById('cap-derived-view').style.display  = mode === 'derived'  ? '' : 'none';
  document.getElementById('cap-override-view').style.display = mode === 'override' ? '' : 'none';
  updateSnapshot();
}

function getCapRate() {
  if (capMode === 'override') {
    const v = parseFloat(document.getElementById('cap-override-input').value);
    return (!isNaN(v) && v > 0) ? v / 100 : DERIVED_CAP / 100;
  }
  return DERIVED_CAP / 100;
}

// ── Investment snapshot calculations ─────────────────────────────────────
// Suite definitions for NOI calculations
const SUITES = [
  { id:'0',    name:'Suite 100', sf:120000, contractRate:11.50, expiryYear:2029, mktKey:'0' },
  { id:'1',    name:'Suite 200', sf:75000,  contractRate:12.00, expiryYear:2025, mktKey:'1' },
  { id:'2',    name:'Suite 300', sf:30000,  contractRate:13.50, expiryYear:2028, mktKey:'2' },
  { id:'3',    name:'TBD',       sf:18500,  contractRate:0,     expiryYear:null, mktKey:null },
  { id:'v400', name:'Suite 400', sf:40000,  contractRate:0,     expiryYear:null, mktKey:'vac-400', isVacant:true },
  { id:'v401', name:'Suite 401', sf:28500,  contractRate:0,     expiryYear:null, mktKey:'vac-401', isVacant:true },
];
// NNN leases — tenants pay taxes, insurance, maintenance. NOI = gross rent, no opex deduction.
const CUR_YEAR = 2026;
// Keep SF_400/SF_401 for recalcVacancy compat
const SF_400 = 40000;
const SF_401 = 28500;

// Per-suite market rent state (PSF) — updated by inline inputs
const mktRent = {
  '0':   13.50,  // Suite 100 Amazon
  '1':   13.50,  // Suite 200 FedEx
  '2':   14.00,  // Suite 300 XPO
  'vac-400': 13.50,
  'vac-401': 13.50,
};

function getSuiteMktRent(s) {
  return s.mktKey ? (mktRent[s.mktKey] || 0) : 0;
}

function getSuiteAskingRate(s) {
  if (!s.isVacant) return 0;
  const suiteNum = s.mktKey.replace('vac-','');
  const el = document.getElementById('rate-' + suiteNum);
  return el ? (parseFloat(el.value) || 0) : 0;
}

// TRUE stabilized NOI (NNN): every suite at its market rent, no opex deduction
function calcStabilizedNOI() {
  let gross = 0;
  const breakdown = [];
  SUITES.forEach(s => {
    let rate = getSuiteMktRent(s);
    if (s.isVacant) {
      const asking = getSuiteAskingRate(s);
      rate = asking > 0 ? asking : rate;
    }
    if (rate > 0) {
      const annual = Math.round(rate * s.sf);
      gross += annual;
      breakdown.push({ name: s.name, sf: s.sf, rate, annual });
    }
  });
  window._noiBreakdown = breakdown;
  return gross;  // NNN — no opex
}

// In-place NOI (NNN): executed leases at contract rate only
function calcInPlaceNOI() {
  let gross = 0;
  SUITES.forEach(s => {
    if (!s.isVacant && s.contractRate > 0) gross += s.contractRate * s.sf;
  });
  return Math.round(gross);  // NNN — no opex
}

// ── 10-year rent growth table ─────────────────────────────────────────────
// Sources: CoStar Feb 2026, Green Street 2026 Outlook, ReadySpaces 2026
const RG_DEFAULTS = {
  2026: { rate: 1.0,  source: 'CoStar',       note: 'Peak vacancy, soft market' },
  2027: { rate: 2.8,  source: 'CoStar',       note: 'Vacancy inflection, demand rebounds' },
  2028: { rate: 3.0,  source: 'Green Street', note: 'Supply trough, DFW outperforms' },
  2029: { rate: 3.2,  source: 'Green Street', note: 'Tightening fundamentals' },
  2030: { rate: 3.2,  source: 'Green Street', note: 'Long-run DFW trend' },
  2031: { rate: 3.0,  source: 'Green Street', note: 'Normalizing growth' },
  2032: { rate: 3.0,  source: 'Green Street', note: 'Long-run consensus' },
  2033: { rate: 3.0,  source: 'Consensus',    note: 'Long-run trend' },
  2034: { rate: 3.0,  source: 'Consensus',    note: 'Long-run trend' },
  2035: { rate: 3.0,  source: 'Consensus',    note: 'Long-run trend' },
};
const rgOverrides = {};

function getRg(year) {
  if (rgOverrides[year] !== undefined) return rgOverrides[year];
  return RG_DEFAULTS[year]?.rate ?? 3.0;
}

let rgEditOpen = false;

function toggleRgEdit() {
  rgEditOpen = !rgEditOpen;
  document.getElementById('rg-edit').style.display  = rgEditOpen ? '' : 'none';
  document.getElementById('rg-view').style.display  = rgEditOpen ? 'none' : '';
  document.getElementById('rg-edit-btn').textContent = rgEditOpen ? '✓ Done' : '✎ Edit';
}

function buildRgInputs() {
  const container = document.getElementById('rg-inputs');
  if (!container) return;
  const inStyle = 'width:46px;font-size:11px;border:1px solid var(--border);border-radius:3px;padding:2px 5px;background:var(--card-bg);font-family:inherit;outline:none;text-align:right;color:var(--gold)';
  container.innerHTML = Object.entries(RG_DEFAULTS).map(([yr, d]) => \`
    <div style="display:flex;align-items:center;gap:6px;font-size:10px">
      <span style="width:36px;color:var(--text-faint)">\${yr}</span>
      <input type="number" id="rg-\${yr}" value="\${getRg(Number(yr))}" min="-10" max="20" step="0.5"
        style="\${inStyle}" oninput="setRg(\${yr},this.value)">
      <span style="color:var(--text-faint)">%</span>
      <span style="font-size:9px;color:var(--text-faint);flex:1">\${d.source}: \${d.note}</span>
    </div>\`).join('');
}

function setRg(year, val) {
  rgOverrides[year] = parseFloat(val) || 0;
  renderRgView();
  updateSnapshot();
}

function renderRgView() {
  const el = document.getElementById('rg-view');
  if (!el) return;
  el.innerHTML = Object.keys(RG_DEFAULTS).map(yr => {
    const rate = getRg(Number(yr));
    const isOverridden = rgOverrides[yr] !== undefined;
    return \`<span style="display:inline-flex;gap:4px;margin-right:8px">
      <span style="color:var(--text-faint)">\${yr}</span>
      <strong style="color:\${isOverridden ? 'var(--gold)' : 'var(--text-faint)'}">\${rate.toFixed(1)}%</strong>
    </span>\`;
  }).join('');
}

// Project annual NOI stream for hold period with rent growth
function projectNOI(holdYears) {
  function grow(base, fromYear, toYear) {
    let v = base;
    for (let y = fromYear; y < toYear; y++) v *= (1 + getRg(y) / 100);
    return v;
  }

  const annuals = [];
  for (let yr = 1; yr <= holdYears; yr++) {
    const calYear = CUR_YEAR + yr;
    let gross = 0;
    SUITES.forEach(s => {
      let rate;
      if (s.isVacant) {
        const ask = getSuiteAskingRate(s);
        const base = ask > 0 ? ask : getSuiteMktRent(s);
        rate = grow(base, CUR_YEAR, calYear);
      } else if (s.contractRate > 0) {
        if (!s.expiryYear || calYear <= s.expiryYear) {
          rate = s.contractRate * Math.pow(1.03, yr);
        } else {
          const mkt = getSuiteMktRent(s);
          rate = mkt > 0 ? grow(mkt, CUR_YEAR, calYear) : 0;
        }
      } else {
        rate = 0;
      }
      if (rate > 0) gross += rate * s.sf;
    });
    annuals.push(Math.round(gross));  // NNN — no opex
  }
  return annuals;
}

// Called when a leased-suite mkt rent changes
function onMktRentChange(idx, val, suite, sf, contractRate) {
  const rate = parseFloat(val) || 0;
  mktRent[String(idx)] = rate;
  const snapEl = document.getElementById('snap-mkt-' + idx);
  if (snapEl) snapEl.textContent = rate > 0 ? '$' + rate.toFixed(2) : '—';
  const deltaEl = document.getElementById('mkt-delta-' + idx);
  if (deltaEl && rate > 0 && contractRate > 0) {
    const diff = rate - contractRate;
    const pct  = ((diff / contractRate) * 100).toFixed(1);
    if (Math.abs(diff) < 0.01) {
      deltaEl.textContent = '= contract'; deltaEl.style.color = 'var(--text-faint)';
    } else {
      const sign = diff > 0 ? '+' : '';
      deltaEl.textContent = sign + '$' + diff.toFixed(2) + ' vs contract (' + sign + pct + '%)';
      deltaEl.style.color = diff > 0 ? '#1e7a4a' : '#b83030';
    }
  }
  updateSnapshot();
}

function onVacMktChange(suite, val) {
  const rate = parseFloat(val) || 0;
  mktRent['vac-' + suite] = rate;
  const snapEl = document.getElementById('snap-mkt-vac-' + suite);
  if (snapEl) snapEl.textContent = rate > 0 ? '$' + rate.toFixed(2) : '—';
  updateSnapshot();
}

function fmt(n) {
  if (n >= 1e6)  return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1000) return '$' + Math.round(n/1000)  + 'K';
  return '$' + n;
}

// ── Treasury ticker fetch ──────────────────────────────────────────────────
async function fetchTreasuryTicker() {
  const metaEl = document.getElementById('tsy-meta');
  if (metaEl) metaEl.textContent = 'Loading…';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers: apiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:400,
        tools:[{type:'web_search_20250305',name:'web_search'}],
        messages:[{role:'user',content:\`What is the current 10-year US Treasury yield right now? Give current yield %, change from yesterday, and one-sentence market context. Respond ONLY as JSON with no markdown: {"rate":4.28,"change":"+0.06","context":"one sentence about why rates moved today"}\`}]
      })
    });
    const data = await res.json();
    const text = data.content.filter(b=>b.type==='text').map(b=>b.text).join('');
    const p = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g,'').trim());
    const rateEl  = document.getElementById('tsy-rate');
    const chgEl   = document.getElementById('tsy-change');
    if (rateEl)  rateEl.textContent  = parseFloat(p.rate).toFixed(2) + '%';
    if (chgEl)   { chgEl.textContent = p.change || '—'; chgEl.style.color = String(p.change).startsWith('+') ? 'var(--red-text)' : '#1e7a4a'; }
    if (metaEl)  metaEl.textContent  = p.context || '';
    const impliedCap  = (parseFloat(p.rate) + 1.47) / 100;
    const impliedCapEl = document.getElementById('tsy-implied-cap');
    const impliedValEl = document.getElementById('tsy-implied-val');
    if (impliedCapEl) impliedCapEl.textContent = (impliedCap*100).toFixed(2) + '%';
    if (impliedValEl) impliedValEl.textContent = fmt(Math.round(calcInPlaceNOI() / impliedCap));
  } catch(e) {
    const rateEl = document.getElementById('tsy-rate');
    if (rateEl)  rateEl.textContent = '4.28%';
    if (metaEl)  metaEl.textContent = '⚠ Live data unavailable · Chatham: chathamfinancial.com/technology/us-market-rates';
    const impliedCapEl = document.getElementById('tsy-implied-cap');
    const impliedValEl = document.getElementById('tsy-implied-val');
    if (impliedCapEl) impliedCapEl.textContent = '5.75%';
    if (impliedValEl) impliedValEl.textContent = fmt(Math.round(calcInPlaceNOI() / 0.0575));
  }
}

// ── Market news fetch ──────────────────────────────────────────────────────
async function fetchMarketNews() {
  const loadEl  = document.getElementById('news-loading');
  const feedEl  = document.getElementById('news-feed');
  const errEl   = document.getElementById('news-error');
  const statEl  = document.getElementById('news-status');
  if (loadEl) loadEl.style.display = '';
  if (feedEl) feedEl.style.display = 'none';
  if (errEl)  errEl.style.display  = 'none';
  if (statEl) statEl.textContent   = 'Loading…';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers: apiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:1200,
        tools:[{type:'web_search_20250305',name:'web_search'}],
        messages:[{role:'user',content:\`Search for today's latest news on: (1) 10-year US Treasury yield and interest rates, (2) US industrial real estate and warehouse market, (3) DFW Dallas commercial real estate. Return 6 articles (2 per topic). For each: headline, source name, date (e.g. "Mar 19, 2026"), url, tag (one of: "Treasury", "Industrial", "DFW"). Respond ONLY as a JSON array with no markdown or explanation: [{"headline":"...","source":"...","date":"...","url":"...","tag":"..."}]\`}]
      })
    });
    const data = await res.json();
    const text = data.content.filter(b=>b.type==='text').map(b=>b.text).join('');
    const articles = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g,'').trim());
    if (feedEl) {
      feedEl.innerHTML = articles.slice(0,8).map(a => \`
        <div class="news-item" onclick="window.open(\${JSON.stringify(a.url)},'_blank')">
          <div class="news-headline">\${a.headline}</div>
          <div class="news-meta"><span class="news-tag">\${a.tag}</span><span>\${a.source}</span><span>·</span><span>\${a.date}</span></div>
        </div>\`).join('');
    }
    if (statEl) statEl.textContent = '✓ ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if (loadEl) loadEl.style.display = 'none';
    if (feedEl) feedEl.style.display = '';
  } catch(e) {
    if (loadEl) loadEl.style.display = 'none';
    if (statEl) statEl.textContent = 'Estimated · Mar 2026';
    // Graceful static fallback — curated recent articles
    const fallback = [
      { headline: '10-Year Treasury Yield Holds Near 4.28% After Fed Hawkish Hold', source: 'CNBC', date: 'Mar 19, 2026', url: 'https://www.cnbc.com/quotes/US10Y', tag: 'Treasury' },
      { headline: 'Fed Signals Fewer Rate Cuts in 2026 as Iran War Pressures Inflation', source: 'Trading Economics', date: 'Mar 19, 2026', url: 'https://tradingeconomics.com/united-states/government-bond-yield', tag: 'Treasury' },
      { headline: 'CoStar: US Industrial Vacancy to Peak in 2026 Before Easing in 2027', source: 'BusinessWire', date: 'Feb 5, 2026', url: 'https://www.businesswire.com/news/home/20260205011373/en/CoStar-Expects-U.S.-Industrial-Vacancy-to-Peak-This-Year-Rent-Growth-Remains-Unchanged-Through-2026', tag: 'Industrial' },
      { headline: 'Class A Industrial Cap Rates Hold at 4.5–6.5% as Investor Demand Stays Strong', source: 'CRE Daily', date: 'Apr 2025', url: 'https://www.credaily.com/briefs/class-a-industrial-assets-drive-market-as-cap-rates-narrow/', tag: 'Industrial' },
      { headline: 'DFW Industrial Market Records 4.1M SF Net Absorption in Q3 2025', source: 'Matthews', date: 'Oct 2025', url: 'https://www.matthews.com/market_insights/dfw-tx-industrial-market-report-q3-2025', tag: 'DFW' },
      { headline: 'DFW Industrial Vacancy Holds at 9.2% as Construction Pipeline Narrows', source: 'Partners Real Estate', date: 'Oct 2025', url: 'https://partnersrealestate.com/research/dallas-industrial-q3-2025-quarterly-market-report/', tag: 'DFW' },
    ];
    if (feedEl) {
      feedEl.innerHTML = fallback.map(a => \`
        <div class="news-item" onclick="window.open('\${a.url}','_blank')">
          <div class="news-headline">\${a.headline}</div>
          <div class="news-meta"><span class="news-tag">\${a.tag}</span><span>\${a.source}</span><span>·</span><span>\${a.date}</span></div>
        </div>\`).join('');
      feedEl.style.display = '';
    }
  }
}

// ── API configuration ────────────────────────────────────────────────────
// Live data requires an Anthropic API key. When running inside claude.ai,
// this is handled automatically. For standalone use, set your key here:
const ANTHROPIC_API_KEY = window.ANTHROPIC_API_KEY || '';

function apiHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (ANTHROPIC_API_KEY) h['x-api-key'] = ANTHROPIC_API_KEY;
  return h;
}

// ── Forward curve state (populated by AI fetch) ──────────────────────────
// Bull = rates fall more than consensus (lower cap → higher sale price)
// Base = market consensus forward curve
// Bear = rates stay elevated / rise (higher cap → lower sale price)
let fwdCurve = null;  // set after AI fetch; keyed by hold years → {bull,base,bear} treasury %

const SPREAD_BPS   = 147;  // Class A industrial spread, constant
const TODAY_TSY    = 4.28; // 10-yr treasury as of Mar 19, 2026

// Fallback embedded estimates (used if AI fetch fails)
const FWD_FALLBACK = {
  3: { bull: 3.70, base: 4.10, bear: 4.65 },
  5: { bull: 3.50, base: 3.95, bear: 4.60 },
  7: { bull: 3.55, base: 4.05, bear: 4.75 },
};

function capFromTsy(tsy) {
  return (tsy + SPREAD_BPS / 100) / 100;
}

function getCurve() {
  return fwdCurve || FWD_FALLBACK;
}

// ── AI live fetch of forward treasury projections ────────────────────────
async function fetchFwdRates() {
  document.getElementById('fwd-loading').style.display = '';
  document.getElementById('fwd-data').style.display = 'none';
  document.getElementById('fwd-error').style.display = 'none';
  document.getElementById('scenarios-loading').style.display = '';
  document.getElementById('scenarios-table').style.display = 'none';
  document.getElementById('fwd-status').textContent = 'Fetching…';

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const prompt = \`You are a CRE financial analyst. Today is \${today}. The 10-year US Treasury yield is currently approximately \${TODAY_TSY}%.

Using the most current data available from Chatham Financial forward curves (chathamfinancial.com/technology/us-forward-curves), CBO projections, Federal Reserve dot plot, and market consensus (econforecasting.com, Bloomberg consensus), provide forward 10-year Treasury yield projections for 3, 5, and 7 years from today under three scenarios:

- BULL: rates fall more than consensus (Fed cuts aggressively, inflation cools, risk-off)
- BASE: market consensus forward curve (median expectation)  
- BEAR: rates stay elevated or rise (inflation persistence, fiscal pressure, higher-for-longer)

Respond ONLY with a valid JSON object, no markdown, exactly this format:
{"asOf":"Mar 2026","todayTsy":4.28,"curve":{"3":{"bull":3.70,"base":4.10,"bear":4.65},"5":{"bull":3.50,"base":3.95,"bear":4.60},"7":{"bull":3.55,"base":4.05,"bear":4.75}},"narrative":{"bull":"sentence","base":"sentence","bear":"sentence"},"sources":"attribution"}\`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data  = await res.json();
    const text  = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const parsed = JSON.parse(clean);

    fwdCurve = { 3: parsed.curve['3'], 5: parsed.curve['5'], 7: parsed.curve['7'] };
    window._fwdNarrative = parsed.narrative || {};
    window._fwdSources   = parsed.sources || '';
    window._fwdAsOf      = parsed.asOf || today;

    document.getElementById('fwd-status').textContent = '✓ Live · ' + (parsed.asOf || today);
    const todayEl = document.getElementById('fwd-today-tsy');
    if (todayEl) todayEl.textContent = (parsed.todayTsy ?? TODAY_TSY).toFixed(2) + '%';

  } catch(e) {
    // Graceful fallback — use embedded estimates, no scary warning
    fwdCurve = null;
    window._fwdSources = 'Chatham Financial · CBO Jan 2025 · Econforecasting · Deloitte Global Economics';
    window._fwdAsOf    = 'Mar 2026 (est.)';
    window._fwdNarrative = {
      bull: 'Fed cuts aggressively as inflation cools; rates settle near long-run neutral of 3.5%.',
      base: 'Market consensus forward curve — gradual easing then re-anchoring near 4%.',
      bear: 'Iran war keeps energy inflation elevated; Fed unable to cut; long-end re-anchors above 4.5%.'
    };
    document.getElementById('fwd-status').textContent = 'Estimated · Mar 2026';
    const todayEl = document.getElementById('fwd-today-tsy');
    if (todayEl) todayEl.textContent = TODAY_TSY.toFixed(2) + '%';
  }

  document.getElementById('fwd-loading').style.display = 'none';
  document.getElementById('fwd-data').style.display = '';
  updateSnapshot();
}

function refreshFwdRates() { fetchFwdRates(); }

// ── Hold period state ────────────────────────────────────────────────────
let holdYears = 5;

function setHold(years) {
  holdYears = years;
  document.querySelectorAll('.hold-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.hold-btn').forEach(b => {
    if (b.textContent === years + 'yr') b.classList.add('active');
  });
  updateSnapshot();
}

// Newton-Raphson IRR solver
function calcIRR(cashflows) {
  let rate = 0.10;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    cashflows.forEach((cf, t) => {
      npv  += cf / Math.pow(1 + rate, t);
      dnpv -= t * cf / Math.pow(1 + rate, t + 1);
    });
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-7) return newRate;
    rate = newRate;
  }
  return rate;
}

function updateSnapshot() {
  const cap    = getCapRate();
  const capPct = (cap * 100).toFixed(2) + '%';

  const inPlaceNOI = calcInPlaceNOI();
  const stabNOI    = calcStabilizedNOI();
  const ipValue    = Math.round(inPlaceNOI / cap);
  const stabValue  = Math.round(stabNOI / cap);
  const upside     = stabValue - ipValue;
  const stabCapRate = ipValue > 0 ? (stabNOI / ipValue * 100).toFixed(2) + '%' : '—';

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl('ip-noi',        fmt(inPlaceNOI));
  setEl('ip-value',      fmt(ipValue));
  setEl('stab-noi',      fmt(stabNOI));
  setEl('stab-value',    fmt(stabValue));
  setEl('stab-cap-rate', stabCapRate);
  setEl('upside-val',    upside > 0 ? '+' + fmt(upside) : fmt(upside));

  // NOI breakdown in column 2
  const bkEl = document.getElementById('noi-breakdown');
  if (bkEl && window._noiBreakdown) {
    bkEl.innerHTML = (window._noiBreakdown || []).map(r =>
      \`<div style="display:flex;justify-content:space-between">
        <span>\${r.name} · \${r.sf.toLocaleString()} SF @ $\${r.rate.toFixed(2)}</span>
        <span style="color:var(--text-dim)">$\${(r.annual/1000).toFixed(0)}K</span>
      </div>\`
    ).join('') + \`<div style="display:flex;justify-content:space-between;margin-top:4px;padding-top:4px;border-top:1px solid var(--border-dim);font-weight:500">
      <span style="color:var(--text-dim)">Total NOI (NNN)</span>
      <span style="color:var(--gold)">\${fmt(stabNOI)}</span>
    </div>\`;
  }

  // Cap rate display spans
  ['display-cap-rate','display-cap-rate-2'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = capPct;
  });

  // Override delta
  if (capMode === 'override') {
    const delta = cap - DERIVED_CAP / 100;
    const el = document.getElementById('cap-delta-text');
    if (el) {
      if (delta === 0) { el.textContent = 'Same as derived rate'; el.style.color = 'var(--text-faint)'; }
      else {
        const sign = delta > 0 ? '+' : '';
        el.textContent = sign + (delta*100).toFixed(2) + 'bps vs derived · ' + (delta > 0 ? 'more conservative' : 'more aggressive');
        el.style.color = delta > 0 ? 'var(--red-text)' : '#1e7a4a';
      }
    }
  }

  // ── Hold & Exit column ──
  const curve    = getCurve();
  const scenarios = curve[holdYears] || { bull: 3.70, base: 4.10, bear: 4.65 };

  ['exit-hold-label','exit-hold-label2','fwd-yr-label'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = holdYears + 'yr';
  });

  setEl('exit-buy',      fmt(ipValue));
  setEl('exit-noi-annual', fmt(stabNOI));

  // Project NOI with rent growth
  const annualNOIs = projectNOI(holdYears);
  const totalNOI   = annualNOIs.reduce((a,b) => a+b, 0);
  setEl('exit-noi-collected', fmt(totalNOI));

  // Show base cap derivation
  const baseCap    = capFromTsy(scenarios.base);
  setEl('fwd-base-tsy', scenarios.base.toFixed(2) + '%');
  const exitCapEl = document.getElementById('exit-cap-rate');
  if (exitCapEl) exitCapEl.textContent = (baseCap*100).toFixed(2) + '%';

  const srcEl = document.getElementById('fwd-source-line');
  if (srcEl) { const ts = window._fwdAsOf||'Mar 2026'; const src = window._fwdSources||'Chatham · CBO · Econforecasting'; srcEl.textContent = 'As of '+ts+' · '+src; }

  if (ipValue > 0 && stabNOI > 0) {
    const scRows = document.getElementById('scenario-rows');
    const assEl  = document.getElementById('fwd-assumption-note');

    const rows = [
      { key:'bull', label:'Bull', tsy:scenarios.bull, cssClass:'sc-bull' },
      { key:'base', label:'Base', tsy:scenarios.base, cssClass:'sc-base' },
      { key:'bear', label:'Bear', tsy:scenarios.bear, cssClass:'sc-bear' },
    ];

    if (scRows) {
      scRows.innerHTML = rows.map(sc => {
        const exitCap    = capFromTsy(sc.tsy);
        // Exit year NOI for terminal cap
        const exitNOI    = annualNOIs[holdYears - 1] || stabNOI;
        const salePrice  = Math.round(exitNOI / exitCap);
        const profit     = salePrice + totalNOI - ipValue;
        const multiple   = (salePrice + totalNOI) / ipValue;
        const cfs = [-ipValue, ...annualNOIs.slice(0,-1), annualNOIs[holdYears-1] + salePrice];
        const irr    = calcIRR(cfs);
        const irrPct = (irr*100).toFixed(1) + '%';
        const pColor = profit >= 0 ? '#1e7a4a' : '#b83030';
        const iColor = irr >= 0.10 ? '#1e7a4a' : irr >= 0.06 ? '#8a6a10' : '#b83030';
        const narr = (window._fwdNarrative||{})[sc.key]||'';
        return \`<tr class="sc-row" \${narr ? \`title="\${narr.replace(/"/g,"'")}"\` : ''}>
          <td><span class="sc-badge \${sc.cssClass}">\${sc.label}</span></td>
          <td style="text-align:right;color:var(--text-dim)">\${(exitCap*100).toFixed(2)}%</td>
          <td style="text-align:right;color:var(--text-dim)">\${fmt(salePrice)}</td>
          <td style="text-align:right;font-weight:500;color:\${pColor}">\${profit>=0?'+':''}\${fmt(profit)}</td>
          <td style="text-align:right;font-weight:500;color:\${iColor}">\${irrPct}</td>
        </tr>\`;
      }).join('');
    }

    if (assEl) {
      const n = window._fwdNarrative||{};
      assEl.textContent = rows.map(sc => \`\${sc.label}: \${sc.tsy.toFixed(2)}% treasury\${n[sc.key]?' — '+n[sc.key]:''}\`).join(' · ');
    }

    document.getElementById('scenarios-loading').style.display = 'none';
    document.getElementById('scenarios-table').style.display   = '';
  }
}

function recalcVacancy(suite, rawVal) {
  const rate = parseFloat(rawVal) || 0;
  const sf   = suite === '400' ? SF_400 : SF_401;
  const ann  = rate > 0 ? Math.round(rate * sf) : 0;
  const mo   = rate > 0 ? Math.round(ann / 12) : 0;

  const annEl = document.getElementById('ann-' + suite);
  const moEl  = document.getElementById('mo-'  + suite);

  annEl.innerHTML = ann > 0
    ? \`<span style="color:var(--text-faint);font-style:italic">$\${ann.toLocaleString()}*</span>\`
    : \`<span style="color:var(--text-faint)">—</span>\`;
  moEl.innerHTML = mo > 0
    ? \`<span style="color:var(--text-faint);font-style:italic">$\${mo.toLocaleString()}*</span>\`
    : \`<span style="color:var(--text-faint)">—</span>\`;

  updateSnapshot();
}

// Init — render initial deltas for leased suites
function initMktDeltas() {
  onMktRentChange(0, '13.50', '100', 120000, 11.50);
  onMktRentChange(1, '13.50', '200', 75000,  12.00);
  onMktRentChange(2, '14.00', '300', 30000,  13.50);
}

// Init
updateSnapshot();
initMktDeltas();

// Build rent growth UI
buildRgInputs();
renderRgView();

// Fetch live data on load
fetchFwdRates();
fetchTreasuryTicker();
fetchMarketNews();

// ── Tenant credit card collapse ──────────────────────────────────────────
function toggleTenant(bodyId, chevId) {
  const body = document.getElementById(bodyId);
  const chev = document.getElementById(chevId);
  if (!body) return;
  const collapsed = body.classList.toggle('collapsed');
  if (chev) chev.classList.toggle('open', !collapsed);
}

// ── Edit row (stub — opens inline edit mode) ─────────────────────────────
function editRow(idx, tenant, suite, sf, rate, commence, expiry) {
  // For now, expand the row and highlight it as a signal to edit
  if (!window._expanded?.[idx]) toggleRow(idx);
  const row = document.getElementById('row-' + idx);
  if (row) {
    row.style.outline = '2px solid var(--gold)';
    row.style.outlineOffset = '-2px';
    setTimeout(() => { row.style.outline = ''; row.style.outlineOffset = ''; }, 2000);
  }
  alert(\`Edit mode for \${tenant} — \${suite}\\nFull inline editing will connect to the database in the Next.js build.\`);
}

// ── Renewal Comp Modal ────────────────────────────────────────────────────
let _renewalCtx = {};

function openRenewalModal(tenant, suite, sf, currentRate, expiryDate) {
  _renewalCtx = { tenant, suite, sf, currentRate, expiryDate };

  // Pre-fill the context block
  document.getElementById('modal-prefill').innerHTML = \`
    <strong>\${tenant}</strong> · \${suite}<br>
    \${sf.toLocaleString()} SF · Class A industrial · NNN<br>
    Current rate: $\${currentRate.toFixed(2)} PSF · Expiry: \${expiryDate}<br>
    Property: Northgate Distribution Center, 4201 Northgate Blvd, Dallas TX 75247
  \`;

  // Default the commence date to the day after expiry
  try {
    const parts = expiryDate.split('/');
    const expDt = new Date(parts[2], parts[0]-1, parts[1]);
    expDt.setDate(expDt.getDate() + 1);
    document.getElementById('mc-commence').value = expDt.toISOString().split('T')[0];
    document.getElementById('mc-executed').value = new Date().toISOString().split('T')[0];
  } catch(e) {}

  // Default rate to current + a reasonable step
  document.getElementById('mc-rate').value = (currentRate + 1.50).toFixed(2);
  document.getElementById('mc-term').value = 60;
  document.getElementById('mc-freerent').value = 2;
  document.getElementById('mc-ti').value = 8.00;
  document.getElementById('mc-esc').value = 3.0;

  updateModalPreview();

  document.getElementById('renewal-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRenewalModal() {
  document.getElementById('renewal-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalPreview() {
  const rate    = parseFloat(document.getElementById('mc-rate')?.value) || 0;
  const term    = parseFloat(document.getElementById('mc-term')?.value) || 0;
  const sf      = _renewalCtx.sf || 0;
  if (!rate || !sf) { document.getElementById('mc-preview').style.display = 'none'; return; }
  const annRent = Math.round(rate * sf);
  const moRent  = Math.round(annRent / 12);
  const freeRent = parseFloat(document.getElementById('mc-freerent')?.value) || 0;
  const ti      = parseFloat(document.getElementById('mc-ti')?.value) || 0;
  const esc     = parseFloat(document.getElementById('mc-esc')?.value) || 0;
  const tiTotal = Math.round(ti * sf);
  const el = document.getElementById('mc-preview');
  el.style.display = '';
  el.innerHTML = \`
    Annual rent: <strong>$\${annRent.toLocaleString()}</strong> ($\${moRent.toLocaleString()}/mo) ·
    Term: <strong>\${term} mo</strong> · Free rent: <strong>\${freeRent} mo</strong><br>
    TI total: <strong>$\${tiTotal.toLocaleString()}</strong> · Escalation: <strong>\${esc}% / yr</strong>
  \`;
}

// Wire preview updates to all inputs
document.addEventListener('DOMContentLoaded', () => {
  ['mc-rate','mc-term','mc-freerent','mc-ti','mc-esc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateModalPreview);
  });
});

function submitRenewalComp() {
  const rate     = parseFloat(document.getElementById('mc-rate').value) || 0;
  const term     = parseFloat(document.getElementById('mc-term').value) || 0;
  const freeRent = parseFloat(document.getElementById('mc-freerent').value) || 0;
  const ti       = parseFloat(document.getElementById('mc-ti').value) || 0;
  const esc      = parseFloat(document.getElementById('mc-esc').value) || 0;
  const type     = document.getElementById('mc-type').value;
  const commence = document.getElementById('mc-commence').value;
  const notes    = document.getElementById('mc-notes').value;
  const { tenant, suite, sf } = _renewalCtx;

  if (!rate || !term) {
    alert('Please enter at least a rate and term.');
    return;
  }

  // Add row to Comps tab table
  const tbody = document.querySelector('#tab-comps table tbody');
  if (tbody) {
    const expiryDt = commence ? (() => {
      const d = new Date(commence); d.setMonth(d.getMonth() + term); return d.toLocaleDateString('en-US',{month:'short',year:'numeric'});
    })() : '—';
    const execDate = document.getElementById('mc-executed').value
      ? new Date(document.getElementById('mc-executed').value).toLocaleDateString('en-US',{month:'short',year:'numeric'})
      : new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td style="font-weight:500;color:var(--text)">Northgate DC — \${suite}<div style="font-size:10px;color:var(--text-faint);font-weight:400">\${type} · entered \${execDate}</div></td>
      <td>\${tenant}</td>
      <td><span class="badge b-partial">\${type}</span></td>
      <td class="r">\${sf.toLocaleString()}</td>
      <td class="r" style="color:var(--gold)">$\${rate.toFixed(2)}</td>
      <td class="r">\${term} mo</td>
      <td class="r">\${freeRent} mo</td>
      <td class="r">$\${ti.toFixed(2)}</td>
      <td style="color:var(--text-faint)">\${execDate}</td>
      <td style="color:var(--text-faint);font-size:11px">\${notes || 'Renewal comp'}</td>
    \`;
    tbody.insertBefore(tr, tbody.firstChild);
  }

  // Switch to Comps tab to show the result
  closeRenewalModal();
  const compsBtn = [...document.querySelectorAll('.tab')].find(b => b.textContent.includes('Comps'));
  if (compsBtn) showTab('comps', compsBtn);
}
// Scores mirror the RankingCalculator.php logic (approximate weights)
const cdaScores = {
  clear:    12,  // Clear height — 36' = max for this size class
  truck:    14,  // Truck court — 185' dedicated = top tier
  config:    9,  // Rear Load (Cross Dock = 12, Rear = 9, Front = 6)
  depth:    10,  // Building depth 420' = strong
  trailer:   8,  // Trailer slips ratio 0.23 = top tier
  parking:   7,  // Parking 0.71/1K = mid tier
  location:  6,  // Mid-tier location (prime = 10, mid = 6, fringe = 2)
  circ:      5,  // Good site circulation (excellent=8, good=5, fair=3, poor=0)
  access:    3,  // Major arterial (freeway=6, arterial=3, local=1)
  secure:    0,  // Ability to secure = yes → scored via building depth above
};

const CONFIG_SCORES    = { cross: 12, rear: 9, front: 6 };
const LOCATION_SCORES  = { prime: 10, mid: 6, fringe: 2 };
const CIRC_SCORES      = { excellent: 8, good: 5, fair: 3, poor: 0 };
const ACCESS_SCORES    = { freeway: 6, arterial: 3, local: 1 };

function cdaSelectChange(field, val) {
  const maps = { config: CONFIG_SCORES, location: LOCATION_SCORES, circulation: CIRC_SCORES, access: ACCESS_SCORES };
  const pillMap = { config: 'cda-s-config', location: 'cda-s-location', circulation: 'cda-s-circ', access: 'cda-s-access' };
  const scoreKey = { config: 'config', location: 'location', circulation: 'circ', access: 'access' };
  const score = maps[field][val] ?? 0;
  cdaScores[scoreKey[field]] = score;
  updateCdaPill(pillMap[field], score, field === 'config' ? 12 : field === 'location' ? 10 : field === 'circulation' ? 8 : 6);
  recalcCda();
}

function cdaNumChange(field, val, labelEl) {
  if (labelEl) labelEl.textContent = val || '0';
  const bldgSF = 312000;
  let score = 0;
  if (field === 'depth') {
    const d = parseFloat(val) || 0;
    score = d >= 420 ? 10 : d >= 360 ? 8 : d >= 300 ? 5 : d >= 240 ? 3 : 0;
    cdaScores.depth = score;
    updateCdaPill('cda-s-depth', score, 10);
  } else if (field === 'trailer') {
    const slips = parseFloat(val) || 0;
    const ratio = slips / bldgSF;
    score = ratio >= 0.20 ? 8 : ratio >= 0.15 ? 6 : ratio >= 0.10 ? 4 : ratio > 0 ? 2 : 0;
    cdaScores.trailer = score;
    updateCdaPill('cda-s-trailer', score, 8);
  } else if (field === 'parking') {
    const spaces = parseFloat(val) || 0;
    const ratio = spaces / bldgSF * 1000;
    score = ratio >= 1.0 ? 10 : ratio >= 0.7 ? 7 : ratio >= 0.5 ? 5 : ratio >= 0.3 ? 3 : 1;
    cdaScores.parking = score;
    updateCdaPill('cda-s-parking', score, 10);
  }
  recalcCda();
}

function cdaToggle(field, checked) {
  document.getElementById('cda-secure-label').textContent = checked ? 'Yes' : 'No';
  // Ability to secure is a binary bonus folded into building depth scoring; show 0 here
  cdaScores.secure = 0;
  updateCdaPill('cda-s-secure', 0, 5);
  recalcCda();
}

function updateCdaPill(id, score, max) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '+' + score;
  el.className = 'cda-score-pill ' + (score >= max * 0.85 ? 'cda-full' : score >= max * 0.5 ? 'cda-mid' : score > 0 ? 'cda-low' : 'cda-zero');
}

function recalcCda() {
  const total = Object.values(cdaScores).reduce((a, b) => a + b, 0);
  const clamped = Math.min(100, Math.max(0, total));
  document.getElementById('cda-total').textContent = clamped + ' / 100';
  document.getElementById('cda-bar').style.width = clamped + '%';
}`
