// Mock flight data with transfer partner sources

export const ALL_PROGRAMS = [
  { name: 'ANA Mileage Club',              miles: 55000, taxes: 12.40, carrier: 'ANA',               color: '#00D4FF', sources: ['amex'] },
  { name: 'Air Canada Aeroplan',           miles: 60000, taxes: 48.20, carrier: 'Air Canada',         color: '#FF6B35', sources: ['amex','chase','capital one','bilt'] },
  { name: 'Air France/KLM Flying Blue',    miles: 57000, taxes: 32.00, carrier: 'Air France',         color: '#A855F7', sources: ['amex','chase','citi','capital one','bilt'] },
  { name: 'Virgin Atlantic Flying Club',   miles: 50000, taxes: 22.00, carrier: 'Virgin Atlantic',    color: '#E11D48', sources: ['amex','chase','citi','capital one','bilt'] },
  { name: 'British Airways Avios',         miles: 62000, taxes: 55.00, carrier: 'British Airways',    color: '#1D4ED8', sources: ['amex','chase','bilt'] },
  { name: 'Singapore KrisFlyer',           miles: 67000, taxes: 18.00, carrier: 'Singapore Airlines', color: '#F59E0B', sources: ['amex','chase','citi','capital one'] },
  { name: 'Delta SkyMiles',                miles: 75000, taxes: 11.20, carrier: 'Delta',               color: '#EF4444', sources: ['amex'] },
  { name: 'United MileagePlus',            miles: 55000, taxes: 12.40, carrier: 'United',              color: '#3B82F6', sources: ['chase','bilt'] },
  { name: 'Alaska Mileage Plan',           miles: 50000, taxes: 22.00, carrier: 'Japan Airlines',     color: '#00FF88', sources: ['alaska','bilt'] },
  { name: 'American AAdvantage',           miles: 57500, taxes: 19.00, carrier: 'American Airlines',   color: '#F97316', sources: ['bilt','citi','alaska'] },
  { name: 'Avianca LifeMiles',             miles: 63000, taxes: 14.00, carrier: 'Avianca',             color: '#F59E0B', sources: ['citi','capital one'] },
  { name: 'Turkish Miles&Smiles',          miles: 45000, taxes: 10.00, carrier: 'Turkish Airlines',    color: '#E11D48', sources: ['citi','capital one','bilt'] },
  { name: 'Cathay Pacific Asia Miles',     miles: 70000, taxes: 25.00, carrier: 'Cathay Pacific',      color: '#1D4ED8', sources: ['amex','citi','capital one','bilt'] },
  { name: 'Emirates Skywards',             miles: 72000, taxes: 38.00, carrier: 'Emirates',            color: '#00D4FF', sources: ['amex','chase','citi','capital one'] },
];

const TIMES = [
  { dep: '10:30', arr: '14:15+1', dur: '13h 45m', stops: 0 },
  { dep: '13:00', arr: '17:30+1', dur: '14h 30m', stops: 1 },
  { dep: '23:55', arr: '05:10+2', dur: '13h 15m', stops: 0 },
  { dep: '08:45', arr: '13:00+1', dur: '14h 15m', stops: 1 },
  { dep: '18:20', arr: '22:45+1', dur: '14h 25m', stops: 0 },
];

function normalizeProgram(program) {
  if (!program) return null;
  const p = program.toLowerCase();
  if (p.includes('amex') || p.includes('membership rewards')) return 'amex';
  if (p.includes('chase') || p.includes('ultimate rewards')) return 'chase';
  if (p.includes('citi') || p.includes('thankyou')) return 'citi';
  if (p.includes('capital one')) return 'capital one';
  if (p.includes('bilt')) return 'bilt';
  if (p.includes('alaska')) return 'alaska';
  return p;
}

function parsePrograms(programStr) {
  if (!programStr || programStr === 'all') return null;
  const parts = programStr.split(/,|\band\b|&/i).map(s => s.trim()).filter(Boolean);
  return parts.map(normalizeProgram).filter(Boolean);
}

export function getMockResults(params) {
  const origin = (params.origin || 'JFK').toUpperCase();
  const dest = (params.destination || 'NRT').toUpperCase();
  const cabin = params.cabin || 'business';
  const sources = parsePrograms(params.program);

  let filtered = sources
    ? ALL_PROGRAMS.filter(p =>
        sources.some(src =>
          p.sources.includes(src) ||
          p.name.toLowerCase().includes(src)
        )
      )
    : ALL_PROGRAMS;

  if (filtered.length === 0) filtered = ALL_PROGRAMS;

  return filtered.map((p, i) => ({
    id: i,
    origin,
    destination: dest,
    departTime: TIMES[i % TIMES.length].dep,
    arriveTime: TIMES[i % TIMES.length].arr,
    duration: TIMES[i % TIMES.length].dur,
    stops: TIMES[i % TIMES.length].stops,
    program: p.name,
    miles: p.miles,
    taxes: p.taxes,
    carrier: p.carrier,
    cabin,
    color: p.color,
    bookingUrl: '#',
  }));
}
