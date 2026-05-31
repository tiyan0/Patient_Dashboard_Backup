module.exports = {
  attributes: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string' },
    reason: { type: 'string', required: true },
    date: { type: 'string' },
    actionType: { type: 'string' },
    specialty: { type: 'string' },
    preselectedDoctor: { type: 'string' },
    user: { type: 'string' }
  },
};