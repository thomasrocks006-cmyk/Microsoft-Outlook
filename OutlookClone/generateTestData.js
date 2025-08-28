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
  }
];

// 4. DEFINE EMAIL TEMPLATES (Same as before)
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

    for (let i = 0; i < emailCount; i++) {
      const from = faker.helpers.arrayElement(senders);
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
