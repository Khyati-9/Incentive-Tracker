#!/usr/bin/env node
/**
 * Public-data updater for Incentive Atlas.
 *
 * Scope: official public pages only. It does not log in, bypass bot protection,
 * scrape partner apps, or invent city-specific incentives.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const dataPath = resolve(root, 'data/platforms.json');
const statusPath = resolve(root, 'data/live-status.json');

const sources = [
  { id: 'swiggy', platform: 'Swiggy', url: 'https://ride.swiggy.com/', patterns: [
    ['headline', /Earn\s+Up\s+to\s+₹?\s*30,?000\/month/i, 'Up to ₹30,000/month advertised'],
    ['joining', /onboarding\s+fee\s+is\s+around\s+₹?\s*1500/i, 'Around ₹1,500 onboarding fee'],
    ['payout', /transfer your earnings every week/i, 'Weekly to bank account']
  ]},
  { id: 'blinkit', platform: 'Blinkit', url: 'https://blinkit.com/pages/delivery', patterns: [
    ['headline', /Earn\s+upto\s+₹?\s*50,?000/i, 'Up to ₹50,000/month advertised'],
    ['joining', /JOINING\s+BONUS\s+of\s+upto\s+₹?\s*4,?000/i, 'Bonus up to ₹4,000'],
    ['payout', /Payment\s+made\s+every\s+7\s+days/i, 'Every 7 days']
  ]},
  { id: 'amazon-flex', platform: 'Amazon Flex / Amazon Now', url: 'https://flex.amazon.in/', patterns: [
    ['headline', /earn\s+up\s+to\s+₹?\s*140[^<]{0,50}hour/i, 'Up to ₹140/hour advertised; actual varies'],
    ['payout', /paid\s+on\s+the\s+day\(s\)\s+you\s+choose/i, 'Selected payment day'],
    ['sourceScope', /Amazon\s+Now/i, 'Amazon standard, Fresh, Store Orders and Amazon Now']
  ]},
  { id: 'bigbasket', platform: 'BigBasket', url: 'https://riders.bigbasket.com/?nc=MoreInformation', patterns: [
    ['headline', /Monthly\s+earnings\s+up\s+to\s+₹?\s*50,?000/i, 'Up to ₹50,000/month advertised'],
    ['referral', /Referral\s+Bonus\s+up\s+to\s+₹?\s*5,?000/i, 'Referral bonus up to ₹5,000'],
    ['insurance', /Health\s+Insurance[^₹]{0,30}₹?\s*1\s*Lakh/i, 'Health insurance up to ₹1 lakh']
  ]},
  { id: 'rapido', platform: 'Rapido Parcel', url: 'https://www.rapido.bike/become-a-captain', patterns: [
    ['joining', /join\s+as\s+a\s+Rapido\s+Captain\s+free\s+of\s+cost/i, 'Free'],
    ['headline', /up\s+to\s+₹?\s*150\s+per\s+hour/i, 'Up to ₹150/hour advertised'],
    ['payout', /added\s+to\s+your\s+Captain\s+wallet/i, 'Captain wallet; redeem to bank']
  ]}
];

const now = new Date();
const iso = now.toISOString();
const strip = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const clean = value => value.replace(/\s+/g, ' ').trim();

let base;
try { base = JSON.parse(await readFile(dataPath, 'utf8')); } catch (error) { console.error(`Cannot read ${dataPath}:`, error.message); process.exit(1); }

const checks = [];
for (const source of sources) {
  const check = { id: source.id, platform: source.platform, url: source.url, checkedAt: iso, ok: false, matched: [], error: null };
  try {
    const response = await fetch(source.url, { headers: { 'user-agent': 'IncentiveAtlasPublicDataBot/1.0 (+manual-owner-scheduled)' } });
    const html = await response.text();
    const text = clean(strip(html));
    check.httpStatus = response.status;
    check.ok = response.ok;
    check.contentLength = html.length;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    for (const [field, pattern, value] of source.patterns) {
      if (pattern.test(text)) check.matched.push({ field, value });
    }
    check.matchCount = check.matched.length;
    const platform = base.platforms.find(item => item.name === source.platform);
    if (platform) {
      for (const match of check.matched) {
        if (match.field === 'headline') platform.headline = match.value;
        if (match.field === 'joining') platform.money.joining = match.value;
        if (match.field === 'payout') platform.money.payout = match.value;
        if (match.field === 'insurance') platform.insurance = match.value;
        if (match.field === 'referral') platform.bonus.advertised = match.value;
        if (match.field === 'sourceScope') platform.summary = match.value;
      }
    }
  } catch (error) {
    check.error = error.message;
  }
  checks.push(check);
}

const successful = checks.filter(check => check.ok && check.matchCount > 0).length;
base.updatedAt = iso;
base.refreshMode = 'automated-official-public-source-review';
base.lastRun = { at: iso, successfulSources: successful, totalSources: checks.length };
base.sourceChecks = checks;
await mkdir(dirname(dataPath), { recursive: true });
await writeFile(dataPath, `${JSON.stringify(base, null, 2)}\n`);
await writeFile(statusPath, `${JSON.stringify({ updatedAt: iso, successfulSources: successful, totalSources: checks.length, checks }, null, 2)}\n`);
console.log(`Incentive Atlas update complete: ${successful}/${checks.length} official sources reachable.`);
for (const check of checks) console.log(`${check.ok && check.matchCount > 0 ? 'OK ' : check.ok ? 'WARN' : 'ERR '} ${check.platform}: ${check.matched?.length ?? 0} fields matched${check.error ? ` (${check.error})` : ''}`);
