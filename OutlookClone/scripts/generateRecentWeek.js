// Generate (or refresh) the most recent rolling week of emails up to now using existing full generator.
// Usage: node scripts/generateRecentWeek.js
// Optional env: DAYS=7 QUIET=1 FORCE=0

const { spawnSync } = require('child_process');

const days = parseInt(process.env.DAYS || '7',10);
const end = new Date();
// Start date inclusive
const start = new Date(end.getTime() - (days*24*60*60*1000));

const env = { ...process.env };
env.GEN_START = start.toISOString().slice(0,10); // yyyy-mm-dd
env.GEN_END = end.toISOString().slice(0,10);
// Force regeneration of each day within range
env.SKIP_EXISTING_DAY = '0';
if(process.env.FORCE==='1') env.FORCE_REBUILD='1';
if(!env.QUIET) env.QUIET='1';

console.log(`[recent-week] Generating emails from ${env.GEN_START} to ${env.GEN_END} (${days} days)`);
const result = spawnSync('node', ['generateFullDataset.js'], { stdio: 'inherit', cwd: process.cwd(), env });
if(result.status!==0){
  console.error('[recent-week] Generation failed');
  process.exit(result.status||1);
}
console.log('[recent-week] Done.');
