// Utility to load chunked monthly JSON email data in React Native via static requires.
// Uses a generated index of months to map to require() statements.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const monthIndex: Record<string, string[]> = require('../assets/data/monthIndex.json');

// Static require map: React Native bundler needs literal strings in require().
// We include all possible files present in /data and fallback gracefully if not found.
const monthRequireMap: Record<string, any> = {
  '2023/04_april': require('../data/2023/04_april.json'),
  '2023/05_may': require('../data/2023/05_may.json'),
  '2023/06_june': require('../data/2023/06_june.json'),
  '2023/07_july': require('../data/2023/07_july.json'),
  '2023/08_august': require('../data/2023/08_august.json'),
  '2023/09_september': require('../data/2023/09_september.json'),
  '2023/10_october': require('../data/2023/10_october.json'),
  '2023/11_november': require('../data/2023/11_november.json'),
  '2023/12_december': require('../data/2023/12_december.json'),

  '2024/01_january': require('../data/2024/01_january.json'),
  '2024/02_february': require('../data/2024/02_february.json'),
  '2024/03_march': require('../data/2024/03_march.json'),
  '2024/04_april': require('../data/2024/04_april.json'),
  '2024/05_may': require('../data/2024/05_may.json'),
  '2024/06_june': require('../data/2024/06_june.json'),
  '2024/07_july': require('../data/2024/07_july.json'),
  '2024/08_august': require('../data/2024/08_august.json'),
  '2024/09_september': require('../data/2024/09_september.json'),
  '2024/10_october': require('../data/2024/10_october.json'),
  '2024/11_november': require('../data/2024/11_november.json'),
  '2024/12_december': require('../data/2024/12_december.json'),

  '2025/01_january': require('../data/2025/01_january.json'),
  '2025/02_february': require('../data/2025/02_february.json'),
  '2025/03_march': require('../data/2025/03_march.json'),
  '2025/04_april': require('../data/2025/04_april.json'),
  '2025/05_may': require('../data/2025/05_may.json'),
  '2025/06_june': require('../data/2025/06_june.json'),
  '2025/07_july': require('../data/2025/07_july.json'),
  '2025/08_august': require('../data/2025/08_august.json'),
};

export type RawEmail = {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  timestamp: number;
  isRead: boolean;
};

export function getAvailableMonths(): Array<{ year: string; monthKey: string }>{
  const out: Array<{ year: string; monthKey: string }> = [];
  Object.keys(monthIndex).forEach((year) => {
    monthIndex[year].forEach((m) => out.push({ year, monthKey: m }));
  });
  return out;
}

export function loadMonth(year: string, monthKey: string): RawEmail[] {
  const pathKey = `${year}/${monthKey}`;
  const data = monthRequireMap[pathKey];
  if (!data) return [];
  return data as RawEmail[];
}

export function loadLatestMonth(): { year: string; monthKey: string; data: RawEmail[] } | null {
  const years = Object.keys(monthIndex).sort();
  if (years.length === 0) return null;
  const lastYear = years[years.length - 1];
  const months = monthIndex[lastYear];
  if (!months || months.length === 0) return null;
  const lastMonthKey = months[months.length - 1];
  const data = loadMonth(lastYear, lastMonthKey);
  return { year: lastYear, monthKey: lastMonthKey, data };
}
