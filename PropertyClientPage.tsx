@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --navy: #13243a; --navy-mid: #1a2f48;
  --page-bg: #f5f0e8; --card-bg: #fffcf6; --card-alt: #fdf8f0;
  --row-hover: #fdf5e4; --row-exp: #fef9ed;
  --gold: #7a6e52; --gold-light: #9e8f64;
  --gold-dim: rgba(122,110,82,0.14); --gold-glow: rgba(122,110,82,0.07);
  --text: #1e2d3d; --text-dim: #4a6080; --text-faint: #8aa0b8;
  --border: rgba(122,110,82,0.22); --border-dim: rgba(26,47,72,0.09); --border-card: rgba(26,47,72,0.12);
  --red-text: #b83030; --green-text: #1e7a4a;
  --side-text: #c8d8ec; --side-dim: #7090b0; --side-faint: #3d5570;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: var(--page-bg); color: var(--text); font-size: 13px; }
.hidden { display: none !important; }

/* Sidebar */
.sidebar-left { width:200px; flex-shrink:0; background:var(--navy); display:flex; flex-direction:column; overflow-y:auto; }
.sidebar-brand { padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,0.07); }
.sidebar-brand-name { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:600; color:var(--gold-light); line-height:1.2; }
.sidebar-brand-sub { font-size:9px; color:var(--side-dim); text-transform:uppercase; letter-spacing:0.1em; margin-top:2px; }
.nav-section-label { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:var(--side-faint); font-weight:500; padding:14px 16px 4px; }
.nav-item { display:flex; align-items:center; gap:8px; padding:8px 16px; font-size:12px; color:var(--side-dim); cursor:pointer; transition:all 0.12s; text-decoration:none; }
.nav-item:hover { color:var(--side-text); background:rgba(255,255,255,0.04); }
.nav-item.active { color:var(--gold-light); background:rgba(122,110,82,0.1); }

/* Cards */
.card { background:var(--card-bg); border:1px solid var(--border-card); border-radius:6px; overflow:hidden; }
.card-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid var(--border-dim); }
.card-title { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:600; color:var(--text); }
.card-sub { font-size:10px; color:var(--text-faint); }
.card-header.collapsible { cursor:pointer; user-select:none; }
.card-header.collapsible:hover { background:var(--row-hover); }
.collapse-icon { width:18px; height:18px; display:flex; align-items:center; justify-content:center; color:var(--text-faint); font-size:11px; transition:transform 0.2s; flex-shrink:0; }
.collapse-icon.open { transform:rotate(90deg); }
.card-collapsible-body { overflow:hidden; max-height:2000px; transition:max-height 0.25s ease, opacity 0.2s ease; opacity:1; }
.card-collapsible-body.collapsed { max-height:0; opacity:0; }

/* Rent roll table */
.rr-summary { display:flex; gap:20px; padding:8px 16px; background:var(--card-alt); border-bottom:1px solid var(--border-dim); font-size:11px; color:var(--text-faint); }
.tbl-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; font-size:12px; }
thead th { text-align:left; padding:8px 10px; font-size:10px; font-weight:500; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-faint); background:var(--card-alt); border-bottom:1px solid var(--border-dim); white-space:nowrap; }
th.r, td.r { text-align:right; }
tbody tr { border-bottom:1px solid var(--border-dim); }
tbody tr:last-child { border-bottom:none; }
tbody td { padding:10px; vertical-align:middle; }
.data-row { cursor:pointer; transition:background 0.1s; position:relative; }
.data-row:hover { background:var(--row-hover); }
.chev { display:inline-block; font-size:11px; color:var(--text-faint); transition:transform 0.18s; }
.chev.open { transform:rotate(90deg); }
.steps-row { background:var(--row-exp); }
.steps-inner { padding:14px 16px 16px; border-top:1px solid var(--border-dim); }
.steps-label { font-size:11px; font-weight:500; color:var(--text-dim); margin-bottom:10px; }
.steps-inner table th { background:#f5edd8; }
.steps-inner table td { background:transparent; color:var(--text-dim); }
.steps-inner tr.current-step td { color:var(--navy) !important; font-weight:500; }

/* Badges */
.badge { display:inline-flex; align-items:center; font-size:9px; padding:2px 6px; border-radius:3px; font-weight:500; white-space:nowrap; }
.b-active { background:rgba(30,130,80,0.1); color:#1e6a3a; border:1px solid rgba(30,130,80,0.22); }
.b-expiring { background:rgba(200,50,50,0.1); color:#922020; border:1px solid rgba(200,50,50,0.22); }
.b-vacant { background:rgba(122,110,82,0.1); color:#5a4e32; border:1px solid rgba(122,110,82,0.28); }
.b-partial { background:rgba(26,47,72,0.07); color:var(--text-faint); border:1px solid var(--border-dim); }

/* Mkt rent cell */
.mkt-cell { display:inline-flex; align-items:center; gap:3px; white-space:nowrap; }
.mkt-cell-input { width:44px; border:none; background:transparent; font-size:12px; font-family:inherit; color:var(--gold); font-style:italic; outline:none; text-align:right; padding:0; border-bottom:1px dashed rgba(122,110,82,0.4); }
.mkt-cell-delta { font-size:9px; font-weight:500; margin-left:3px; }

/* Notes */
.note-green { margin-top:10px; padding:8px 10px; background:rgba(30,122,74,0.07); border:1px solid rgba(30,122,74,0.18); border-radius:4px; font-size:11px; color:#1a6040; line-height:1.5; }
.note-amber { margin-top:10px; padding:8px 10px; background:rgba(122,110,82,0.08); border:1px solid rgba(122,110,82,0.2); border-radius:4px; font-size:11px; color:#5a4e32; line-height:1.5; }
.note-red { margin-top:10px; padding:8px 10px; background:rgba(180,40,40,0.06); border:1px solid rgba(180,40,40,0.16); border-radius:4px; font-size:11px; color:#8a2828; line-height:1.5; }
.note-gray { margin-top:10px; padding:8px 10px; background:rgba(26,47,72,0.05); border:1px solid var(--border-dim); border-radius:4px; font-size:11px; color:var(--text-faint); line-height:1.5; }

/* Row actions */
.row-actions { display:none; align-items:center; gap:4px; position:absolute; right:8px; top:50%; transform:translateY(-50%); }
.data-row:hover .row-actions { display:flex; }
.row-act-btn { font-size:10px; padding:2px 7px; border-radius:3px; cursor:pointer; border:1px solid var(--border-dim); background:var(--card-bg); font-family:inherit; color:var(--text-faint); white-space:nowrap; transition:all 0.12s; line-height:1.4; }
.row-act-btn:hover { border-color:var(--gold); color:var(--gold); background:var(--gold-glow); }
.row-act-btn.renewal { border-color:rgba(26,72,140,0.3); color:#1a4880; background:rgba(26,72,140,0.05); }
.row-act-btn.renewal:hover { border-color:#1a4880; background:rgba(26,72,140,0.1); }

/* Investment */
.inv-row { display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-dim); font-size:12px; }
.inv-label { color:var(--text-faint); }
.inv-val { font-weight:500; color:var(--text); }
.inv-val.gold { color:var(--gold-light); font-family:'Cormorant Garamond',serif; font-size:15px; }
.inv-divider { height:1px; background:var(--border-dim); margin:6px 0; }
.cap-methodology { font-size:10px; color:var(--text-faint); margin-top:6px; padding:6px 8px; background:rgba(26,47,72,0.04); border-radius:4px; line-height:1.5; }
.cap-methodology a { color:var(--gold); text-decoration:none; }
.cap-mode-btn { font-size:10px; padding:2px 7px; border-radius:3px; cursor:pointer; border:1px solid var(--border-dim); background:none; font-family:inherit; color:var(--text-faint); transition:all 0.12s; }
.cap-mode-btn.active { background:var(--gold-dim); border-color:var(--gold); color:var(--gold); }
.cap-override-row { display:flex; align-items:center; gap:6px; margin-top:6px; font-size:11px; color:var(--text-dim); }
.cap-override-row input { width:60px; padding:3px 6px; border:1px solid var(--border); border-radius:4px; background:var(--card-bg); font-size:12px; font-family:inherit; color:var(--text); outline:none; text-align:right; }
.cap-override-row input:focus { border-color:var(--gold); }
.hold-toggle-group { display:flex; gap:3px; }
.hold-btn { font-size:10px; padding:2px 7px; border-radius:3px; cursor:pointer; border:1px solid var(--border-dim); background:none; font-family:inherit; color:var(--text-faint); transition:all 0.12s; }
.hold-btn.active { background:var(--gold-dim); border-color:var(--gold); color:var(--gold); }
.sc-row { border-bottom:1px solid var(--border-dim); }
.sc-row td { padding:6px 4px; vertical-align:middle; }
.sc-badge { display:inline-block; font-size:9px; padding:1px 6px; border-radius:2px; font-weight:500; text-transform:uppercase; }
.sc-bull { background:rgba(30,122,74,0.1); color:#1e6a3a; }
.sc-base { background:rgba(122,110,82,0.1); color:#5a4e32; }
.sc-bear { background:rgba(180,40,40,0.08); color:#8a2828; }

/* Credit card */
.portfolio-score { text-align:center; padding:12px 14px 8px; }
.portfolio-grade { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:600; color:var(--gold-light); }
.portfolio-label { font-size:10px; color:var(--text-faint); margin-top:2px; }
.score-bar-wrap { height:4px; background:rgba(26,47,72,0.08); border-radius:2px; overflow:hidden; }
.score-bar { height:100%; border-radius:2px; transition:width 0.3s; }
.tenant-score-row { padding:8px 14px; border-bottom:1px solid var(--border-dim); }
.tenant-score-row:last-child { border-bottom:none; }
.ts-hdr { display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:2px 0; }
.ts-hdr:hover .ts-name { color:var(--gold); }
.ts-chev { font-size:10px; color:var(--text-faint); transition:transform 0.18s; flex-shrink:0; }
.ts-chev.open { transform:rotate(90deg); }
.ts-body { overflow:hidden; max-height:300px; opacity:1; transition:max-height 0.22s ease, opacity 0.18s ease; }
.ts-body.collapsed { max-height:0; opacity:0; }
.ts-name { font-size:12px; font-weight:500; color:var(--text); }
.ts-rating { font-size:10px; color:var(--text-faint); margin-top:2px; }
.ts-grade { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; }
.ts-score { font-size:10px; color:var(--text-faint); }
.ts-sources { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.ts-src { font-size:10px; text-decoration:none; opacity:0.8; }

/* CDA */
.cda-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 14px; border-bottom:1px solid var(--border-dim); }
.cda-var-name { font-size:11px; font-weight:500; color:var(--text-dim); margin-bottom:2px; }
.cda-var-val { font-size:11px; color:var(--text-faint); display:flex; align-items:center; gap:4px; }
.cda-score-pill { flex-shrink:0; min-width:32px; text-align:center; font-size:11px; font-weight:500; padding:2px 7px; border-radius:3px; }
.cda-full { background:rgba(30,122,74,0.1); color:#1e6a3a; }
.cda-mid { background:rgba(122,110,82,0.1); color:#5a4e32; }
.cda-low { background:rgba(180,40,40,0.08); color:#8a2828; }
.cda-zero { background:rgba(26,47,72,0.06); color:var(--text-faint); }
.cda-select { font-size:11px; font-family:inherit; color:var(--text); border:1px solid var(--border); border-radius:3px; background:var(--card-bg); padding:1px 4px; outline:none; }
.cda-num-input { width:52px; font-size:11px; font-family:inherit; border:1px solid var(--border); border-radius:3px; background:var(--card-bg); padding:1px 4px; outline:none; color:var(--text); text-align:right; }
.cda-toggle { position:relative; display:inline-block; width:28px; height:15px; }
.cda-toggle input { opacity:0; width:0; height:0; }
.cda-toggle-slider { position:absolute; inset:0; background:rgba(26,47,72,0.15); border-radius:15px; cursor:pointer; transition:background 0.2s; }
.cda-toggle input:checked + .cda-toggle-slider { background:var(--gold); }
.cda-toggle-slider::before { content:''; position:absolute; width:11px; height:11px; left:2px; bottom:2px; background:white; border-radius:50%; transition:transform 0.2s; }
.cda-toggle input:checked + .cda-toggle-slider::before { transform:translateX(13px); }

/* Panel sections */
.panel-section { border-bottom:1px solid var(--border-dim); }
.panel-section:last-child { border-bottom:none; }
.panel-section-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 14px; cursor:pointer; user-select:none; font-size:11px; font-weight:500; color:var(--text-dim); }
.panel-section-hdr:hover { background:var(--row-hover); }
.panel-section-icon { font-size:10px; color:var(--text-faint); transition:transform 0.2s; }
.panel-section-icon.open { transform:rotate(90deg); }
.panel-section-body { overflow:hidden; max-height:400px; opacity:1; transition:max-height 0.22s ease, opacity 0.18s ease; }
.panel-section-body.collapsed { max-height:0; opacity:0; }

/* Source links */
.source-links { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; align-items:center; font-size:10px; }
.src-link { display:inline-flex; align-items:center; gap:3px; color:var(--gold); text-decoration:none; padding:1px 6px; border:1px solid rgba(122,110,82,0.25); border-radius:3px; background:rgba(122,110,82,0.05); }
.src-link:hover { background:rgba(122,110,82,0.1); }
.src-link svg { width:8px; height:8px; }
.credit-inline { display:flex; align-items:center; gap:4px; }
.credit-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.credit-grade { font-size:11px; font-weight:500; }

/* News */
.news-item { padding:8px 0; border-bottom:1px solid var(--border-dim); cursor:pointer; }
.news-item:last-child { border-bottom:none; }
.news-headline { font-size:11px; font-weight:500; color:var(--text); line-height:1.4; margin-bottom:2px; }
.news-meta { font-size:10px; color:var(--text-faint); display:flex; gap:6px; align-items:center; }
.news-tag { font-size:9px; padding:1px 5px; border-radius:2px; background:var(--gold-dim); color:var(--gold); font-weight:500; }

/* Drop zone */
.drop-zone { border:1.5px dashed rgba(122,110,82,0.35); border-radius:6px; padding:12px 14px; margin-top:10px; background:rgba(122,110,82,0.03); cursor:pointer; }
.drop-zone-inner { display:flex; align-items:center; gap:10px; font-size:11px; color:var(--text-faint); }
.drop-icon { width:28px; height:28px; border-radius:5px; background:rgba(122,110,82,0.1); display:flex; align-items:center; justify-content:center; font-size:14px; }

/* Buttons */
.btn-gold { padding:7px 16px; background:var(--gold); color:white; border:none; border-radius:4px; font-size:12px; font-family:inherit; font-weight:500; cursor:pointer; }
.btn-gold:hover { opacity:0.88; }
.btn-ghost { padding:6px 14px; background:none; color:var(--text-dim); border:1px solid var(--border-dim); border-radius:4px; font-size:12px; font-family:inherit; cursor:pointer; }
.btn-ghost:hover { border-color:var(--gold); color:var(--gold); }
.add-btn { padding:4px 10px; background:none; color:var(--gold); border:1px solid rgba(122,110,82,0.4); border-radius:4px; font-size:11px; font-family:inherit; cursor:pointer; }

/* Tabs */
.tabs { display:flex; border-top:1px solid var(--border-dim); margin-top:10px; }
.tab { padding:10px 16px; font-size:12px; color:var(--text-faint); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.12s; background:none; border-left:none; border-right:none; border-top:none; font-family:inherit; white-space:nowrap; }
.tab:hover { color:var(--text-dim); }
.tab.active { color:var(--gold); border-bottom-color:var(--gold); }
.tab-count { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:var(--gold-dim); color:var(--gold); font-size:9px; font-weight:500; margin-left:4px; }

/* Modal */
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(19,36,58,0.55); z-index:1000; align-items:center; justify-content:center; }
.modal-overlay.open { display:flex; }
.modal-box { background:var(--card-bg); border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,0.18); width:540px; max-width:95vw; max-height:90vh; overflow-y:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 14px; border-bottom:1px solid var(--border-dim); position:sticky; top:0; background:var(--card-bg); z-index:1; }
.modal-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:var(--text); }
.modal-close { background:none; border:none; cursor:pointer; font-size:20px; color:var(--text-faint); padding:0; }
.modal-body { padding:16px 20px; }
.modal-section-label { font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-faint); font-weight:500; margin-bottom:8px; margin-top:14px; }
.modal-section-label:first-child { margin-top:0; }
.modal-prefill { background:rgba(26,47,72,0.04); border:1px solid var(--border-dim); border-radius:5px; padding:10px 12px; margin-bottom:4px; font-size:11px; color:var(--text-dim); line-height:1.9; }
.modal-field { margin-bottom:11px; }
.modal-field label { display:block; font-size:11px; color:var(--text-dim); margin-bottom:4px; font-weight:500; }
.modal-field input, .modal-field select { width:100%; padding:7px 10px; border:1px solid var(--border); border-radius:4px; background:var(--card-bg); font-size:12px; font-family:inherit; color:var(--text); outline:none; }
.modal-field input:focus, .modal-field select:focus { border-color:var(--gold); }
.modal-field-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.modal-footer { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1px solid var(--border-dim); position:sticky; bottom:0; background:var(--card-bg); }
.modal-note { font-size:10px; color:var(--text-faint); margin-right:auto; }

/* Rent growth */
#rg-view { font-size:10px; line-height:1.8; color:var(--text-faint); }
