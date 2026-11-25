import fs from 'node:fs/promises';

const channels=JSON.parse(await fs.readFile('outputs/gig_discovery/checked.json','utf8'));
const gig=/rapido|swiggy|zomato|blinkit|zepto|porter|uber|ola|delivery|cab driver|taxi|instamart|shadowfax|dunzo|ecom express|bigbasket/i;
const handles=new Set();

for(const channel of channels){
  const evidence=(channel.evidence||[]).map(x=>x.title).join(' ');
  if(!gig.test(evidence)) continue;
  const description=channel.metadata?.description||'';
  for(const match of description.matchAll(/instagram\.com\/(?:_u\/)?([A-Za-z0-9._]+)/gi)){
    const handle=match[1].replace(/[._]+$/,'');
    if(handle && !['p','reel','reels','explore','stories'].includes(handle.toLowerCase())) handles.add(handle);
  }
  for(const line of description.split(/\r?\n/)){
    if(!/insta(?:gram)?/i.test(line)) continue;
    for(const match of line.matchAll(/@([A-Za-z0-9._]{3,30})/g)) handles.add(match[1].replace(/[._]+$/,''));
  }
}

const existing=new Set((JSON.parse(await fs.readFile('outputs/gig_discovery/instagram.json','utf8'))).map(x=>x.handle.toLowerCase()));
const out=[...handles].filter(x=>!existing.has(x.toLowerCase())).sort();
await fs.writeFile('outputs/gig_discovery/instagram_crosslinks.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({found:handles.size,new:out.length,handles:out},null,2));
