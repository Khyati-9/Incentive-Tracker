const modal = document.querySelector('#modal');
let liveFeed = null;
const details = {
  Swiggy: ['S', '₹1,250', 'fc7a3b'], Zomato: ['z', '₹2,000', 'e83e5b'],
  Blinkit: ['B', '₹1,500', 'f7c620'], Zepto: ['Z', '₹2,500', '9240e5'],
  'Flipkart Minutes': ['F', '₹1,000', '2878e8'], BigBasket: ['bb', '₹1,500', '58a935'],
  'Swiggy Instamart': ['i', '₹2,000', 'fc7a3b'], 'Amazon Flex / Amazon Now': ['a', 'No public joining fee', '263746'],
  JioMart: ['J', '₹1,000', '1674d1'], 'Rapido Parcel': ['R', '₹1,500', 'f5c400']
};
function openModal(name){ window.open(`details.html?platform=${encodeURIComponent(name)}`, '_blank', 'noopener'); }
function closeModal(event){ if(!event || event.target===modal || event.target.classList.contains('modal-close')) modal.classList.remove('show'); }
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{ document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const filter=btn.dataset.filter; document.querySelectorAll('.platform-card').forEach(card=>card.style.display=filter==='all'||card.dataset.type===filter?'block':'none'); }));
document.addEventListener('keydown', e=>{if(e.key==='Escape') modal.classList.remove('show')});
async function refreshFeed(){
  const status=document.querySelector('#feed-status');
  try{
    const response=await fetch(`data/platforms.json?ts=${Date.now()}`);
    liveFeed=await response.json();
    const health=await fetch(`data/live-status.json?ts=${Date.now()}`).then(result=>result.ok?result.json():null).catch(()=>null);
    const when=new Date(liveFeed.updatedAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
    const healthText=health?.totalSources ? ` · ${health.successfulSources}/${health.totalSources} sources reachable` : '';
    status.textContent=`Official public pages · last checked ${when}${healthText}`;
    document.querySelector('#refresh-feed').textContent='✓ Updated';
    setTimeout(()=>document.querySelector('#refresh-feed').textContent='↻ Refresh data',1800);
  }catch(error){ status.textContent='Offline · showing saved comparison data'; }
}
document.querySelector('#refresh-feed').addEventListener('click', refreshFeed);
refreshFeed();
setInterval(refreshFeed, 60000);
document.querySelectorAll('.platform-card').forEach(card=>card.addEventListener('click', event=>{ if(!event.target.closest('button')) openModal(card.querySelector('h4').textContent); }));
document.querySelector('.incentive-list > div:last-child')?.remove();
document.querySelector('#modal')?.remove();
