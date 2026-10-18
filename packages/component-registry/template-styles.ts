import { clone, type Project } from "../document-model";
import { legacyBaseCss, legacyLibraryCss } from "./legacy-template-styles";

export const baseCss = `/* CodeShip baseline v2: editable and portable */
:root { --form-gap:8px; --form-row-gap:22px; --control-height:46px; --control-radius:10px; --form-border:#dbe1da; --form-ink:#26382c; --form-muted:#6e7d72; --form-focus:#587c46; --form-error:#b63d40; }
* { box-sizing:border-box; }
body { margin:0; color:#26332a; background:#f9faf7; font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; line-height:1.6; overflow-wrap:break-word; }
button,input,textarea,select { font:inherit; }
button,a { -webkit-tap-highlight-color:transparent; }
button { cursor:pointer; min-height:var(--control-height); border:1px solid #cfd8ca; padding:11px 18px; border-radius:var(--control-radius); background:#f2f5ef; color:#26382c; }
img,video { max-width:100%; height:auto; } svg { flex-shrink:0; max-width:100%; } a { color:inherit; }
form { display:grid; gap:var(--form-row-gap); min-width:0; }
label:has(> input:not([type=checkbox]):not([type=radio])),label:has(> textarea),label:has(> select),.cs-field { display:grid; gap:var(--form-gap); font-size:14px; font-weight:600; color:var(--form-ink); min-width:0; }
input:not([type=checkbox]):not([type=radio]),textarea,select { width:100%; min-width:0; min-height:var(--control-height); padding:11px 14px; border:1px solid var(--form-border); border-radius:var(--control-radius); background:#fff; color:var(--form-ink); font-size:14px; line-height:1.5; font-weight:400; box-shadow:0 1px 2px #1c332505; }
textarea { min-height:120px; resize:vertical; } input::placeholder,textarea::placeholder { color:#94a096; opacity:1; }
input:focus,textarea:focus,select:focus { border-color:var(--form-focus); outline:3px solid #7fa96822; outline-offset:1px; }
input:disabled,textarea:disabled,select:disabled,button:disabled { opacity:.55; cursor:not-allowed; background:#f1f3ef; }
input[aria-invalid=true],textarea[aria-invalid=true],select[aria-invalid=true],input:user-invalid { border-color:var(--form-error); }
.cs-helper { color:var(--form-muted); font-size:12px; line-height:1.6; font-weight:400; margin:0; } .cs-error { color:var(--form-error); }
.cs-required { color:var(--form-error); } .cs-check { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--form-muted); } .cs-check input { width:17px; height:17px; accent-color:var(--form-focus); }
table { border-collapse:collapse; width:100%; } th,td { text-align:left; padding:15px 18px; border-bottom:1px solid #e8ece5; }
.cs-flex { display:flex; flex-wrap:wrap; gap:16px; padding:24px; min-height:80px; } .cs-flex > * { min-width:0; }
.cs-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); gap:16px; padding:24px; min-height:100px; }
.cs-template-icon { width:20px; height:20px; vertical-align:middle; display:inline-block; color:inherit; }
:focus-visible { outline:3px solid #5b9b3c; outline-offset:3px; }
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:.01ms !important; transition-duration:.01ms !important; animation-iteration-count:1 !important; } }`;

export const libraryCss = `/* CodeShip screen system v2 */
.f-nav { display:flex; align-items:center; justify-content:space-between; padding:22px 6%; border-bottom:1px solid #e5e8e0; gap:24px; flex-wrap:wrap; }
.f-brand { font-size:25px; letter-spacing:-1px; font-weight:750; text-decoration:none; }
.f-links { display:flex; align-items:center; gap:28px; font-size:14px; flex-wrap:wrap; } .f-links a { text-decoration:none; color:#697663; }
.f-button { display:inline-flex; justify-content:center; align-items:center; gap:10px; background:#283a2c; border:1px solid #283a2c; color:#fff; padding:12px 22px; border-radius:10px; font-weight:600; font-size:14px; text-decoration:none; }
.f-button:hover { background:#415b37; } .f-secondary { background:transparent; color:#344b32; border:1px solid #d3ddce; }
.f-hero { padding:65px 6% 30px; text-align:center; }
.f-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid #d7e2c8; border-radius:30px; color:#526545; background:#eef4e7; font-size:12px; font-weight:600; }
.f-heading { font-size:clamp(36px,5.2vw,66px); font-weight:600; line-height:1.1; letter-spacing:-.045em; max-width:730px; margin:24px auto 20px; text-wrap:balance; }
.f-description { font-size:16px; color:#6f7d68; max-width:480px; margin:0 auto; line-height:1.8; }
.f-actions { display:flex; justify-content:center; flex-wrap:wrap; gap:12px; margin:28px 0 18px; }
.f-note { color:#7a8771; font-size:12px; }
.f-preview { margin:40px auto 0; padding:9px; border:1px solid #dce2d4; border-radius:16px; max-width:960px; background:#edf1e6; text-align:left; box-shadow:0 16px 50px #3a43230b; }
.f-workspace { display:grid; grid-template-columns:160px minmax(0,1fr); min-height:360px; border-radius:10px; background:#fff; border:1px solid #e1e6d9; }
.f-side { background:#f4f6ef; padding:22px 12px; border-right:1px solid #e5e9df; border-radius:10px 0 0 10px; font-size:12px; }
.f-side-title { font-size:16px; font-weight:750; margin:0 10px 25px; }
.f-side-item { display:flex; align-items:center; gap:8px; padding:9px; margin:4px 0; color:#718164; border-radius:7px; } .f-side-active { background:#e4ecd9; color:#3d5831; }
.f-side-item svg { width:16px; height:16px; } .f-board { padding:24px; min-width:0; } .f-board-top { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
.f-board-title { font-size:20px; margin:0; font-weight:650; letter-spacing:-.6px; }
.f-board-caption { font-size:12px; color:#849078; margin:6px 0 22px; }
.f-board-label { display:inline-flex; align-items:center; gap:6px; font-size:11px; border:1px solid #e1e8d9; border-radius:7px; padding:5px 9px; }
.f-board-label svg { width:14px; height:14px; }
.f-board-columns { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.f-column-title { font-size:10px; color:#6e7e60; margin:0 0 12px; font-weight:650; letter-spacing:.06em; }
.f-card { border:1px solid #e3e9dc; padding:16px 12px; border-radius:10px; background:#fff; margin-bottom:12px; box-shadow:0 2px 4px #233a2203; }
.f-card-tag { font-size:10px; color:#647d48; background:#f0f5e8; padding:3px 7px; border-radius:5px; }
.f-card h4 { font-size:13px; margin:12px 0 7px; font-weight:650; } .f-card p { font-size:11px; color:#7e8b73; margin:0 0 16px; }
.f-card-footer { border-top:1px solid #f0f2eb; padding-top:10px; font-size:10px; color:#829173; display:flex; align-items:center; justify-content:space-between; }
.f-card-footer svg { width:14px; height:14px; }
.f-logos { text-align:center; padding:32px 6% 40px; color:#7f8e72; } .f-logos p { font-size:12px; margin:0 0 22px; } .f-logo-row { display:flex; flex-wrap:wrap; justify-content:space-around; gap:20px 30px; font-size:21px; font-weight:650; letter-spacing:-.8px; }
.f-features { padding:60px 6%; background:#f0f3eb; } .f-features h2 { text-align:center; font-size:clamp(26px,3vw,36px); letter-spacing:-1px; margin:0 0 35px; text-wrap:balance; }
.f-feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); gap:20px; } .f-feature { padding:28px; background:#fafbf7; border:1px solid #e0e5d7; border-radius:14px; } .f-feature > svg { width:32px; height:32px; color:#5c7949; } .f-feature h3 { font-size:18px; } .f-feature p { font-size:14px; color:#718263; }
.f-footer { padding:26px 6%; display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px; font-size:12px; color:#718263; border-top:1px solid #e2e7d9; }
.s-screen { min-height:100vh; display:grid; grid-template-columns:208px minmax(0,1fr); background:#f7f9f6; color:#26382c; }
.s-sidebar { background:#fff; border-right:1px solid #e3e9e0; padding:30px 18px; min-width:0; } .s-sidebar h2 { display:flex; align-items:center; gap:10px; font-size:21px; letter-spacing:-.8px; margin:0 0 32px; } .s-sidebar h2 svg { color:#6b8f50; width:28px; height:28px; }
.s-sidebar p { display:flex; align-items:center; gap:12px; padding:11px 13px; margin:6px 0; font-size:13px; color:#72816b; border-radius:9px; } .s-sidebar p:first-of-type { color:#38562e; background:#edf4e7; font-weight:600; }
.s-main { padding:clamp(20px,3.5vw,48px); min-width:0; max-width:1400px; width:100%; } .s-main h1 { font-size:clamp(28px,3vw,36px); letter-spacing:-1.2px; line-height:1.2; margin:0; }
.s-sub { color:#7b8973; font-size:14px; margin:10px 0 30px; } .s-kicker { font-size:11px; letter-spacing:.12em; color:#7d906e; font-weight:650; margin:0 0 12px; }
.s-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr)); gap:18px; margin:28px 0; }
.s-card { background:#fff; border:1px solid #e3e9df; border-radius:14px; padding:24px; } .s-card > svg { color:#729057; margin-bottom:16px; } .s-card p { color:#7b8973; font-size:13px; margin:0; } .s-card h2 { margin:8px 0; font-size:32px; letter-spacing:-1px; } .s-card small { color:#517d43; }
.s-panel { background:#fff; border:1px solid #e2e8df; border-radius:16px; padding:clamp(20px,3vw,32px); margin:24px 0; box-shadow:0 3px 12px #243b1d03; min-width:0; }
.s-panel h2 { display:flex; gap:10px; align-items:center; font-size:18px; letter-spacing:-.4px; margin:0 0 6px; } .s-panel h2 svg { color:#6a8c52; }
.s-panel-description { font-size:13px; color:#829078; margin:0 0 28px; } .s-panel form { max-width:620px; } .s-panel form button { justify-self:start; }
.s-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr)); gap:22px; }
.s-form-divider { border:0; border-top:1px solid #edf0e9; margin:4px 0; } .s-form-footer { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.s-preferences { display:flex; align-items:center; gap:14px; padding:18px; background:#f7faf4; border:1px solid #e4ebdc; border-radius:12px; } .s-preferences svg { color:#729454; } .s-preferences p { margin:0; font-size:13px; font-weight:600; } .s-preferences small { font-size:12px; color:#829276; }
.s-table-scroll { max-width:100%; overflow-x:auto; } .s-table-scroll table { min-width:560px; font-size:13px; } .s-table-scroll th { color:#7f8e75; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; background:#f7faf4; } .s-table-scroll td:nth-child(3) { color:#517e41; }
.s-auth { min-height:100vh; display:grid; place-items:center; background:radial-gradient(at 10% 0%,#e1edcf,transparent 50%),#f3f6ef; padding:30px 18px; }
.s-auth-card { width:min(100%,460px); background:#fff; border:1px solid #dce6d4; border-radius:22px; padding:clamp(24px,5vw,44px); box-shadow:0 20px 70px #30432208; } .s-auth-card h1 { letter-spacing:-1.3px; line-height:1.2; font-size:32px; margin:30px 0 12px; } .s-auth-card > p { color:#7b8a70; font-size:14px; margin:0 0 28px; }
/* 740px is the workspace's sidebar + three usable card columns + gutters. */
@media (max-width:740px) {
 .f-workspace { grid-template-columns:minmax(0,1fr); } .f-side { border-right:0; border-bottom:1px solid #e5e9df; border-radius:10px 10px 0 0; display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:14px; } .f-side-title { width:100%; margin:0 8px 6px; } .f-side-item { margin:0; font-size:11px; padding:8px; } .f-board { padding:18px; } .f-board-columns { grid-template-columns:minmax(0,1fr); } .f-card { padding:16px; } .f-card h4 { font-size:15px; } .f-card p { font-size:13px; } .f-column-title { margin-top:12px; } .f-hero { padding-top:40px; } .f-nav { gap:16px; } .f-links { order:3; width:100%; justify-content:center; gap:24px; } .f-preview { margin-top:30px; } .f-logo-row { font-size:19px; }
}
/* 800px reserves 208px navigation, 2 usable fields and screen gutters. */
@media (max-width:800px) {
 .s-screen { grid-template-columns:minmax(0,1fr); } .s-sidebar { padding:18px 20px; border-right:0; border-bottom:1px solid #e3e9e0; display:flex; align-items:center; flex-wrap:wrap; gap:5px; } .s-sidebar h2 { width:100%; margin:0 0 10px; } .s-sidebar p { margin:0; padding:8px 10px; font-size:12px; gap:6px; } .s-sidebar p svg { width:16px; height:16px; }
}
@media (max-width:390px) { .f-actions > * { width:100%; } .f-eyebrow { font-size:10px; } .f-nav { padding-inline:20px; } .s-sidebar p { font-size:11px; padding:7px; } .s-sidebar p svg { display:none; } }
`;

/** Replace only byte-for-byte legacy defaults; retain every user override and node ID. */
export function upgradeTemplateStyles(project: Project): Project {
  const next = clone(project);
  for (const page of next.pages) {
    page.css = page.css
      .replace(legacyBaseCss, baseCss)
      .replace(legacyLibraryCss, libraryCss);
  }
  return next;
}
