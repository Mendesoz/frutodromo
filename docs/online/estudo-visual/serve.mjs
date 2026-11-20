import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const here=new URL('./',import.meta.url),root=new URL('../../../',here);
const routes={
 '/': ['index.html','text/html'], '/study.js':['study.js','text/javascript'], '/study.css':['study.css','text/css'],
 '/art/sprites.js':[new URL('prototipo-fazenda/sprites.js',root),'text/javascript'],
 '/art/reused-art.js':[new URL('prototipo-fazenda/reused-art.js',root),'text/javascript'],
 '/art/font.woff2':[new URL('prototipo-fazenda/fonts/pixelify-sans-latin-400-normal.woff2',root),'font/woff2']
};
createServer(async(req,res)=>{const route=routes[req.url];if(!route){res.writeHead(404);res.end();return;}try{const [file,type]=route;res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(typeof file==='string'?new URL(file,here):file));}catch{res.writeHead(500);res.end('Erro ao carregar o estudo');}}).listen(8870,'127.0.0.1',()=>console.log('Estudo isolado: http://127.0.0.1:8870/'));
