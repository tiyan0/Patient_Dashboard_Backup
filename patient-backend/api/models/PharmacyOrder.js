module.exports = {
  attributes: {
    orderId: { type: 'string', required: true },
    date: { type: 'string' },
    status: { type: 'string' },
    statusColor: { type: 'string' },
    items: { type: 'json' },
    deliveryTitle: { type: 'string' },
    deliveryText: { type: 'string' },
    total: { type: 'string' },
    buttons: { type: 'json' },
    user: { type: 'string' }
  },
};