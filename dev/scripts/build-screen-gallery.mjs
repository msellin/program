#!/usr/bin/env node
// Builds one browsable page of every screenshot the persona harness and the
// launch-gaps spec captured: next-app/tests/e2e/artifacts/personas/index.html.
// Two views: by persona (each test user's whole app) and by screen (one screen
// across every persona, to spot the state that breaks it). Page errors from
// each persona's console.log are listed beside its screens.
//
// Run after `npm run e2e:personas` and/or launch-gaps.spec.ts:
//   node dev/scripts/build-screen-gallery.mjs && open next-app/tests/e2e/artifacts/personas/index.html
// The output sits in the gitignored artifacts folder; screenshots are of e2e test users only.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const PERSONAS = path.join(ROOT, "next-app/tests/e2e/artifacts/personas");
const GAPS = path.join(ROOT, "dev/active/launch-readiness/screens/gaps");
const OUT = path.join(PERSONAS, "index.html");

const pngs = (dir) =>
  fs.existsSync(dir) && fs.statSync(dir).isDirectory() ? fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort() : [];
const rel = (p) => path.relative(PERSONAS, p).split(path.sep).join("/");
const screenKey = (file) => file.replace(/\.png$/, "").replace(/^\d+[a-z]?-/, "");

const groups = [];

for (const id of fs.readdirSync(PERSONAS).sort()) {
  const dir = path.join(PERSONAS, id);
  const metaPath = path.join(dir, "persona.json");
  if (!fs.existsSync(metaPath)) continue;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const shots = [];
  for (const vp of ["mobile", "desktop"]) {
    for (const f of pngs(path.join(dir, vp))) {
      shots.push({ src: rel(path.join(dir, vp, f)), label: f.replace(/\.png$/, ""), screen: screenKey(f), view: vp });
    }
  }
  const flowsDir = path.join(dir, "flows");
  if (fs.existsSync(flowsDir)) {
    for (const flow of fs.readdirSync(flowsDir).sort()) {
      for (const f of pngs(path.join(flowsDir, flow))) {
        shots.push({ src: rel(path.join(flowsDir, flow, f)), label: `${flow} / ${f.replace(/\.png$/, "")}`, screen: `flow:${flow}`, view: "flow" });
      }
    }
  }
  const logPath = path.join(dir, "console.log");
  const errors = fs.existsSync(logPath)
    ? [...new Set(fs.readFileSync(logPath, "utf8").split("\n").filter((l) => l.startsWith("[pageerror]") || l.startsWith("[error]")).map((l) => l.slice(0, 200)))]
    : [];
  groups.push({
    id,
    title: meta.displayName ?? id,
    program: meta.programSlug ?? "none",
    days: meta.days ?? null,
    focus: meta.focus ?? "",
    errors,
    shots,
  });
}

if (fs.existsSync(GAPS)) {
  for (const sub of fs.readdirSync(GAPS).sort()) {
    const shots = pngs(path.join(GAPS, sub)).map((f) => ({
      src: rel(path.join(GAPS, sub, f)),
      label: f.replace(/\.png$/, ""),
      screen: screenKey(f),
      view: sub.includes("393") ? "393" : "375",
    }));
    if (shots.length) groups.push({ id: `gaps-${sub}`, title: `Launch gaps: ${sub}`, program: "launch-gaps", days: null, focus: "launch-gaps.spec.ts capture (live site)", errors: [], shots });
  }
}

const data = JSON.stringify(groups).replace(/</g, "\\u003c");
const total = groups.reduce((n, g) => n + g.shots.length, 0);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Terav screen gallery</title>
<style>
:root{--bg:#1a1613;--surface:#241f1b;--line:#3a332d;--ink:#efe6dc;--muted:#a89a8c;--accent:#c9a27a;--err:#e07a5f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
h1{font-size:16px;margin:0 12px 0 0}select,input,button{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:6px 8px;font:inherit}
button.on{border-color:var(--accent);color:var(--accent)}main{padding:16px}
section{margin:0 0 28px}section h2{font-size:15px;margin:0 0 2px}.meta{color:var(--muted);font-size:12px;margin:0 0 8px;max-width:900px}
.errs{color:var(--err);font-size:12px;margin:0 0 8px}.errs summary{cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:zoom-in}
figure img{width:100%;height:260px;object-fit:cover;object-position:top;display:block;background:#000}
figcaption{padding:4px 6px;font-size:11px;color:var(--muted);word-break:break-word}
#lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:none;z-index:10;align-items:flex-start;justify-content:center;overflow:auto;padding:24px}
#lb.open{display:flex}#lb img{max-width:min(100%,900px);height:auto}#lb p{position:fixed;top:8px;left:16px;margin:0;color:var(--muted)}
</style></head><body>
<header><h1>Terav screen gallery</h1>
<button id="byPersona" class="on">By persona</button><button id="byScreen">By screen</button>
<select id="program"><option value="">All programs</option></select>
<select id="view"><option value="">All views</option><option>mobile</option><option>desktop</option><option>flow</option><option>375</option><option>393</option></select>
<input id="q" placeholder="Filter screens (e.g. session, today)" size="28">
<span class="meta" id="count"></span></header>
<main id="main"></main>
<div id="lb"><p id="lbcap"></p><img id="lbimg" alt=""></div>
<script>
const G=${data};
const $=s=>document.querySelector(s);let mode="persona";
[...new Set(G.map(g=>g.program))].sort().forEach(p=>$("#program").append(new Option(p,p)));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fig=(s,cap)=>'<figure data-src="'+esc(s.src)+'" data-cap="'+esc(cap)+'"><img loading="lazy" src="'+esc(s.src)+'" alt="'+esc(cap)+'"><figcaption>'+esc(cap)+'</figcaption></figure>';
function render(){
  const prog=$("#program").value,view=$("#view").value,q=$("#q").value.toLowerCase();
  const ok=s=>(!view||s.view===view)&&(!q||s.label.toLowerCase().includes(q));
  const gs=G.filter(g=>!prog||g.program===prog);let n=0,out="";
  if(mode==="persona"){
    for(const g of gs){const sh=g.shots.filter(ok);if(!sh.length)continue;n+=sh.length;
      out+='<section><h2>'+esc(g.title)+'</h2><p class="meta">'+esc(g.id)+' · '+esc(g.program)+(g.days?' · day '+g.days:'')+' · '+sh.length+' shots<br>'+esc(g.focus)+'</p>'
        +(g.errors.length?'<details class="errs"><summary>'+g.errors.length+' distinct page errors</summary><pre>'+esc(g.errors.join("\\n"))+'</pre></details>':'')
        +'<div class="grid">'+sh.map(s=>fig(s,s.view+' · '+s.label)).join("")+'</div></section>';}
  }else{
    const by={};for(const g of gs)for(const s of g.shots)if(ok(s))(by[s.view+' · '+s.screen]??=[]).push([g,s]);
    for(const k of Object.keys(by).sort()){n+=by[k].length;
      out+='<section><h2>'+esc(k)+'</h2><p class="meta">'+by[k].length+' personas</p><div class="grid">'+by[k].map(([g,s])=>fig(s,g.id+' · '+s.label)).join("")+'</div></section>';}
  }
  $("#main").innerHTML=out||'<p class="meta">No screens match.</p>';$("#count").textContent=n+' of ${total} screenshots';
}
$("#byPersona").onclick=()=>{mode="persona";$("#byPersona").classList.add("on");$("#byScreen").classList.remove("on");render()};
$("#byScreen").onclick=()=>{mode="screen";$("#byScreen").classList.add("on");$("#byPersona").classList.remove("on");render()};
["#program","#view"].forEach(s=>$(s).onchange=render);$("#q").oninput=render;
$("#main").onclick=e=>{const f=e.target.closest("figure");if(!f)return;$("#lbimg").src=f.dataset.src;$("#lbcap").textContent=f.dataset.cap;$("#lb").classList.add("open")};
$("#lb").onclick=()=>$("#lb").classList.remove("open");document.onkeydown=e=>{if(e.key==="Escape")$("#lb").classList.remove("open")};
render();
</script></body></html>`;

fs.writeFileSync(OUT, html);
console.log(`Wrote ${rel(OUT)}: ${groups.length} groups, ${total} screenshots → ${OUT}`);
