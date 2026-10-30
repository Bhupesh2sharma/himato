// Content of the /about page. Shared by pages/AboutPage.tsx (what visitors
// see) and scripts/seoPlugin.ts (the prerendered HTML crawlers read), so the
// two never drift apart. Plain data only — no DOM or Node APIs.

export const ABOUT = {
  title: 'About Himato',
  intro:
    "Himato is a Sikkim trip planner built by Waglogy. We built it after more than four years working with Sikkim's hospitality sector, alongside the hotels, homestays and travel agents who run trips here every day. We kept seeing the same problems on both sides of a booking, so Himato solves them for both: the travellers who come to Sikkim, and the local agents who host them.",

  problems: {
    heading: 'The problems we kept seeing',
    travellers: {
      heading: 'Travellers',
      points: [
        'Permit rules are confusing: Aadhaar isn’t accepted, Nathula closes on Mondays and Tuesdays, and foreign nationals can’t visit some places at all.',
        'Mountain drives take far longer than maps suggest, so plans fall apart on day one.',
        'Information online is often outdated or copied from other blogs.',
        'It’s hard to know which local agent to trust.',
      ],
    },
    agents: {
      heading: 'Travel agents',
      points: [
        'Hours spent writing itineraries by hand and sending them over WhatsApp.',
        'Chasing travellers for ID copies before every permit.',
        'Keeping track of drivers, vehicles and their papers across trips.',
        'Enquiries that never turn into bookings because the details are missing.',
      ],
    },
  },

  travellers: {
    heading: 'What Himato does for travellers',
    points: [
      { title: 'A day-by-day plan in about a minute', body: 'Realistic drive times, where you sleep each night, and the permits each stop needs. Free to use.' },
      { title: 'Guides written with local knowledge', body: 'Permits, best times, costs and routes, checked against current sources and dated, so you know how fresh they are.' },
      { title: 'Quotes from local agencies', body: 'Ask for quotes on your plan. Our team reviews every request and passes it to registered local agencies, including the ones you choose.' },
    ],
  },

  agents: {
    heading: 'What Himato does for travel agents',
    points: [
      { title: 'Itineraries in a minute, under your name', body: 'Build a plan, send it under your agency name, and see when the client opens or accepts it.' },
      { title: 'Traveller leads with the details', body: 'Trips from travellers who planned on Himato arrive with dates, group size and contact details, after our team reviews them.' },
      { title: 'Clients and permit papers in one place', body: 'Every customer, their trip dates and the ID copies you need for permits.' },
      { title: 'Drivers and vehicles', body: 'Your drivers and vehicles with licence and permit papers stored, so you know who is free for the next trip.' },
    ],
  },

  guides: {
    heading: 'How we write our guides',
    points: [
      'Our guides draw on what we learned working with Sikkim’s hotels, homestays and travel agents.',
      'Facts that change, such as permits, prices and road rules, are checked against current sources and local operators before we publish, and anything unconfirmed is marked as such.',
      'Every guide shows when it was last updated. Prices are approximate and labelled as such.',
      'Spotted something wrong? Email hello@himato.in and we’ll fix it.',
    ],
  },

  company: {
    heading: 'Who we are',
    body: 'Himato is a product of Waglogy (Tech Waglogy LLP).',
    waglogy: {
      website: 'https://waglogy.com/',
      linkedin: 'https://www.linkedin.com/company/waglogy',
      instagram: 'https://www.instagram.com/waglogy/',
    },
    email: 'hello@himato.in',
    phone: '+91 9733814168',
    instagram: 'https://www.instagram.com/himato_ai/',
  },
} as const;

export const ABOUT_DESCRIPTION =
  'Himato is a Sikkim trip planner by Waglogy, built after 4+ years working with Sikkim’s hospitality sector. Free day-by-day plans and permit info for travellers; itineraries, leads and client tools for local travel agents.';
