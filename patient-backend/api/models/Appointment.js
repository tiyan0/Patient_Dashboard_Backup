module.exports = {
  attributes: {
    doctor: { type: 'string', required: true },
    specialty: { type: 'string' },
    status: { type: 'string', defaultsTo: 'Pending' },
    date: { type: 'string', required: true },
    time: { type: 'string' },
    type: { type: 'string' },
    color: { type: 'string' },
    chiefComplaint: { type: 'string' },
    user: { type: 'string' }
  },
};