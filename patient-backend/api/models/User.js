module.exports = {
  attributes: {
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    gender: { type: 'string', required: true },
    dob: { type: 'string', required: true },
    address: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    bloodType: { type: 'string' },
    allergies: { type: 'string' },
    emergencyName: { type: 'string' },
    emergencyPhone: { type: 'string' },
    emergencyEmail: { type: 'string' },
    emergencyRelationship: { type: 'string' },
    profileImage: { type: 'string', columnType: 'longtext' }
    // Note: Sails automatically generates 'id', 'createdAt', and 'updatedAt' fields, 
    // so you don't need to manually define them here.
  },
};