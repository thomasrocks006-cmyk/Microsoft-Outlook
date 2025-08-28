const { faker } = require('@faker-js/faker');
const { writeFileSync } = require('fs');
const { addDays, format, setHours, setMinutes, isWeekend, getWeekOfMonth } = require('date-fns');
const { fromZonedTime } = require('date-fns-tz');
const { v4: uuidv4 } = require('uuid');

// 1. CONFIGURATION - SMALL TEST RANGE
const timeZone = 'Australia/Melbourne';
const startDate = new Date('2023-04-24'); // Start of the test week
const endDate = new Date('2023-04-30');   // End of the test week
const outputFile = `./test_data_april_2023_week.json`; // Output file

// 2. DEFINE OUR USER - THOMAS FRANCIS
const user = {
  name: "Thomas Francis",
  email: "thomas.francis@jpmorgan.com"
};

// 3. DEFINE A SUBSET OF THE CAST FOR TESTING
const senders = [
  {
    name: 'Lyndon Fagan',
    email: 'lyndon.fagan@jpmorgan.com',
    role: 'Executive Director | Head of APAC Metals & Mining',
    type: 'internal',
    signature: `--\nLyndon Fagan\nExecutive Director | Head of APAC Metals & Mining Equity Research\nJ.P. Morgan Asset Management\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 9633 4000\n`
  },
  {
    name: 'Hannah Pham',
    email: 'hannah.pham@jpmorgan.com',
    role: 'Markets Analyst',
    type: 'internal',
    signature: `--\nHannah Pham\nMarkets Analyst | Asset Management\nJ.P. Morgan Asset Management\nMelbourne, Australia\nMobile: +61 4${faker.string.numeric(6)} ${faker.string.numeric(3)}\n`
  },
  {
    name: 'Al Harvey',
    email: 'al.harvey@jpmorgan.com',
    role: 'Mining Analyst | Equity Research',
    type: 'internal',
    signature: `--\nAl Harvey\nMining Analyst | Equity Research\nJ.P. Morgan\nSydney, Australia\n`
  },
  {
    name: 'Bloomberg Terminal',
    email: 'alerts@bloomberg.net',
    role: 'Market Data',
    type: 'external-vendor',
    signature: `--\nBloomberg Terminal Alert Service\nVisit: www.bloomberg.com/professional\n`
  },
  // New: Morning Brief sender (internal-brief)
  {
  name: 'J.P. Morgan Research',
  email: 'research@jpmorgan.com',
  role: 'Global Research',
    type: 'internal-brief',
  signature: `--\nJ.P. Morgan Research\nThis is an automated daily briefing.\nFor more information, please contact your representative.`
  },
  // New: Microsoft Teams alerts (internal-teams)
  {
    name: 'Microsoft Teams',
  email: 'no-reply@teams.microsoft.com',
  role: 'Notifications',
  type: 'external-teams',
  signature: `--\nThis message was sent from a notification-only address that cannot accept incoming email.\nPlease do not reply to this message.`
  },
  // New: Facilities emails (internal-facilities)
  {
  name: '101 Collins Facilities',
  email: 'facilities@101collins.com.au',
  role: 'Building Management',
  type: 'external-facilities',
  signature: `--\n101 Collins Facilities Management\nLevel 31, 101 Collins Street, Melbourne VIC 3000\nTel: +61 3 8636 5000`
  },
  // New: Executives (internal-allstaff)
  {
    name: 'Jamie Dimon',
    email: 'jamie.dimon@jpmorgan.com',
    role: 'Chairman and CEO',
    type: 'internal-allstaff',
    signature: `--\nJamie Dimon\nChairman and CEO\nJPMorgan Chase & Co.`
  },
  {
    name: 'Elaine Myers',
    email: 'elaine.myers@jpmorgan.com',
    role: 'CEO, Asia Pacific',
    type: 'internal-allstaff',
    signature: `--\nElaine Myers\nCEO, Asia Pacific\nJPMorgan Chase & Co.`
  },
  {
    name: 'Andrew Creber',
    email: 'andrew.creber@jpmorgan.com',
    role: 'CEO Australia & New Zealand',
    type: 'internal-allstaff',
    signature: `--\nAndrew Creber\nCEO Australia & New Zealand\nJ.P. Morgan`
  }
];

// 4. DEFINE EMAIL TEMPLATES (Original + new categories)
const templateStores = {
  internal: [
    (from, to, currentDate) => {
      const topics = ['BHP model', 'NPF report', 'QBE presentation', 'lithium sector deep dive'];
      const topic = faker.helpers.arrayElement(topics);
      return {
        subject: `Review of ${topic}`,
        body: `Hi ${to.name.split(' ')[0]},\n\nI've just finished the first draft of the ${topic}. Could you take a look?\n\nCheers,\n${from.name.split(' ')[0]}\n\n${from.signature}`
      };
    },
    (from, to, currentDate) => {
      return {
        subject: `Client Request Follow-up`,
        body: `Thomas,\n\nQuick reminder that ${faker.company.name()} needs a final sign-off. \n\nThanks,\n${from.name.split(' ')[0]}\n\n${from.signature}`
      };
    }
  ],
  'external-vendor': [
    (from, to, currentDate) => {
      const alerts = ['unusual options activity', 'analyst rating changes'];
      const stocks = ['BHP', 'RIO', 'FMG'];
      return {
        subject: `Alert: ${faker.helpers.arrayElement(stocks)} - ${faker.helpers.arrayElement(alerts)}`,
        body: `This is an automated alert from the Bloomberg Terminal.\n\nSecurity: ${faker.helpers.arrayElement(stocks)} AX Equity\nEvent: ${faker.helpers.arrayElement(alerts)} detected.\n\n${from.signature}`
      };
    }
  ],
  // New: Morning Briefs
  'internal-brief': [
    (from, to, currentDate) => {
      const marketTone = faker.helpers.arrayElement(['risk-off', 'risk-on', 'mixed', 'cautious']);
      const movers = ['USD strengthened', 'Oil futures dropped', 'Tech stocks rallied', 'Base metals were volatile'];
      const keyEvent = faker.helpers.arrayElement(['FOMC Minutes', 'AU Employment Data', 'China PMI', 'RBA Speech']);
      return {
        subject: `AM Brief: ${format(currentDate, 'EEE, d MMM yyyy')}`,
        body: `Good morning,\n\n**Overnight Market Summary:**\nThe tone was ${marketTone}. ${faker.helpers.arrayElement(movers)} amid concerns over ${faker.finance.currencyName()}.\n\n**Key Event Today:** ${keyEvent} at ${faker.number.int({min: 10, max: 15})}:00 AEST.\n\n**Key Reads for Today:**\n- JPM Research: ${faker.company.name()} ${faker.helpers.arrayElement(['downgraded', 'upgraded'])} to ${faker.helpers.arrayElement(['Overweight', 'Neutral'])}\n- Bloomberg: ${faker.lorem.sentence(8)}\n- AFR: ${faker.lorem.sentence(6)}\n\n--\nJ.P. Morgan Markets Desk\nThis is an automated daily briefing.`
      };
    }
  ],
  // New: Microsoft Teams alerts (external)
  'external-teams': [
    (from, to, currentDate) => {
      const people = ['Lyndon Fagan', 'Hannah Pham', 'Al Harvey', 'The Resources Team'];
      return {
        subject: `Missed call from ${faker.helpers.arrayElement(people)}`,
        body: `You missed a call.\n\n${faker.helpers.arrayElement(people)} tried to call you at ${faker.number.int({min: 9, max: 16})}:${faker.number.int({min: 10, max: 59})}.\n\n\n--\nMicrosoft Teams for J.P. Morgan\nThis is an automated message.`
      };
    },
    (from, to, currentDate) => {
      const meetingTitles = ['Q3 Performance Review', 'BHP Deep Dive', 'Client XYZ Investment Committee', 'Weekly Team Sync'];
      return {
        subject: `Reminder: "${faker.helpers.arrayElement(meetingTitles)}" starts in 15 minutes`,
        body: `This is a reminder for your upcoming meeting.\n\n--\nMicrosoft Teams for J.P. Morgan\nThis is an automated message.`
      };
    }
  ],
  // New: Facilities emails (external)
  'external-facilities': [
    (from, to, currentDate) => {
      return {
        subject: `Building Update: Fire Drill Scheduled`,
        body: `Dear Occupants of Level 31, 101 Collins Street,\n\nA scheduled fire drill will be conducted this ${faker.helpers.arrayElement(['Monday', 'Wednesday'])} morning between 10:00 AM - 11:00 AM. Please follow warden instructions.\n\nRegards,\nFacilities Team\n\n--\nJ.P. Morgan Asset Management | 101 Collins Street, Melbourne`
      };
    },
    (from, to, currentDate) => {
      return {
        subject: `Air Conditioning Maintenance Tonight`,
        body: `Please be advised that essential AHU maintenance will be performed after 7:00 PM tonight on Level 31. Some noise disruption may occur.\n\nApologies for any inconvenience.\n\n--\n101 Collins Facilities Team`
      };
    }
  ],
  // New: All-staff emails
  'internal-allstaff': [
    (from, to, currentDate) => {
      return {
        subject: `A note from ${from.name}`,
        body: `Dear colleagues,\n\n${faker.lorem.paragraphs(2)}\n\nI am consistently impressed with your dedication and want to thank you for your hard work during this ${faker.helpers.arrayElement(['period of market volatility', 'successful quarter', 'busy reporting season'])}.\n\nPlease continue to ${faker.helpers.arrayElement(['focus on our clients', 'uphold our first-class reputation', 'work together as one team'])}.\n\nBest,\n${from.name}\n\n--\n${from.name}\n${from.role}\nJ.P. Morgan`
      };
    }
  ]
};

// 5. FUNCTION TO GENERATE A REALISTIC TIMESTAMP FOR A GIVEN DAY (in AEST)
function generateTimestampForDate(date) {
  let hour;
  if (faker.datatype.boolean({ probability: 0.3 }) && !isWeekend(date)) {
    hour = faker.number.int({ min: 18, max: 21 });
  } else {
    hour = faker.number.int({ min: 8, max: 17 });
  }
  const minute = faker.number.int({ min: 0, max: 59 });
  let dateWithTime = setHours(date, hour);
  dateWithTime = setMinutes(dateWithTime, minute);
  // Convert local time in specified zone to UTC Date
  const utcDate = fromZonedTime(dateWithTime, timeZone);
  return utcDate.getTime();
}

// Helper to generate a specific local time (hour:minute) in the configured time zone
function generateTimestampAt(date, hour, minute) {
  let d = setHours(date, hour);
  d = setMinutes(d, minute);
  const utcDate = fromZonedTime(d, timeZone);
  return utcDate.getTime();
}

// 6. FUNCTION TO GET THE NUMBER OF EMAILS FOR A SPECIFIC DAY
function getEmailCountForDate(date) {
  const weekOfMonth = getWeekOfMonth(date);
  const isCrunchTime = weekOfMonth >= 4;

  if (isWeekend(date)) {
    if (isCrunchTime) {
      return faker.number.int({ min: 5, max: 10 }); // Smaller range for test
    } else {
      return faker.number.int({ min: 2, max: 5 });
    }
  } else {
    return faker.number.int({ min: 15, max: 25 }); // Smaller range for test
  }
}

// 7. MAIN FUNCTION TO GENERATE EMAILS FOR A DATE RANGE
function generateEmails(start, end) {
  const allEmails = [];
  let current = new Date(start);

  console.log('Starting TEST email generation...');
  
  while (current <= end) {
    const emailCount = getEmailCountForDate(current);
    const dateEmails = [];

    // Pre-scheduled: Morning Brief (weekdays only), exactly one
    if (!isWeekend(current)) {
      const briefSender = senders.find((s) => s.type === 'internal-brief');
      const briefTemplate = templateStores['internal-brief'][0];
      const { subject, body } = briefTemplate(briefSender, user, current);
      const minute = faker.number.int({ min: 30, max: 59 }); // ~6:30-6:59 AEST
      const briefTs = generateTimestampAt(current, 6, minute);
      dateEmails.push({
        id: uuidv4(),
        from: briefSender.email,
        fromName: briefSender.name,
        to: user.email,
        subject,
        body,
        timestamp: briefTs,
        isRead: faker.datatype.boolean({ probability: 0.4 }),
        isStarred: faker.datatype.boolean({ probability: 0.05 }),
        labels: [briefSender.type],
        attachments: []
      });
    }

    // Rare: All-staff (very low probability)
    const execSenders = senders.filter((s) => s.type === 'internal-allstaff');
    if (execSenders.length && faker.datatype.boolean({ probability: 0.001 })) {
      const exec = faker.helpers.arrayElement(execSenders);
      const tpl = faker.helpers.arrayElement(templateStores['internal-allstaff']);
      const { subject, body } = tpl(exec, user, current);
      const hour = faker.number.int({ min: 10, max: 15 });
      const minute = faker.number.int({ min: 0, max: 59 });
      const ts = generateTimestampAt(current, hour, minute);
      dateEmails.push({
        id: uuidv4(),
        from: exec.email,
        fromName: exec.name,
        to: user.email,
        subject,
        body,
        timestamp: ts,
        isRead: faker.datatype.boolean({ probability: 0.8 }),
        isStarred: faker.datatype.boolean({ probability: 0.2 }),
        labels: [exec.type],
        attachments: []
      });
    }

    // Remaining emails for the day (exclude special case senders from random pool)
    const scheduledCount = dateEmails.length;
    const remaining = Math.max(0, emailCount - scheduledCount);
    const generalSenders = senders.filter((s) => s.type !== 'internal-allstaff' && s.type !== 'internal-brief');

    for (let i = 0; i < remaining; i++) {
      const from = faker.helpers.arrayElement(generalSenders);
      const templateStore = templateStores[from.type];
      const template = faker.helpers.arrayElement(templateStore);
      const { subject, body } = template(from, user, current);

      const email = {
        id: uuidv4(),
        from: from.email,
        fromName: from.name,
        to: user.email,
        subject: subject,
        body: body,
        timestamp: generateTimestampForDate(current),
        isRead: faker.datatype.boolean({ probability: 0.7 }),
        isStarred: faker.datatype.boolean({ probability: 0.1 }),
        labels: [from.type],
        attachments: faker.datatype.boolean({ probability: 0.15 })
          ? [{ name: `Report_${format(current, 'MMM_yy')}.pdf`, size: faker.number.int({ min: 500000, max: 2000000 }) }]
          : []
      };
      dateEmails.push(email);
    }
  dateEmails.sort((a, b) => a.timestamp - b.timestamp);
    allEmails.push(...dateEmails);

    console.log(`Generated ${emailCount} emails for ${format(current, 'yyyy-MM-dd')}`);
    current = addDays(current, 1);
  }

  console.log(`Finished! Generated ${allEmails.length} total emails for the test week.`);
  return allEmails;
}

// 8. RUN THE GENERATION AND SAVE TO FILE
const testEmailData = generateEmails(startDate, endDate);
writeFileSync(outputFile, JSON.stringify(testEmailData, null, 2), 'utf8');
console.log(`Test data written to ${outputFile}`);
console.log('\n--- NEXT STEPS ---');
console.log('1. Move this file into your React Native project (e.g., /assets/data/).');
console.log('2. Import and load this data in your app to test integration.');
console.log('3. Verify your inbox list, email detail view, and functions work correctly.');
console.log('4. Once confirmed, we can generate the full dataset with chunking.');
