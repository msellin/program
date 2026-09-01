const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const VIDEOS = '/Users/margussellin/Downloads';
const MIME = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((req,res)=>{
  const u = new URL(req.url,'http://x');
  if(req.method==='POST' && u.pathname==='/save'){
    const name = path.basename(u.searchParams.get('name')||'out.bin');
    const chunks=[]; req.on('data',c=>chunks.push(c));
    req.on('end',()=>{ let b=Buffer.concat(chunks);
      if(name.endsWith('.png')||name.endsWith('.jpg')){ const s=b.toString(); const i=s.indexOf(','); b=Buffer.from(s.slice(i+1),'base64'); }
      fs.writeFileSync(path.join(ROOT,'out',name),b); res.writeHead(200).end('ok'); });
    return;
  }
  let p = u.pathname==='/'?'/index.html':u.pathname;
  let file = p.startsWith('/vid/') ? path.join(VIDEOS, path.basename(p)) : path.join(ROOT, p);
  if(!fs.existsSync(file)){ res.writeHead(404).end('nf'); return; }
  const stat = fs.statSync(file); const type = MIME[path.extname(file)]||'application/octet-stream';
  const range = req.headers.range;
  if(range){ const m=/bytes=(\d*)-(\d*)/.exec(range); const start=parseInt(m[1]||'0'); const end=m[2]?parseInt(m[2]):stat.size-1;
    res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});
    fs.createReadStream(file,{start,end}).pipe(res); return; }
  res.writeHead(200,{'Content-Type':type,'Content-Length':stat.size,'Accept-Ranges':'bytes'});
  fs.createReadStream(file).pipe(res);
}).listen(8899,()=>console.log('spike server on http://localhost:8899'));
