import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const urls=process.argv.slice(2);const out=[];
function walk(o,fn){if(!o||typeof o!=='object')return;fn(o);if(o.lockupViewModel){let m=o.lockupViewModel.metadata?.lockupMetadataViewModel;console.log('VIDEO',m?.title?.content,JSON.stringify(m?.metadata?.contentMetadataViewModel?.metadataRows?.map(r=>r.metadataParts?.map(p=>p.text?.content))));}for(const v of Object.values(o))if(typeof v==='object')walk(v,fn);}
for(const url of urls){try{const {stdout}=await exec('curl',['-sL','--max-time','25',url+'/videos'],{maxBuffer:15e6});const m=stdout.match(/var ytInitialData = (.*?);<\/script>/s);if(!m)throw Error('No data');const d=JSON.parse(m[1]);let videos=[],counts=[];walk(d,o=>{if(o.videoRenderer){let v=o.videoRenderer;videos.push({title:v.title?.runs?.map(x=>x.text).join(''),age:v.publishedTimeText?.simpleText,url:'https://www.youtube.com/watch?v='+v.videoId});}if(typeof o.content==='string'&&/subscribers$/.test(o.content))counts.push(o.content)});let r={url,metadata:d.metadata?.channelMetadataRenderer,counts,videos};out.push(r);console.log(JSON.stringify(r));}catch(e){console.log(url,e.message)}}
await fs.writeFile('outputs/gig_discovery/profile_review_2026-11-25.json',JSON.stringify(out,null,2));
