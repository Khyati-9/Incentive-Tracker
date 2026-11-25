import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const ids=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
function walk(o,fn){if(!o||typeof o!=='object')return;fn(o);for(const v of Object.values(o))if(typeof v==='object')walk(v,fn)}
for(const id of ids){
  try{
    const {stdout}=await exec('curl',['-sL','--max-time','25',`https://www.youtube.com/channel/${id}/videos`],{maxBuffer:16e6});
    const m=stdout.match(/var ytInitialData = (.*?);<\/script>/s);if(!m)throw Error('missing data');
    const d=JSON.parse(m[1]);const titles=[];
    walk(d,o=>{const v=o.videoRenderer||o.gridVideoRenderer;if(v?.title){const t=v.title.runs?.map(x=>x.text).join('')||v.title.simpleText;if(t&&!titles.includes(t))titles.push(t)}});
    console.log('\n'+id+'\n'+titles.slice(0,30).join('\n'));
  }catch(e){console.log('\n'+id+' ERROR '+e.message)}
}
