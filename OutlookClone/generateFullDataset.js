const { faker } = require('@faker-js/faker');
const { writeFileSync, mkdirSync, existsSync, readFileSync } = require('fs');
const { addDays, format, setHours, setMinutes, isWeekend, getWeekOfMonth, isFriday } = require('date-fns');
const { fromZonedTime } = require('date-fns-tz');
const { v4: uuidv4 } = require('uuid');

// 1. CONFIGURATION
const timeZone = 'Australia/Melbourne';
const envStart = process.env.GEN_START ? new Date(process.env.GEN_START) : new Date('2023-04-24');
const envEnd = process.env.GEN_END ? new Date(process.env.GEN_END) : new Date('2025-08-28');
const startDate = envStart;
const endDate = envEnd;
const outputDirectory = process.env.GEN_OUTDIR || './data'; // Root directory for all data (relative to this script's CWD)

// 2. DEFINE OUR USER - THOMAS FRANCIS
const user = {
  name: 'Thomas Francis',
  email: 'thomas.francis@jpmorgan.com',
};

// Shared list of known institutional clients for realistic references
const knownClients = [
  'Club Plus',
  'TWUSUPER',
  'QBE',
  'NPF',
  'Sunsuper',
  'Future Fund',
  'AMP Capital',
];

// 3. DEFINE THE COMPLETE CAST (subset + corrected senders)
const senders = [
  {
    name: 'Lyndon Fagan',
    email: 'lyndon.fagan@jpmorgan.com',
    role: 'Executive Director | Head of APAC Metals & Mining',
    type: 'internal',
    signature:
      `--\nLyndon Fagan\nExecutive Director | Head of APAC Metals & Mining Equity Research\nJ.P. Morgan Asset Management\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 9633 4000\n`,
  },
  {
    name: 'Hannah Pham',
    email: 'hannah.pham@jpmorgan.com',
    role: 'Markets Analyst',
    type: 'internal',
    signature:
      `--\nHannah Pham\nMarkets Analyst | Asset Management\nJ.P. Morgan Asset Management\nMelbourne, Australia\nMobile: +61 4${faker.string.numeric(6)} ${faker.string.numeric(3)}\n`,
  },
  {
    name: 'Al Harvey',
    email: 'al.harvey@jpmorgan.com',
    role: 'Mining Analyst | Equity Research',
    type: 'internal',
    signature: `--\nAl Harvey\nMining Analyst | Equity Research\nJ.P. Morgan\nSydney, Australia\n`,
  },
  {
    name: 'Bloomberg Terminal',
    email: 'alerts@bloomberg.net',
    role: 'Market Data',
    type: 'external-vendor',
    signature: `--\nBloomberg Terminal Alert Service\nVisit: www.bloomberg.com/professional\n`,
  },
  // Corrected: Facilities (external)
  {
    name: '101 Collins Facilities',
    email: 'facilities@101collins.com.au',
    role: 'Building Management',
    type: 'external-facilities',
    signature:
      `--\n101 Collins Facilities Management\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 8636 5000`,
  },
  // Corrected: Morning Brief (internal-brief)
  {
    name: 'J.P. Morgan Research',
    email: 'research@jpmorgan.com',
    role: 'Global Research',
    type: 'internal-brief',
    signature:
      `--\nJ.P. Morgan Research\nThis is an automated daily briefing.\nFor more information, please contact your representative.`,
  },
  // Corrected: Microsoft Teams (external)
  {
    name: 'Microsoft Teams',
    email: 'no-reply@teams.microsoft.com',
    role: 'Notifications',
    type: 'external-teams',
    signature:
      `--\nThis message was sent from a notification-only address that cannot accept incoming email.\nPlease do not reply to this message.`,
  },
  // All-staff executives
  {
    name: 'Jamie Dimon',
    email: 'jamie.dimon@jpmorgan.com',
    role: 'Chairman and CEO',
    type: 'internal-allstaff',
    signature: `--\nJamie Dimon\nChairman and CEO\nJPMorgan Chase & Co.`,
  },
  {
    name: 'Elaine Myers',
    email: 'elaine.myers@jpmorgan.com',
    role: 'CEO, Asia Pacific',
    type: 'internal-allstaff',
    signature: `--\nElaine Myers\nCEO, Asia Pacific\nJPMorgan Chase & Co.`,
  },
  {
    name: 'Andrew Creber',
    email: 'andrew.creber@jpmorgan.com',
    role: 'CEO Australia & New Zealand',
    type: 'internal-allstaff',
    signature: `--\nAndrew Creber\nCEO Australia & New Zealand\nJ.P. Morgan`,
  },
  // NEW: Clients (external-client)
  {
    name: 'Robert Singh',
    email: 'investments@clubplus.com.au',
    role: 'Senior Portfolio Manager, Club Plus Super',
    type: 'external-client',
    signature: `--\nRobert Singh\nSenior Portfolio Manager\nClub Plus Super\nTel: +61 2 9254 5000`,
  },
  {
    name: 'Lisa Tran',
    email: 'investments@twusuper.com.au',
    role: 'Investment Analyst, TWUSUPER',
    type: 'external-client',
    signature: `--\nLisa Tran\nInvestment Analyst\nTWUSUPER`,
  },
  {
    name: 'David Chen',
    email: 'group.treasury@qbe.com',
    role: 'Group Treasury, QBE Insurance',
    type: 'external-client',
    signature: `--\nDavid Chen\nGroup Treasury\nQBE Insurance`,
  },
  {
    name: 'Michael Jones',
    email: 'investments@npf.org.nz',
    role: 'Portfolio Manager, National Provident Fund (NZ)',
    type: 'external-client',
    signature: `--\nMichael Jones\nPortfolio Manager\nNational Provident Fund\nWellington, New Zealand`,
  },
  // NEW: Payroll/HR (internal-hr)
  {
    name: 'J.P. Morgan Payroll',
    email: 'payroll.au@jpmorgan.com',
    role: 'Payroll Operations',
    type: 'internal-hr',
    signature: `--\nJ.P. Morgan Payroll - Australia\nThis is an automated notification. Please do not reply.\nFor inquiries, please contact HR Services.`,
  },
  // NEW: Senior Portfolio Manager (internal-pm)
  {
    name: 'Sarah Connor',
    email: 'sarah.connor@jpmorgan.com',
    role: 'Managing Director, Portfolio Manager',
    type: 'internal-pm',
    signature: `--\nSarah Connor\nManaging Director, Portfolio Manager\nJ.P. Morgan Asset Management\nSydney, Australia\nTel: +61 2 9003 8888`,
  },
  // NEW: Additional Clients (external-client)
  {
    name: 'Sunsuper Investments Team',
    email: 'investments@sunsuper.com.au',
    role: 'Institutional Client',
    type: 'external-client',
    signature: `--\nSunsuper Investments Team\nQueensland, Australia`,
  },
  {
    name: 'Future Fund Mandates',
    email: 'mandates@futurefund.gov.au',
    role: 'Institutional Client',
    type: 'external-client',
    signature: `--\nFuture Fund\nMelbourne, Australia`,
  },
  {
    name: 'AMP Capital Investments',
    email: 'investments@ampcapital.com',
    role: 'Institutional Client',
    type: 'external-client',
    signature: `--\nAMP Capital Investments\nSydney, Australia`,
  },
];

// 4. TEMPLATE STORES
const templateStores = {
  internal: [
    (from, to, currentDate) => {
      const topics = ['BHP model', 'NPF report', 'QBE presentation', 'lithium sector deep dive'];
      const topic = faker.helpers.arrayElement(topics);
      return {
        subject: `Review of ${topic}`,
        body: `Hi ${to.name.split(' ')[0]},\n\nI've just finished the first draft of the ${topic}. Could you take a look?\n\nCheers,\n${from.name.split(' ')[0]}\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      const greetings = ['Hi Thomas', 'Dear Thomas', 'Thomas', 'Hi Tom'];
      return {
  subject: `Client Request Follow-up`,
  body: `${faker.helpers.arrayElement(greetings)},\n\nQuick reminder that ${faker.helpers.arrayElement(knownClients)} needs a final sign-off. \n\nThanks,\n${from.name.split(' ')[0]}\n\n${from.signature}`,
      };
    },
  ],
  // NEW: External Client templates
  'external-client': [
    (from, to, currentDate) => {
      const topics = ['performance report', 'investment committee meeting', 'request for proposal', 'transition of funds'];
      const topic = faker.helpers.arrayElement(topics);
      const greetings = ['Hi Thomas', 'Dear Thomas', 'Thomas', 'Hi Tom'];
      return {
        subject: `Follow-up: ${faker.company.name()} ${topic}`,
        body: `${faker.helpers.arrayElement(greetings)},\n\n${faker.helpers.arrayElement(['Hope you are well.', 'Good to connect with you last week.'])}\n\nI'm following up on the ${topic}. We require an update by EOD ${faker.helpers.arrayElement(['tomorrow', 'Thursday', 'next week'])} for our trustees.\n\nCould you please provide a status update?\n\nKind regards,\n${from.name}\n\n${from.signature}`,
      };
    },
  ],
  'external-vendor': [
    (from, to, currentDate) => {
      const alerts = ['unusual options activity', 'analyst rating changes'];
      const stocks = ['BHP', 'RIO', 'FMG'];
      return {
        subject: `Alert: ${faker.helpers.arrayElement(stocks)} - ${faker.helpers.arrayElement(alerts)}`,
        body: `This is an automated alert from the Bloomberg Terminal.\n\nSecurity: ${faker.helpers.arrayElement(stocks)} AX Equity\nEvent: ${faker.helpers.arrayElement(alerts)} detected.\n\n${from.signature}`,
      };
    },
  ],
  'internal-brief': [
    (from, to, currentDate) => {
      const marketTone = faker.helpers.arrayElement(['risk-off', 'risk-on', 'mixed', 'cautious']);
      const movers = ['USD strengthened', 'Oil futures dropped', 'Tech stocks rallied', 'Base metals were volatile'];
      const keyEvent = faker.helpers.arrayElement(['FOMC Minutes', 'AU Employment Data', 'China PMI', 'RBA Speech']);
      return {
        subject: `AM Brief: ${format(currentDate, 'EEE, d MMM yyyy')}`,
        body: `Good morning,\n\n**Overnight Market Summary:**\nThe tone was ${marketTone}. ${faker.helpers.arrayElement(movers)} amid concerns over ${faker.finance.currencyName()}.\n\n**Key Event Today:** ${keyEvent} at ${faker.number.int({ min: 10, max: 15 })}:00 AEST.\n\n**Key Reads for Today:**\n- JPM Research: ${faker.company.name()} ${faker.helpers.arrayElement(['downgraded', 'upgraded'])} to ${faker.helpers.arrayElement(['Overweight', 'Neutral'])}\n- Bloomberg: ${faker.lorem.sentence(8)}\n- AFR: ${faker.lorem.sentence(6)}\n\n${from.signature}`,
      };
    },
  ],
  'external-teams': [
    (from, to, currentDate) => {
      const people = ['Lyndon Fagan', 'Hannah Pham', 'Al Harvey', 'The Resources Team'];
      return {
        subject: `Missed call from ${faker.helpers.arrayElement(people)}`,
        body: `You missed a call.\n\n${faker.helpers.arrayElement(people)} tried to call you at ${faker.number.int({ min: 9, max: 16 })}:${faker.number.int({ min: 10, max: 59 })}.\n\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      const meetingTitles = [
        'Q3 Performance Review',
        'BHP Deep Dive',
        `${faker.helpers.arrayElement(knownClients)} Investment Committee`,
        'Weekly Team Sync',
      ];
      return {
        subject: `Reminder: "${faker.helpers.arrayElement(meetingTitles)}" starts in 15 minutes`,
        body: `This is a reminder for your upcoming meeting.\n\n${from.signature}`,
      };
    },
    // NEW: 8:30 AM Weekday Team Meeting
    (from, to, currentDate) => {
      if (!isWeekend(currentDate)) {
        return {
          subject: `Reminder: "APAC Resources Morning Huddle" starts at 8:30 AM`,
          body: `This is a reminder for your daily team meeting.\n\n${from.signature}`,
          timestamp: generateTimestampAt(currentDate, 8, 30),
        };
      }
      return {
        subject: `Reminder: "APAC Resources Morning Huddle" starts soon`,
        body: `This is a reminder for your team meeting.\n\n${from.signature}`,
      };
    },
    // NEW: Friday Sector Wrap at 4:00 PM
    (from, to, currentDate) => {
      if (isFriday(currentDate)) {
        return {
          subject: `Reminder: "Weekly Metals & Mining Wrap" starts at 4:00 PM`,
          body: `This is a reminder for the weekly sector-wide meeting.\n\n${from.signature}`,
          timestamp: generateTimestampAt(currentDate, 16, 0),
        };
      }
      return {
        subject: `Reminder: "Weekly Metals & Mining Wrap" starts soon`,
        body: `This is a reminder for the sector-wide meeting.\n\n${from.signature}`,
      };
    },
  ],
  // UPDATED: Facilities templates (no floor specifics)
  'external-facilities': [
    (from, to, currentDate) => {
      return {
        subject: `Building Update: Scheduled Fire Drill`,
        body: `Dear Occupants,\n\nA scheduled fire drill will be conducted this ${faker.helpers.arrayElement(['Monday', 'Wednesday'])} morning between 10:00 AM - 11:00 AM. All building employees must participate. Please follow instructions from your floor wardens.\n\nRegards,\nFacilities Team\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      return {
        subject: `Important: Air Conditioning Maintenance Tonight`,
        body: `Please be advised that essential maintenance will be performed on the building's air conditioning system after 7:00 PM tonight. Some noise disruption may occur.\n\nWe appreciate your patience and apologise for any inconvenience caused.\n\n${from.signature}`,
      };
    },
  ],
  'internal-allstaff': [
    (from, to, currentDate) => {
      return {
        subject: `A note from ${from.name}`,
        body: `Dear colleagues,\n\n${faker.lorem.paragraphs(2)}\n\nI am consistently impressed with your dedication and want to thank you for your hard work during this ${faker.helpers.arrayElement(['period of market volatility', 'successful quarter', 'busy reporting season'])}.\n\nPlease continue to ${faker.helpers.arrayElement(['focus on our clients', 'uphold our first-class reputation', 'work together as one team'])}.\n\nBest,\n${from.name}\n\n${from.signature}`,
      };
    },
  ],
  // NEW: Payroll / HR templates
  'internal-hr': [
    (from, to, currentDate) => {
      const early = faker.datatype.boolean({ probability: 0.2 });
      const monthYear = format(currentDate, 'MMMM yyyy');
      const base = `Dear ${to.name},\n\nYour payslip for ${monthYear} is now available online.`;
      return {
        subject: `Your J.P. Morgan Payslip is Available`,
        body: early
          ? `${base} Due to the public holiday, payment will be processed a day early this period.\n\nTo view your payslip, please log in to the Employee Portal.\n\n${from.signature}`
          : `${base}\n\nTo view your payslip, please log in to the Employee Portal.\n\n${from.signature}`,
      };
    },
  ],
  // NEW: Portfolio Manager directives
  'internal-pm': [
    (from, to, currentDate) => {
  const clients = knownClients;
      const actions = ['immediately reduce', 'begin accumulating', 'liquidate the', 'hedge our exposure to'];
      const assets = ['energy sector holdings', 'BHP position', 'USD exposure', 'small-cap portfolio'];
      const greetings = ['Thomas,', 'Tom,', 'Team,', 'Thomas -'];
      return {
        subject: `URGENT: Portfolio Adjustment for ${faker.helpers.arrayElement(clients)}`,
        body: `${faker.helpers.arrayElement(greetings)}\n\nClient instruction just came down. We need to ${faker.helpers.arrayElement(actions)} the ${faker.helpers.arrayElement(assets)}.\n\nPlease drop everything and model out the implications. I need execution levels and a full impact analysis on my desk in 2 hours.\n\n${from.name}\n\n${from.signature}`,
      };
    },
  ],
};

// 5. TIME HELPERS
function generateTimestampForDate(date) {
  let hour;
  if (faker.datatype.boolean({ probability: 0.3 }) && !isWeekend(date)) {
    hour = faker.number.int({ min: 18, max: 21 });
  } else {
    hour = faker.number.int({ min: 8, max: 17 });
  }
  const minute = faker.number.int({ min: 0, max: 59 });
  let d = setHours(date, hour);
  d = setMinutes(d, minute);
  const utcDate = fromZonedTime(d, timeZone);
  return utcDate.getTime();
}

function generateTimestampAt(date, hour, minute) {
  let d = setHours(date, hour);
  d = setMinutes(d, minute);
  const utcDate = fromZonedTime(d, timeZone);
  return utcDate.getTime();
}

function getEmailCountForDate(date) {
  const weekOfMonth = getWeekOfMonth(date);
  const isCrunchTime = weekOfMonth >= 4;
  if (isWeekend(date)) {
    return isCrunchTime ? faker.number.int({ min: 5, max: 10 }) : faker.number.int({ min: 2, max: 5 });
  }
  return faker.number.int({ min: 15, max: 25 });
}

// 6. MAIN GENERATION FUNCTION
function generateEmails(start, end) {
  let current = new Date(start);
  console.log('Starting FULL email generation...');

  if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory, { recursive: true });
  }

  while (current <= end) {
    const year = format(current, 'yyyy');
    const month = format(current, 'MM_MMMM').toLowerCase();
    const yearDirectory = `${outputDirectory}/${year}`;
    const monthlyFile = `${yearDirectory}/${month}.json`;

    if (!existsSync(yearDirectory)) {
      mkdirSync(yearDirectory, { recursive: true });
    }

    const dateEmails = [];

    // 1) Scheduled Morning Brief on weekdays ~6:30-6:59 AEST
    if (!isWeekend(current)) {
      const researchSender = senders.find((s) => s.email === 'research@jpmorgan.com');
      const briefTemplate = templateStores['internal-brief'][0];
      const { subject, body } = briefTemplate(researchSender, user, current);
      const minute = faker.number.int({ min: 30, max: 59 });
      const ts = generateTimestampAt(current, 6, minute);
      dateEmails.push({
        id: uuidv4(),
        from: researchSender.email,
        fromName: researchSender.name,
        to: user.email,
        subject,
        body,
        timestamp: ts,
        isRead: true,
        isStarred: false,
        labels: ['internal-brief'],
        attachments: [],
      });
    }

    // 2) Rare All-Staff (0.2% chance)
    if (faker.datatype.boolean({ probability: 0.002 })) {
      const execSenders = senders.filter((s) => s.type === 'internal-allstaff');
      if (execSenders.length) {
        const exec = faker.helpers.arrayElement(execSenders);
        const tpl = templateStores['internal-allstaff'][0];
        const { subject, body } = tpl(exec, user, current);
        const ts = generateTimestampForDate(current);
        dateEmails.push({
          id: uuidv4(),
          from: exec.email,
          fromName: exec.name,
          to: user.email,
          subject,
          body,
          timestamp: ts,
          isRead: faker.datatype.boolean({ probability: 0.8 }),
          isStarred: false,
          labels: ['internal-allstaff'],
          attachments: [],
        });
      }
    }

    // 3) Remaining random emails for the day
    const targetCount = getEmailCountForDate(current);
    const remaining = Math.max(0, targetCount - dateEmails.length);
    const generalSenders = senders.filter((s) => s.type !== 'internal-brief' && s.type !== 'internal-allstaff');
    for (let i = 0; i < remaining; i++) {
      const from = faker.helpers.arrayElement(generalSenders);
      const templateStore = templateStores[from.type];
      if (!templateStore || templateStore.length === 0) continue;
      const template = faker.helpers.arrayElement(templateStore);
      const tplResult = template(from, user, current);
      if (!tplResult) continue;
      const { subject, body, timestamp: tsOverride } = tplResult;
      const email = {
        id: uuidv4(),
        from: from.email,
        fromName: from.name,
        to: user.email,
        subject,
        body,
        timestamp: tsOverride ?? generateTimestampForDate(current),
        isRead: faker.datatype.boolean({ probability: 0.7 }),
        isStarred: faker.datatype.boolean({ probability: 0.1 }),
        labels: [from.type],
        attachments: faker.datatype.boolean({ probability: 0.15 })
          ? [
              {
                name: `Report_${format(current, 'MMM_yy')}.pdf`,
                size: faker.number.int({ min: 500000, max: 2000000 }),
              },
            ]
          : [],
      };
      dateEmails.push(email);
    }

    // Append to monthly file
    let existingMonthlyData = [];
    if (existsSync(monthlyFile)) {
      try {
        const buf = readFileSync(monthlyFile, 'utf8');
        existingMonthlyData = JSON.parse(buf);
      } catch (e) {
        existingMonthlyData = [];
      }
    }

    dateEmails.sort((a, b) => a.timestamp - b.timestamp);
    const allEmailsForMonth = [...existingMonthlyData, ...dateEmails];
    allEmailsForMonth.sort((a, b) => a.timestamp - b.timestamp);
    if (!existsSync(yearDirectory)) mkdirSync(yearDirectory, { recursive: true });
    writeFileSync(monthlyFile, JSON.stringify(allEmailsForMonth, null, 2), 'utf8');
    console.log(`Appended ${dateEmails.length} emails to ${monthlyFile} for ${format(current, 'yyyy-MM-dd')}`);

    current = addDays(current, 1);
  }

  console.log(`Finished! Full dataset generated in ${outputDirectory}/.`);
}

// 7. RUN
generateEmails(startDate, endDate);
