module.exports = {
  // Websites
  'websites': {
    'host': 'http://bcaafc.com/',
    'cohost': 'http://www.vnfc.ca/'
  },
  // Social Media accounts
  'social': {
    'twitter': 'GOV_Conference',
    'facebook': 'gatheringourvoices',
    'list': 'https://bcaafc.us5.list-manage.com/subscribe?u=2df229be67a6e024a5c741916&id=f98ad81590',
  },
  // The admins of the site, by email.
  'admins': [ 'andrew@hoverbear.org' ],
  // The ages of attendees.
  'ages': {
    'Youth': {
      'youngest': 14,
      'oldest': 18,
    },
    'Young Adult': {
      'youngest': 18,
      'oldest': 24,
    },
    'Young Chaperone': {
      'youngest': 21,
      'oldest': 24,
    },
    'Chaperone': {
      'youngest': 24,
      'oldest': 125,
    },
  },
  // Prices of various involvements.
  'prices': {
    // Exhibitors are always the same price.
    'exhibitor': 500,
    // Delegates have two prices.
    'regular': 200,
    'earlybird': 150,
  },
  // The dates of the conference
  'dates': {
    'start': new Date('March 21, 2017'),
    'end': new Date('March 24, 2017'),
  },
  'notifications': {
    'workshopsToday': [ new Date('March 22, 2017 07:15'), new Date('March 23, 2017 07:30'), ],
  },
  // Various deadlines related to the conference.
  'deadlines': {
    'earlybird': new Date('February 7, 2017'),
    'facilitator': new Date('November 6, 2017'),
    'exhibitor': new Date('January 29, 2017'),
    'volunteer': new Date('February 29, 2017'),
    'payment': new Date('February 29, 2017'),
  }
}
