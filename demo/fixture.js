// The demo's hosts. Seeded, so the same call always draws the same screen.
// demo/index.html loads them and so does `npm run figures`, so the groups the
// write-up quotes for 200 hosts are the groups this demo draws at 200.

export const FIELDS = [
  { key:'environment',   label:'Environment',   type:'single-select', options:['prod','staging','dev'] },
  { key:'tags',          label:'Tags',          type:'multi-value' },
  { key:'monitoring',    label:'Monitoring',    type:'boolean' },
  { key:'retentionDays', label:'Log retention', type:'number', min:1, max:365, unit:'d' },
];

const TAGS = ['web','api','db','cache','worker','queue','pci','legacy','gpu','monitored'];
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

export function makeHosts(n) {
  const rand = mulberry(7);
  return Array.from({ length: n }, (_, i) => {
    const envRoll = rand();
    const environment = n === 12
      ? (i < 5 ? 'prod' : i < 9 ? 'staging' : 'dev')
      : (envRoll < 0.60 ? 'staging' : envRoll < 0.975 ? 'dev' : 'prod');
    const tagCount = 1 + Math.floor(rand() * 3);
    const tags = [...new Set(Array.from({ length: tagCount }, () => TAGS[Math.floor(rand() * TAGS.length)]))].sort();
    return {
      id: `h${i}`,
      hostname: `${environment}-${['api','db','web','cache','worker'][i % 5]}-${String(i).padStart(2,'0')}.internal`,
      environment, tags,
      monitoring: rand() > 0.35,
      retentionDays: [7, 14, 30, 90, 1][Math.floor(rand() * 5)],
    };
  });
}
