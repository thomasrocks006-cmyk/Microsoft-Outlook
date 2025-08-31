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
const QUIET = process.env.QUIET === '1' || process.env.QUIET === 'true';
const LOG_EVERY = parseInt(process.env.LOG_EVERY || '25', 10); // Log progress every N days
const FORCE_REBUILD = process.env.FORCE_REBUILD === '1' || process.env.FORCE_REBUILD === 'true';
const SKIP_EXISTING_DAY = process.env.SKIP_EXISTING_DAY === '0' ? false : true; // default true
const CATERING_PROB = parseFloat(process.env.CATERING_PROB || '0.4');

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

// 3. DEFINE THE COMPLETE CAST (expanded)
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
  // Added: Paul Randall (internal)
  {
    name: 'Paul Randall',
    email: 'paul.randall@jpmorgan.com',
    role: 'Executive Director',
    type: 'internal',
    signature: `--\nPaul Randall\nExecutive Director | Asset Management\nJ.P. Morgan Asset Management\nSydney, Australia\nTel: +61 2 9003 8888\n`,
  },
  {
    name: 'Bloomberg Terminal',
    email: 'alerts@bloomberg.net',
    role: 'Market Data',
    type: 'external-vendor',
    signature: `--\nBloomberg Terminal Alert Service\nVisit: www.bloomberg.com/professional\n`,
  },
  // Updated: Facilities replaced with Nathan Penny (external-facilities)
  {
    name: 'Nathan Penny',
    email: 'nathan.penny@101collins.com.au',
    role: 'Building Manager, 101 Collins Street',
    type: 'external-facilities',
    signature:
      `--\nNathan Penny\nBuilding Manager\n101 Collins Street Management\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 8636 5000`,
  },
  // New: Catering sender (external-catering)
  {
    name: '101 Collins Catering',
    email: 'catering@101collins.com.au',
    role: 'Building Catering Services',
    type: 'external-catering',
    signature: `--\n101 Collins Catering\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 8636 5001\nMenu: https://catering.101collins.com.au`,
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
  // Compliance Office
  {
    name: 'Compliance Office',
    email: 'compliance.asia@jpmorgan.com',
    role: 'Asia Pacific Compliance',
    type: 'internal-compliance',
    signature: `--\nCompliance Office | Asia Pacific\nJ.P. Morgan`,
  },
  // Recruiter
  {
    name: 'James Robertson',
    email: 'james@selbyjennings.com',
    role: 'Senior Associate, Selby Jennings',
    type: 'external-recruiter',
    signature: `--\nJames Robertson\nSenior Associate\nSelby Jennings | Ph: ${faker.phone.number()}`,
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
  // New: IT Alerts sender (internal-it)
  {
    name: 'J.P. Morgan Technology',
    email: 'it.alerts.apac@jpmorgan.com',
    role: 'APAC Technology Operations',
    type: 'internal-it',
    signature: `--\nJ.P. Morgan Technology - APAC\nThis is an automated message. Do not reply.\nFor support, please contact the IT Service Desk.`,
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
    // Weekly look-ahead email (Fridays) with dynamic client instead of placeholder
    (from, to, currentDate) => {
      if (isFriday(currentDate)) {
        const client = faker.helpers.arrayElement(knownClients);
        return {
          subject: `Your Week Ahead`,
          body: `Hi ${to.name.split(' ')[0]},\n\nHere is a look at key meetings for the week of ${format(addDays(currentDate, 3), 'MMMM do')}:\n\n- Mon 10:00: Weekly Team Sync (Lyndon)\n- Tue 14:00: ${client} Review\n- Wed 09:00: BHP Production Call\n- Thu 16:00: Sector Deep Dive Prep\n- Fri 08:30: Performance Attribution\n\nLet me know if you need any prep materials.\n\nCheers,\n${faker.person.firstName()} (Executive Assistant)\n\n--\nJ.P. Morgan Asset Management`,
        };
      }
      return null;
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
  // UPDATED: Personalised Facilities templates (Nathan)
  'external-facilities': [
    (from, to, currentDate) => {
      return {
        subject: `Building Update: Scheduled Fire Drill`,
        body: `Dear Occupants,\n\nA scheduled fire drill will be conducted this ${faker.helpers.arrayElement(['Monday', 'Wednesday'])} morning between 10:00 AM - 11:00 AM. All building employees must participate.\n\nPlease follow instructions from your floor wardens. If you have any questions, please don't hesitate to reach out.\n\nKind regards,\n${from.name}\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      return {
        subject: `Important: Air Conditioning Maintenance Tonight`,
        body: `Please be advised that essential maintenance will be performed on the building's air conditioning system after 7:00 PM tonight. Some noise disruption may occur.\n\nWe appreciate your patience and apologise for any inconvenience caused.\n\nRegards,\n${from.name}\n\n${from.signature}`,
      };
    },
  ],
  // NEW: Catering templates
  'external-catering': [
    (from, to, currentDate) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const weekdayIndex = currentDate.getDay(); // 0=Sun
      const today = days[weekdayIndex - 1] || 'Monday';
      return {
        subject: `Lunch Menu - ${today} ${format(currentDate, 'do MMM')}`,
        body: `Good morning,\n\nToday's featured lunch options for 101 Collins are:\n\n- Main: ${faker.food.dish()}\n- Main: ${faker.food.dish()}\n- Salad: ${faker.food.dish()}\n- Soup: ${faker.food.dish()}\n\nPlease place your orders before 10:30 AM via the online portal.\n\nBon appétit,\nThe Catering Team\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      return {
        subject: `Reminder: Client Meeting Catering Order`,
        body: `Dear ${faker.helpers.arrayElement(['Occupant', 'Team'])},\n\nThis is a reminder that your catering order for a client meeting is confirmed for tomorrow at 11:00 AM.\n\nIf you need to make any changes or cancellations, please contact us immediately.\n\n${from.signature}`,
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
  // NEW: IT alerts (expanded: incident, maintenance, security update, phishing)
  'internal-it': [
    (from, to, currentDate) => {
      const systems = ['Email Gateway', 'Market Data Feed', 'VPN Cluster', 'File Storage Service'];
      return {
        subject: `Incident: Degraded Performance - ${faker.helpers.arrayElement(systems)}`,
        body: `Dear Users,\n\nWe are investigating reports of degraded performance affecting the ${faker.helpers.arrayElement(systems)}. Mitigation in progress. Next update in 30 minutes.\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => {
      const systems = ['Security Patch Deployment', 'Network Core Switch Maintenance', 'Database Failover Test'];
      return {
        subject: `Planned Maintenance: ${faker.helpers.arrayElement(systems)}`,
        body: `Notification: Planned maintenance will commence at ${faker.number.int({ min: 22, max: 23 })}:00 AEST tonight. Brief disruption possible.\n\n${from.signature}`,
      };
    },
    (from, to, currentDate) => ({
      subject: `Required: Mandatory Security Update for Bloomberg Terminal`,
      body: `Action Required.\n\nA critical security patch is available for your Bloomberg Terminal application. Please restart before EOD to apply this update or access may be suspended.\n\n${from.signature}`,
    }),
    (from, to, currentDate) => ({
      subject: `Phishing Alert: Fake Compliance Training Email`,
      body: `Security Alert.\n\nBe aware of a phishing campaign using a fake 'Compliance Training' email. Do not click links from 'jpmorgan.compliance.training@gmail.com'. If clicked, contact IT Security immediately.\n\n${from.signature}`,
    }),
  ],
  // NEW: Compliance reminders
  'internal-compliance': [
    (from, to, currentDate) => ({
      subject: `FINAL REMINDER: Annual Code of Conduct Certification`,
      body: `Final reminder: Your Annual Code of Conduct certification is overdue and must be completed by 5pm TODAY or access may be restricted.\n\n${from.signature}`,
    }),
  ],
  // NEW: Recruiter outreach
  'external-recruiter': [
    (from, to, currentDate) => ({
      subject: `Opportunity at Top-Tier Hedge Fund - Melbourne`,
      body: `Hi ${to.name.split(' ')[0]},\n\nYour profile stood out given your experience in metals & mining. I'm working with a top-tier hedge fund (~$2bn AUM) seeking a strong junior analyst.\n\nOpen to a confidential 10-minute call this week?\n\nBest,\n${from.name}\n\n${from.signature}`,
    }),
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
    return isCrunchTime ? faker.number.int({ min: 25, max: 40 }) : faker.number.int({ min: 5, max: 12 });
  }
  return faker.number.int({ min: 40, max: 60 });
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

    // Scheduled: Catering menu (approx probability on weekdays) before random generation
    if (!isWeekend(current)) {
      const cateringSender = senders.find((s) => s.type === 'external-catering');
      if (cateringSender && faker.datatype.boolean({ probability: CATERING_PROB })) {
        const cateringStore = templateStores['external-catering'];
        if (cateringStore && cateringStore.length) {
          const menuTemplate = cateringStore[0];
            const { subject, body } = menuTemplate(cateringSender, user, current);
            const ts = generateTimestampAt(current, 9, faker.number.int({ min: 0, max: 25 })); // ~9:00-9:25 AEST
            dateEmails.push({
              id: uuidv4(),
              from: cateringSender.email,
              fromName: cateringSender.name,
              to: user.email,
              subject,
              body,
              timestamp: ts,
              isRead: faker.datatype.boolean({ probability: 0.6 }),
              isStarred: false,
              labels: ['external-catering'],
              attachments: [],
            });
        }
      }
    }

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

    // Append to monthly file (optimized; avoid duplicate day)
    let existingMonthlyData = [];
    if (existsSync(monthlyFile) && !FORCE_REBUILD) {
      try {
        const buf = readFileSync(monthlyFile, 'utf8');
        existingMonthlyData = JSON.parse(buf);
      } catch (e) {
        existingMonthlyData = [];
      }
    } else if (FORCE_REBUILD && existsSync(monthlyFile)) {
      // Clear file content if forcing rebuild
      existingMonthlyData = [];
    }

    // Skip the day if emails for that date already exist (by UTC date) and skipping is enabled
    const dayKey = format(current, 'yyyy-MM-dd');
    if (SKIP_EXISTING_DAY && existingMonthlyData.length) {
      const existsForDay = existingMonthlyData.some((e) => format(new Date(e.timestamp), 'yyyy-MM-dd') === dayKey);
      if (existsForDay) {
        if (!QUIET) console.log(`Skip existing day ${dayKey} (monthly: ${month})`);
        current = addDays(current, 1);
        continue;
      }
    }

    dateEmails.sort((a, b) => a.timestamp - b.timestamp);
    let allEmailsForMonth;
    if (existingMonthlyData.length === 0) {
      allEmailsForMonth = dateEmails;
    } else {
      // If last existing timestamp <= first new timestamp, we can just append
      const lastExistingTs = existingMonthlyData[existingMonthlyData.length - 1].timestamp;
      const firstNewTs = dateEmails[0]?.timestamp ?? Number.MAX_SAFE_INTEGER;
      if (lastExistingTs <= firstNewTs) {
        allEmailsForMonth = [...existingMonthlyData, ...dateEmails];
      } else {
        allEmailsForMonth = [...existingMonthlyData, ...dateEmails];
        allEmailsForMonth.sort((a, b) => a.timestamp - b.timestamp);
      }
    }

    if (!existsSync(yearDirectory)) mkdirSync(yearDirectory, { recursive: true });
    const tmpFile = monthlyFile + '.tmp';
    writeFileSync(tmpFile, JSON.stringify(allEmailsForMonth, null, 2), 'utf8');
    // Atomic replace
    try { require('fs').renameSync(tmpFile, monthlyFile); } catch { /* fallback already written */ }
    if (!QUIET && ((dateEmails.length && !((current - startDate) / 86400000 % LOG_EVERY)) || LOG_EVERY === 1)) {
      console.log(`Appended ${dateEmails.length.toString().padStart(2)} emails -> ${month} for ${dayKey}`);
    }

    current = addDays(current, 1);
  }

  if (!QUIET) console.log(`Finished! Full dataset generated in ${outputDirectory}/.`);
  else console.log('DONE');
}

// 7. RUN
generateEmails(startDate, endDate);
