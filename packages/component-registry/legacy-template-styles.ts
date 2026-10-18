export const legacyBaseCss = `/* CodeShip baseline: editable, exportable, framework independent */
* { box-sizing: border-box; }
body { margin: 0; color: #252924; background: #f9faf7; font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; }
button, input, textarea, select { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
img, video { max-width: 100%; height: auto; }
a { color: inherit; }
input, textarea, select { padding: 10px 14px; border: 1px solid #d9dfd3; border-radius: 8px; background: white; }
button { border: 1px solid #cfd5c9; padding: 10px 18px; border-radius: 8px; background: #f2f4ef; color: #252924; }
table { border-collapse: collapse; width: 100%; } th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #e5e8e0; }
.cs-flex { display: flex; gap: 16px; padding: 24px; min-height: 80px; }
.cs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; min-height: 100px; }
:focus-visible { outline: 3px solid #5b9b3c; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }`;
export const legacyLibraryCss = `
.f-nav { display:flex; align-items:center; justify-content:space-between; padding:25px 6%; border-bottom:1px solid #e5e8e0; gap:24px; }
.f-brand { font-size:25px; letter-spacing:-1px; font-weight:750; text-decoration:none; }
.f-links { display:flex; align-items:center; gap:30px; font-size:13px; } .f-links a { text-decoration:none; color:#73786e; }
.f-button { background:#252f25; border:1px solid #252f25; color:#fff; padding:12px 23px; border-radius:7px; font-weight:550; font-size:13px; }
.f-button:hover { background:#42523b; } .f-secondary { background:transparent; color:#34412e; border:1px solid #d3d9cc; }
.f-hero { padding:65px 6% 30px; text-align:center; }
.f-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:5px 12px; border:1px solid #d7e2c8; border-radius:30px; color:#566448; background:#eef4e7; font-size:10px; font-weight:600; letter-spacing:.3px; }
.f-heading { font-size:clamp(34px, 5.2vw, 66px); font-weight:550; line-height:1.08; letter-spacing:-3px; max-width:730px; margin:23px auto 20px; }
.f-description { font-size:14px; color:#7c8275; max-width:440px; margin:0 auto; line-height:1.85; }
.f-actions { display:flex; justify-content:center; gap:10px; margin:25px 0 18px; }
.f-note { color:#93988b; font-size:10px; }
.f-preview { margin:35px auto 0; padding:8px; border:1px solid #dce2d4; border-radius:13px 13px 0 0; max-width:900px; background:#edf1e6; text-align:left; box-shadow:0 12px 45px #3a43230b; }
.f-workspace { display:grid; grid-template-columns:160px 1fr; min-height:325px; border-radius:7px 7px 0 0; background:#fff; overflow:hidden; border:1px solid #e1e6d9; }
.f-side { background:#f4f6ef; padding:21px 14px; border-right:1px solid #e5e9df; font-size:10px; }
.f-side-title { font-size:13px; font-weight:700; margin:0 0 25px; }
.f-side-item { padding:7px 10px; margin:4px 0; color:#808775; border-radius:5px; } .f-side-active { background:#e4ecd9; color:#46573b; }
.f-board { padding:23px; } .f-board-top { display:flex; justify-content:space-between; align-items:center; }
.f-board-title { font-size:19px; margin:0; font-weight:600; letter-spacing:-.5px; }
.f-board-caption { font-size:9px; color:#9a9e93; margin:3px 0 20px; }
.f-board-label { font-size:9px; border:1px solid #e4e9db; border-radius:5px; padding:5px 9px; }
.f-board-columns { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.f-column-title { font-size:9px; color:#777e6c; margin:0 0 10px; }
.f-card { border:1px solid #e7eadf; padding:13px 11px; border-radius:7px; background:#fff; margin-bottom:10px; }
.f-card-tag { font-size:7px; color:#7b865e; background:#f0f3e8; padding:3px 6px; border-radius:3px; }
.f-card h4 { font-size:10px; margin:10px 0 6px; font-weight:550; } .f-card p { font-size:8px; color:#93988c; margin:0 0 12px; }
.f-card-footer { border-top:1px solid #f0f2eb; padding-top:8px; font-size:8px; color:#929889; display:flex; justify-content:space-between; }
.f-logos { text-align:center; padding:27px 6% 35px; color:#a2a89a; } .f-logos p { font-size:10px; margin:0 0 20px; } .f-logo-row { display:flex; justify-content:space-around; gap:20px; font-size:19px; font-weight:650; letter-spacing:-.8px; }
.f-features { padding:60px 6%; background:#f0f3eb; } .f-features h2 { text-align:center; font-size:36px; letter-spacing:-1px; margin:0 0 35px; }
.f-feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; } .f-feature { padding:28px; background:#fafbf7; border:1px solid #e0e5d7; border-radius:12px; } .f-feature h3 { font-size:17px; } .f-feature p { font-size:13px; color:#818875; }
.f-footer { padding:25px 6%; display:flex; justify-content:space-between; font-size:11px; color:#8b9380; border-top:1px solid #e2e7d9; }
.s-screen { min-height:800px; display:grid; grid-template-columns:200px 1fr; background:#f7f8fa; color:#2c3545; }
.s-sidebar { background:white; border-right:1px solid #e5e8ef; padding:30px 20px; } .s-sidebar h2 { font-size:22px; margin:0 0 40px; } .s-sidebar p { padding:10px; font-size:12px; color:#7a8598; } .s-sidebar p:first-of-type { color:#334577; background:#edf0f8; border-radius:7px; }
.s-main { padding:40px; } .s-main h1 { font-size:30px; letter-spacing:-1px; margin:0; } .s-sub { color:#8b93a2; font-size:13px; margin:5px 0 30px; }
.s-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:18px; margin:25px 0; }
.s-card { background:white; border:1px solid #e5e8ef; border-radius:12px; padding:24px; } .s-card p { color:#8b93a2; font-size:12px; margin:0; } .s-card h2 { margin:8px 0; font-size:30px; } .s-card small { color:#56805f; }
.s-panel { background:white; border:1px solid #e5e8ef; border-radius:12px; padding:24px; margin:20px 0; } .s-panel h2 { font-size:17px; margin-top:0; } .s-panel form { display:grid; gap:15px; max-width:440px; }
.s-auth { min-height:800px; display:grid; place-items:center; background:#edf2e8; } .s-auth-card { width:min(90%,420px); background:white; border:1px solid #dce4d4; border-radius:16px; padding:40px; } .s-auth-card h1 { letter-spacing:-1px; } .s-auth-card p { color:#8a9380; font-size:13px; } .s-auth-card form { display:grid; gap:16px; }`;
