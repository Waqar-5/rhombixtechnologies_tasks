require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Company = require('../models/Company');
const Category = require('../models/Category');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');

const categories = [
  { name: 'Engineering', icon: 'Code2' },
  { name: 'Design', icon: 'Palette' },
  { name: 'Product', icon: 'Boxes' },
  { name: 'Marketing', icon: 'Megaphone' },
  { name: 'Sales', icon: 'Handshake' },
  { name: 'Customer Support', icon: 'Headset' },
  { name: 'Data & Analytics', icon: 'BarChart3' },
  { name: 'Human Resources', icon: 'Users' }
];

const companySeed = [
  {
    name: 'Orbital Systems',
    tagline: 'Building the infrastructure layer for the next internet',
    description:
      'Orbital Systems designs distributed infrastructure and developer tooling used by thousands of engineering teams worldwide. We are remote-first and obsessed with developer experience.',
    industry: 'Cloud Infrastructure',
    companySize: '201-500',
    founded: 2016,
    website: 'https://orbitalsystems.example.com',
    headquarters: 'Austin, TX'
  },
  {
    name: 'Lumen Health',
    tagline: 'Modern healthcare, powered by data',
    description:
      'Lumen Health partners with clinics and hospital networks to modernize patient record systems and care coordination through secure, interoperable software.',
    industry: 'Healthcare Technology',
    companySize: '51-200',
    founded: 2019,
    website: 'https://lumenhealth.example.com',
    headquarters: 'Boston, MA'
  },
  {
    name: 'Fable Finance',
    tagline: 'Banking infrastructure for the next generation of fintechs',
    description:
      'Fable Finance provides embedded banking, card issuance, and compliance APIs that let companies launch financial products in weeks, not years.',
    industry: 'Fintech',
    companySize: '51-200',
    founded: 2020,
    website: 'https://fablefinance.example.com',
    headquarters: 'New York, NY'
  },
  {
    name: 'Verdant Studio',
    tagline: 'A design & product studio for climate-focused startups',
    description:
      'Verdant Studio is a boutique product studio partnering exclusively with early-stage climate tech companies to design and ship their first products.',
    industry: 'Design Agency',
    companySize: '11-50',
    founded: 2021,
    website: 'https://verdantstudio.example.com',
    headquarters: 'Remote'
  },
  {
    name: 'Northwind Retail',
    tagline: 'Omnichannel commerce for independent brands',
    description:
      'Northwind Retail builds the point-of-sale, inventory, and storefront tools that let independent retail brands compete with the giants.',
    industry: 'E-commerce',
    companySize: '201-500',
    founded: 2015,
    website: 'https://northwindretail.example.com',
    headquarters: 'Chicago, IL'
  }
];

const jobTitles = {
  Engineering: [
    'Senior Frontend Engineer (React)',
    'Backend Engineer, Node.js',
    'Full Stack MERN Developer',
    'DevOps Engineer',
    'Mobile Engineer, React Native',
    'Staff Software Engineer'
  ],
  Design: ['Senior Product Designer', 'UX Researcher', 'Brand Designer'],
  Product: ['Product Manager', 'Associate Product Manager', 'Technical Product Manager'],
  Marketing: ['Growth Marketing Manager', 'Content Marketing Lead', 'SEO Specialist'],
  Sales: ['Account Executive', 'Sales Development Representative', 'Customer Success Manager'],
  'Customer Support': ['Support Engineer', 'Customer Support Specialist'],
  'Data & Analytics': ['Data Analyst', 'Data Engineer', 'Analytics Engineer'],
  'Human Resources': ['Technical Recruiter', 'People Operations Manager']
};

const skillPool = [
  'React',
  'Node.js',
  'MongoDB',
  'Express',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'GraphQL',
  'Docker',
  'AWS',
  'Figma',
  'SQL',
  'Python',
  'REST APIs',
  'Redux',
  'Next.js'
];

const randomFrom = (arr, count = 1) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async ({ destroy = false } = {}) => {
  await Promise.all([
    User.deleteMany(),
    Company.deleteMany(),
    Category.deleteMany(),
    Job.deleteMany(),
    Application.deleteMany(),
    SavedJob.deleteMany(),
    Notification.deleteMany()
  ]);

  if (destroy) {
    console.log('Database cleared (--destroy flag set).');
    return { destroyed: true };
  }

  console.log('Seeding categories...');
  const createdCategories = await Category.insertMany(categories);
  const categoryMap = createdCategories.reduce((acc, c) => ({ ...acc, [c.name]: c }), {});

  console.log('Seeding recruiters + companies...');
  const recruiters = [];
  const companiesCreated = [];

  for (let i = 0; i < companySeed.length; i += 1) {
    const c = companySeed[i];
    const recruiter = await User.create({
      name: `${c.name.split(' ')[0]} Recruiting`,
      email: `recruiter${i + 1}@${c.name.toLowerCase().replace(/[^a-z]/g, '')}.demo`,
      password: 'Password123!',
      role: 'recruiter',
      headline: `Talent Partner at ${c.name}`,
      location: c.headquarters,
      isEmailVerified: true
    });

    const company = await Company.create({ ...c, owner: recruiter._id });
    recruiter.company = company._id;
    await recruiter.save();

    recruiters.push(recruiter);
    companiesCreated.push(company);
  }

  console.log('Seeding jobseekers...');
  const seekerNames = [
    'Amara Chen',
    'Diego Alvarez',
    'Priya Nair',
    'Ethan Walsh',
    'Fatima Rahman',
    'Lucas Meyer',
    'Sofia Romano',
    'Kwame Boateng',
    'Nadia Petrova',
    'Ravi Iyer'
  ];

  const jobseekers = [];
  for (let i = 0; i < seekerNames.length; i += 1) {
    const name = seekerNames[i];
    const seeker = await User.create({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@demo.dev`,
      password: 'Password123!',
      role: 'jobseeker',
      headline: randomFrom(['Frontend Developer', 'Full Stack Engineer', 'Product Designer', 'Data Analyst'])[0],
      location: randomFrom(['Remote', 'New York, NY', 'Austin, TX', 'Berlin, DE', 'Lahore, PK'])[0],
      skills: randomFrom(skillPool, randomInt(4, 7)),
      resume: {
        url: '/uploads/resumes/sample-resume.pdf',
        filename: 'sample-resume.pdf',
        originalName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
        uploadedAt: new Date()
      },
      isEmailVerified: true
    });
    jobseekers.push(seeker);
  }

  console.log('Seeding jobs...');
  const jobsCreated = [];
  const workModes = ['on-site', 'remote', 'hybrid'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
  const levels = ['entry', 'junior', 'mid', 'senior', 'lead'];

  for (let i = 0; i < recruiters.length; i += 1) {
    const recruiter = recruiters[i];
    const company = companiesCreated[i];
    const categoryNames = Object.keys(jobTitles);

    for (let j = 0; j < 4; j += 1) {
      const categoryName = randomFrom(categoryNames)[0];
      const title = randomFrom(jobTitles[categoryName])[0];
      const min = randomInt(4, 12) * 1000;

      const job = await Job.create({
        title,
        company: company._id,
        recruiter: recruiter._id,
        category: categoryMap[categoryName]._id,
        description:
          `${company.name} is looking for a ${title} to join our team. You will collaborate closely with product, design, and engineering to ship features that matter to thousands of users. We value ownership, clear communication, and a bias toward shipping.`,
        responsibilities: [
          'Own features end-to-end from design through deployment',
          'Collaborate with cross-functional partners in product and design',
          'Write clean, tested, maintainable code',
          'Participate in code reviews and technical planning'
        ],
        requirements: [
          `${randomInt(1, 6)}+ years of relevant experience`,
          'Strong communication skills',
          'Comfortable working in a fast-paced, remote-friendly environment'
        ],
        niceToHave: ['Experience at an early-stage startup', 'Open source contributions'],
        skills: randomFrom(skillPool, randomInt(3, 6)),
        jobType: randomFrom(jobTypes)[0],
        workMode: randomFrom(workModes)[0],
        experienceLevel: randomFrom(levels)[0],
        location: company.headquarters,
        salary: { min, max: min + randomInt(2, 6) * 1000, currency: 'USD', isPublic: true },
        vacancies: randomInt(1, 3),
        applicationDeadline: new Date(Date.now() + randomInt(15, 60) * 24 * 60 * 60 * 1000),
        status: 'open',
        isFeatured: j === 0
      });
      jobsCreated.push(job);
    }
  }

  console.log('Seeding applications...');
  for (const seeker of jobseekers) {
    const applyTo = randomFrom(jobsCreated, randomInt(1, 3));
    for (const job of applyTo) {
      try {
        const application = await Application.create({
          job: job._id,
          applicant: seeker._id,
          company: job.company,
          resumeSnapshot: {
            url: seeker.resume.url,
            filename: seeker.resume.filename,
            originalName: seeker.resume.originalName
          },
          coverNote: `I'm excited about the opportunity to contribute to ${job.title} — my background lines up well with what you're looking for.`,
          status: randomFrom(['applied', 'in-review', 'shortlisted', 'interview'])[0]
        });
        job.applicationsCount += 1;
        await job.save();

        await Notification.create({
          recipient: job.recruiter,
          type: 'application_received',
          title: 'New application received',
          message: `${seeker.name} applied for ${job.title}`,
          link: `/recruiter/jobs/${job._id}/applicants`,
          relatedJob: job._id,
          relatedApplication: application._id
        });
      } catch (error) {
        // Skip duplicate (same seeker + job) pairs from the random draw
      }
    }
  }

  console.log('Seeding saved jobs...');
  for (const seeker of jobseekers) {
    const saveTo = randomFrom(jobsCreated, randomInt(0, 3));
    for (const job of saveTo) {
      try {
        await SavedJob.create({ user: seeker._id, job: job._id });
      } catch (error) {
        // Skip duplicates
      }
    }
  }

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log('Demo recruiter login: recruiter1@orbitalsystems.demo / Password123!');
  console.log(`Demo jobseeker login: ${jobseekers[0].email} / Password123!`);
  console.log('----------------------------------------\n');

  return { destroyed: false, jobseekerCount: jobseekers.length };
};

// CLI entry point: `npm run seed` or `npm run seed:destroy`.
// Running this file directly connects, seeds, then disconnects and exits.
// When imported elsewhere (e.g. server.js auto-seed on boot), only
// seedDatabase() is used and the caller controls the connection lifecycle.
if (require.main === module) {
  (async () => {
    require('dotenv').config();
    await connectDB();
    try {
      await seedDatabase({ destroy: process.argv.includes('--destroy') });
    } catch (error) {
      console.error('Seed failed:', error);
      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
      process.exit(process.exitCode || 0);
    }
  })();
}

module.exports = seedDatabase;
