import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';

// Public counts checked on 2026-11-24. Instagram audience figures are followers.
// The Name cells link to the account; source URLs remain in this builder for audit.
const records=[
 {name:'Angkit Joshi',url:'https://www.instagram.com/angkitjoshi/',social:'Instagram',gig:'Uber',count:467500,content:'Cab rides and passenger conversation reels',source:'https://aveoreach.com/lists/noida-lifestyle-influencer'},
 {name:'Benjamin Ryan Gautam',url:'https://www.instagram.com/benjaminryangautam/',social:'Instagram',gig:'Blinkit',count:157000,content:'Delivery-worker get-ready-with-me reels and work-life stories',source:'https://www.ndtv.com/lifestyle/meet-the-new-instagram-stars-cooks-househelps-and-delivery-partners-11674350'},
 {name:'The Shreemanji',url:'https://www.youtube.com/channel/UC4o3sBJPTGROZeNRWRhWPQw',social:'YouTube',gig:'Zomato, Swiggy, Blinkit, Zepto, Rapido, Porter',count:156000,content:'Delivery app training, incentives and account troubleshooting',source:'https://vling.net/en/channel/UC4o3sBJPTGROZeNRWRhWPQw/channel-info'},
 {name:'VSK Vlogs',url:'https://www.youtube.com/channel/UC9e0-FhxkH-iL0t0xw5NeXg',social:'YouTube',gig:'Rapido, Ola, Uber, Swiggy, Zomato, Porter',count:148000,content:'Live bike taxi and delivery rides, earnings and rider news',source:'https://www.youtube.com/channel/UC9e0-FhxkH-iL0t0xw5NeXg'},
 {name:'CRAZY MANI VLOG13',url:'https://www.youtube.com/@crazymanivlog13',social:'YouTube',gig:'Rapido',count:140000,content:'Vizag bike taxi rides, routes and profit challenges',source:'https://asknaveen.com/channel/%40crazymanivlog13'},
 {name:'Suheb Choudhary',url:'https://www.instagram.com/suheb.official/',social:'Instagram',gig:'Ola, Uber',count:132700,content:'Taxi driver reels, cab work and Uber commissions',source:'https://pictame.com/en/instagram/suheb.official/6614262596/analytics'},
 {name:'Mani Vlogs',url:'https://www.youtube.com/channel/UCRGXgFitQqRE8MTC85reUfg',social:'YouTube',gig:'Rapido, Uber, Ola, Swiggy, Zomato, Zepto',count:101000,content:'Hyderabad ride and delivery earnings, registration and rider experiences',source:'https://vling.net/en/channel/UCRGXgFitQqRE8MTC85reUfg/channel-info'},
 {name:'Munna Kumar Guddu',url:'https://www.youtube.com/channel/UCTXUqVHyl0m-HW0UuzmD9ZA',social:'YouTube',gig:'Delivery, Porter, Rapido',count:78000,content:'Delivery shifts, earnings, worker advice and joining tutorials',source:'https://www.youtube.com/watch?v=F1jLNHuB0As'},
 {name:'Amol Patil Tech',url:'https://www.youtube.com/channel/UC7WxPGW8HwXBV3IO4FtD3KA',social:'YouTube',gig:'Zepto, Blinkit, Zomato, Swiggy, Rapido, Porter, Uber',count:71400,content:'Delivery job pay, registration and onboarding tutorials',source:'https://www.youtube.com/channel/UC7WxPGW8HwXBV3IO4FtD3KA'},
 {name:'AB CABWALA',url:'https://www.youtube.com/channel/UC8DzdPsRoGGeciytDTNj8Ng',social:'YouTube',gig:'Ola, Uber, Rapido',count:63792,content:'Cab driver income, taxi business and driver advice',source:'https://socialcounts.org/youtube-live-subscriber-count/UC8DzdPsRoGGeciytDTNj8Ng'},
 {name:'Sumit Rider Vlogs',url:'https://www.youtube.com/channel/UC6LhdUR3PxN-dGV96eby3iw',social:'YouTube',gig:'Blinkit, Zepto, Swiggy, Zomato, Rapido, Porter, Uber',count:54200,content:'Daily rider earnings, incentives and platform comparisons',source:'https://www.youtube.com/channel/UC6LhdUR3PxN-dGV96eby3iw'}
];
records.push(
{name:'Sonali Auto Driver',url:'https://www.instagram.com/sonaliautodriver_808/',social:'Instagram',gig:'Auto driving',count:70000,content:'Auto-driver workdays, passengers and daily life; count reported May 2026'}
);
const checked=JSON.parse(await fs.readFile('outputs/gig_discovery/checked.json','utf8'));
const selected=JSON.parse(await fs.readFile('gig_selected.json','utf8'));
Object.assign(selected,{
'UCJx28K640ZC5IxjGg90idFQ':['Rapido','Bike-taxi shifts, rate cards and rider earnings'],
'UCCR4iKl2V4h7ElU345czqLQ':['Rapido','Assamese rider workdays, earnings and daily life'],
'UC4aF82XyhV-vkdbCTbEVwNw':['Zomato, Ecom Express','Delivery shifts, daily earnings and courier-job guidance'],
'UCvasG08PG0CHNTP0ptYHP7g':['Uber','Cab bookings, passenger conversations and driver life']});
function countOf(c){let t=c.countTexts?.filter(x=>typeof x==='string'&&/^[\d.]+[km]? subscribers$/.test(x)).at(-1);if(!t)return null;let v=t.split(' ')[0];return Math.round(parseFloat(v)*(v.endsWith('m')?1e6:v.endsWith('k')?1e3:1));}
for(const r of records.filter(r=>r.social==='YouTube')){let c=checked.find(c=>c.url===r.url||c.metadata?.ownerUrls?.some(u=>u.replace('http:','https:')===r.url));if(c&&countOf(c)){r.count=countOf(c);r.name=c.metadata?.title||c.name;}}
for(const [id,[gig,content]] of Object.entries(selected)){let c=checked.find(c=>c.id===id);if(c&&countOf(c)>50000&&!records.some(r=>r.url===c.url))records.push({name:c.metadata?.title||c.name,url:c.url,social:'YouTube',gig,content,count:countOf(c)});}
records.push(
{name:'Deepak Kumar (NCR Cab Vlogging)',url:'https://www.instagram.com/ncr_cab_vloging/',social:'Instagram',gig:'Cab driving',count:66000,content:'Cab-driver working days, rides and earnings'},
{name:'Amit Kumar',url:'https://www.instagram.com/amit_creators/',social:'Instagram',gig:'Ola, Uber',count:82000,content:'Taxi-driver updates, road issues and daily work'},
{name:'Tulsi',url:'https://www.instagram.com/tulsi_vlog_01/',social:'Instagram',gig:'Rapido',count:65000,content:'Delhi bike-taxi rides, captain tips and daily life'},
{name:'Purshotam Kumar (Gojo Rider)',url:'https://www.instagram.com/gojo_rider/',social:'Instagram',gig:'Rapido',count:81000,content:'Bike-taxi rider stories, travel and everyday life'},
{name:'Guwahati Ka Ladka',url:'https://www.youtube.com/channel/UCRW24O7FjygO3kmNeGU3nfw',social:'YouTube',gig:'Instant delivery platforms',count:72500,content:'Delivery-platform incentives, earnings and joining information'},
{name:'Auto Kannadiga',url:'https://www.instagram.com/autokannadiga0779/',social:'Instagram',gig:'Auto driving',count:177000,content:'Bengaluru auto-driver work, passenger interactions and daily life'},
{name:'Parashuram Shatty',url:'https://www.instagram.com/parshuram_shatty/',social:'Instagram',gig:'Auto driving',count:170000,content:'Bengaluru auto-driver workdays, passenger stories and Kannada comedy'},
{name:'Shirin Ansari',url:'https://www.instagram.com/shirin_ansari786/',social:'Instagram',gig:'Auto driving',count:83000,content:'Mumbai woman auto-driver work, daily life and passenger stories'},
{name:'SUPER SUN (Mahesh)',url:'https://www.instagram.com/supersunmahesh/',social:'Instagram',gig:'Swiggy, bike delivery',count:222000,content:'Tamil delivery-worker reels, work experiences and earnings journey'},
{name:'Ansh Raj Aman',url:'https://www.youtube.com/@anshrajaman',social:'YouTube',gig:'Rapido',count:281000,content:'Rapido vlogs with bike and lifestyle content'});
const ig=JSON.parse(await fs.readFile('outputs/gig_discovery/instagram.json','utf8'));
for(const r of records.filter(r=>r.social==='Instagram')){let h=r.url.split('/')[3];let x=ig.filter(x=>x.handle===h).at(-1);let m=x?.meta.join(' ').match(/([\d,.]+)([KM]?) Followers/);if(m)r.count=Math.round(parseFloat(m[1].replaceAll(',',''))*(m[2]==='M'?1e6:m[2]==='K'?1e3:1));r.content=r.content.replace(/; count reported.*$/,'');}
await fs.writeFile('outputs/gig_discovery/final_records.json',JSON.stringify(records,null,2));
console.log('ACCOUNTS',records.length);
records.sort((a,b)=>b.count-a.count);
const wb=Workbook.create();const sh=wb.worksheets.add('Creators');sh.showGridLines=false;
sh.getRange('A1:D1').values=[['Name','Platform','Subscribers','Type of content']];
sh.getRange('A1:D1').format={fill:'#17365D',font:{name:'Aptos',size:11,bold:true,color:'#FFFFFF'},rowHeight:30};
const rows=records.map(r=>[r.name,r.social,r.count,`${r.gig}: ${r.content}`]);
sh.getRange(`A2:D${rows.length+1}`).values=rows;
for(let i=0;i<records.length;i++){const r=records[i];sh.getRange(`A${i+2}`).formulas=[[`=HYPERLINK("${r.url}","${r.name}")`]];}
sh.getRange(`A2:D${rows.length+1}`).format.font={name:'Aptos',size:10};
sh.getRange(`A2:A${rows.length+1}`).format.font={name:'Aptos',size:10,color:'#1155CC',underline:'single'};
sh.getRange('A:A').format.columnWidth=38;sh.getRange('B:B').format.columnWidth=16;sh.getRange('C:C').format.columnWidth=17;sh.getRange('D:D').format.columnWidth=95;
sh.getRange(`C2:C${rows.length+1}`).setNumberFormat('#,##0');
sh.getRange(`A2:D${rows.length+1}`).format.wrapText=true;sh.getRange(`A2:D${rows.length+1}`).format.rowHeight=42;
sh.freezePanes.freezeRows(1);sh.tables.add(`A1:D${rows.length+1}`,true,'GigCreators');
wb.recalculate();
const check=await wb.inspect({kind:'table',range:`Creators!A1:D${rows.length+1}`,tableMaxRows:rows.length+1,tableMaxCols:4,maxChars:6500});console.log(check.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:100}});console.log(errors.ndjson);
const dir='/Users/khyati/Incentives/outputs/gig_worker_creators_2026-11-24';await fs.mkdir(dir,{recursive:true});
const file=await SpreadsheetFile.exportXlsx(wb);await file.save(`${dir}/gig_worker_creators_clean.xlsx`);
const img=await wb.render({sheetName:'Creators',range:`A1:D${rows.length+1}`,scale:1.5,format:'png'});await fs.writeFile(`${dir}/creators_clean_preview.png`,new Uint8Array(await img.arrayBuffer()));
console.log(`${dir}/gig_worker_creators_clean.xlsx`);
