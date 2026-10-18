import type { DocArticle, DocSection } from "../apps/studio/src/docs-model";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export function renderInternalDocs(articles: DocArticle[]): string {
  const ids = new Set(articles.map((a) => a.id));
  let block = 0;
  const link = (id: string, label: string) =>
    ids.has(id)
      ? `<a href="#${escapeHtml(id)}">${escapeHtml(label)}</a>`
      : `<span class="user-reference">${escapeHtml(label)} <small>(in CodeShip Docs)</small></span>`;
  const section = (
    article: DocArticle,
    s: DocSection,
  ) => `<section id="${article.id}-${s.id}">
    <h3>${escapeHtml(s.title)}</h3>
    ${(s.paragraphs ?? []).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    ${s.steps?.length ? `<ol>${s.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : ""}
    ${s.callout ? `<aside class="callout"><strong>${escapeHtml(s.callout.title)}</strong><p>${escapeHtml(s.callout.text)}</p></aside>` : ""}
    ${s.code ? `<div class="code-block"><div class="code-toolbar"><span>${escapeHtml(s.code.language)}</span><button type="button" data-copy="code-${++block}">Copy code</button></div><pre><code id="code-${block}">${escapeHtml(s.code.text)}</code></pre></div><p class="caption">${escapeHtml(s.code.caption)}</p>` : ""}
    ${s.links?.length ? `<div class="related">${s.links.map((l) => link(l.id, l.label)).join("")}</div>` : ""}
  </section>`;
  return `<!doctype html>
<html lang="en" data-theme="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CodeShip internal developer reference</title>
<style>
:root{color-scheme:light;--bg:#f5f7f3;--panel:#fff;--ink:#213129;--muted:#526456;--line:#d8e0d5;--accent:#2c6339;--code:#17261e;--code-ink:#edf6e9}
:root[data-theme=dark]{color-scheme:dark;--bg:#17201c;--panel:#202c25;--ink:#edf4e9;--muted:#bac9b8;--line:#425446;--accent:#b8e99c;--code:#101913;--code-ink:#edf6e9}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,sans-serif}a{color:var(--accent);text-underline-offset:4px}button,input{font:inherit}button{cursor:pointer;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);padding:8px 13px}button:hover{border-color:var(--accent)}:focus-visible{outline:3px solid var(--accent);outline-offset:3px}header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 32px;border-bottom:1px solid var(--line);background:var(--panel)}header strong{font-size:20px}header p{margin:2px 0 0;color:var(--muted);font-size:14px}.header-actions{display:flex;gap:8px;flex-wrap:wrap}.layout{display:grid;grid-template-columns:280px minmax(0,1fr);max-width:1440px;margin:auto}.sidebar{position:sticky;top:0;align-self:start;max-height:100vh;overflow:auto;padding:28px 24px}label{display:block;font-size:13px;font-weight:600}input{width:100%;padding:10px 12px;margin:8px 0 12px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)}nav{display:grid;gap:7px}nav a{padding:10px 12px;border:1px solid transparent;border-radius:8px;text-decoration:none;font-size:14px}nav a:hover,nav a[aria-current=true]{border-color:var(--line);background:var(--panel)}.scope{font-size:13px;color:var(--muted);margin-top:24px}.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--accent)}main{padding:36px 40px 80px;min-width:0}.intro,article{max-width:860px;margin:0 auto 32px}.intro h1{font-size:clamp(30px,4vw,42px);line-height:1.15;margin:12px 0 20px;letter-spacing:-.035em}.intro p{color:var(--muted)}article{padding:32px;background:var(--panel);border:1px solid var(--line);border-radius:16px;scroll-margin-top:24px}h2{font-size:28px;line-height:1.25;letter-spacing:-.025em;margin:8px 0 18px}h3{font-size:20px;line-height:1.35;margin:32px 0 12px}p{margin:12px 0 18px}li{padding-left:6px;margin:12px 0}li::marker{color:var(--accent);font-weight:700}.article-intro{font-size:18px;color:var(--muted)}.code-block{border-radius:10px;overflow:hidden;background:var(--code);color:var(--code-ink);margin-top:18px}.code-toolbar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #ffffff30;font-size:12px}.code-toolbar button{padding:5px 10px;background:transparent;color:var(--code-ink);border-color:#ffffff50;font-size:12px}pre{padding:18px;margin:0;overflow:auto;line-height:1.65;font-size:13px}code{font-family:Consolas,monospace}.caption{font-size:13px;color:var(--muted)}.callout{border-left:3px solid var(--accent);padding:16px 20px;margin:20px 0;background:var(--bg)}.callout p{margin:8px 0 0}.related{display:flex;gap:10px 18px;flex-wrap:wrap;margin-top:20px;font-size:14px}.user-reference{color:var(--muted)}.user-reference small{font-size:11px}#status{min-height:24px;color:var(--muted);font-size:13px}[hidden]{display:none!important}.empty{padding:24px;border:1px solid var(--line);border-radius:12px}
@media(max-width:850px){header{align-items:flex-start;padding:20px;flex-wrap:wrap}.layout{grid-template-columns:1fr}.sidebar{position:static;max-height:none;padding:20px}nav{grid-template-columns:repeat(2,minmax(0,1fr))}.scope{margin-top:12px}main{padding:12px 20px 50px}article{padding:24px}}
@media(max-width:480px){nav{grid-template-columns:1fr}article{padding:20px}.header-actions{width:100%}pre{font-size:12px}}
@media print{header,.sidebar,.header-actions,.code-toolbar button,#status{display:none}.layout{display:block}main{padding:0}.intro,article{max-width:none}article,article[hidden]{display:block!important;border:0;break-before:page;padding:0;background:white;color:#111}h2,h3{break-after:avoid}pre{white-space:pre-wrap;background:#f4f4f4;color:#111}.caption,.article-intro{color:#333}}
</style></head>
<body><header><div><strong>CodeShip / Developer reference</strong><p>Internal engineering handbook. Separate from the customer application.</p></div><div class="header-actions"><button id="theme" type="button">Toggle theme</button><button id="print" type="button">Print reference</button></div></header>
<div class="layout"><aside class="sidebar"><label for="search">Find an internal guide</label><input id="search" type="search" placeholder="Search architecture, commands, Windows..." autocomplete="off"><p id="status" role="status">${articles.length} internal guides</p><nav aria-label="Internal guide chapters">${articles.map((a) => `<a href="#${a.id}" data-guide="${a.id}">${escapeHtml(a.title)}</a>`).join("")}</nav><p class="scope">For maintaining and releasing CodeShip. Customer tutorials and framework integration remain in the app's Documentation Center.</p></aside>
<main><div class="intro"><span class="eyebrow">Engineering / local reference</span><h1>Build, maintain and release CodeShip.</h1><p>This self-contained HTML file keeps architecture, setup, extension, testing and Windows release instructions available offline. It is not shipped in the production app. Run commands from the source repository root unless a chapter states otherwise.</p></div>
<p id="empty" class="empty" hidden>No guides match. Try a command, filename or feature name.</p>
${articles.map((a) => `<article id="${a.id}" data-article><span class="eyebrow">${escapeHtml(a.group ?? "Internal engineering")}</span><h2>${escapeHtml(a.title)}</h2><p class="article-intro">${escapeHtml(a.intro)}</p>${a.sections.map((s) => section(a, s)).join("")}<div class="related">${(a.related ?? []).map((id) => link(id, articles.find((x) => x.id === id)?.title ?? id.replaceAll("-", " "))).join("")}</div></article>`).join("")}
</main></div>
<script>
const search=document.getElementById('search'), chapters=[...document.querySelectorAll('[data-article]')], links=[...document.querySelectorAll('[data-guide]')], status=document.getElementById('status');
function filter(){const terms=search.value.toLowerCase().trim().split(/\\s+/).filter(Boolean);let count=0;chapters.forEach((chapter)=>{const match=terms.every((term)=>(chapter.id+' '+chapter.textContent).toLowerCase().includes(term));chapter.hidden=!match;links.find((link)=>link.dataset.guide===chapter.id).hidden=!match;if(match)count++;});document.getElementById('empty').hidden=count>0;status.textContent=count+' of '+chapters.length+' guides';}
search.addEventListener('input',filter);
document.addEventListener('click',async(event)=>{const copy=event.target.closest('button[data-copy]');if(copy){const text=document.getElementById(copy.dataset.copy).textContent;try{if(navigator.clipboard)await navigator.clipboard.writeText(text);else throw new Error('Clipboard unavailable');}catch{const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied){status.textContent='Select the code and copy it with your keyboard.';return;}}copy.textContent='Copied';status.textContent='Code copied.';return;}const anchor=event.target.closest('a[href^="#"]');if(anchor){const chapter=document.getElementById(anchor.hash.slice(1));if(chapter?.hidden){search.value='';filter();}links.forEach((link)=>link.setAttribute('aria-current',String(link.hash===anchor.hash)));}});
document.getElementById('print').addEventListener('click',()=>window.print());
try{document.documentElement.dataset.theme=localStorage.getItem('codeship-internal-docs-theme')||'light';}catch{}
document.getElementById('theme').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('codeship-internal-docs-theme',next);}catch{}});
</script></body></html>`;
}
