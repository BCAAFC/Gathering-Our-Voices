module.exports = {
  // The admins of the site, by email.
  'admins': [ 'andrew@hoverbear.org' ],
  // The dates of the conference
  'dates': {
    'start': new Date('March 21, 2017'),
    'end': new Date('March 24, 2017'),
  },
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
  // Various deadlines related to the conference.
  'deadlines': {
    'earlybird': new Date('February 7, 2017'),
    'facilitator': new Date('November 6, 2017'),
    'exhibitor': new Date('January 29, 2017'),
    'volunteer': new Date('February 29, 2017'),
  },
  // Prices of various involvements.
  'prices': {
    // Exhibitors are always the same price.
    'exhibitor': 400,
    // Delegates have two prices.
    'regular': 175,
    'earlybird': 125,
  },
}
