module.exports = {
  attributes: {
    name: { type: 'string', required: true },
    subtitle: { type: 'string' },
    prescriber: { type: 'string' },
    since: { type: 'string' },
    daysRemaining: { type: 'number' },
    totalDays: { type: 'number' },
    nextRefill: { type: 'string' },
    status: { type: 'string' },
    color: { type: 'string' },
    icon: { type: 'string' },
    user: { type: 'string' }
  },
};