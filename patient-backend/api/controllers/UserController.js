module.exports = {
  login: async function (req, res) {
    try {
      // Extract payload
      const payload = req.body || {};
      const clientEmail = payload.email;
      const clientPass = payload.password;

      const hasMissingFields = !clientEmail || !clientPass;
      if (hasMissingFields) {
        return res.status(400).send({ error: 'Both email and password fields must be populated.' });
      }

      // Database lookup
      const foundAccount = await User.findOne({ email: clientEmail });
      
      // Verification
      if (!foundAccount) {
        return res.status(404).send({ error: 'Account lookup failed. Email not recognized.' });
      }

      const isMatch = foundAccount.password === clientPass;
      if (!isMatch) {
        return res.status(401).send({ error: 'Authentication failed due to incorrect password.' });
      }

      return res.status(200).send({ message: 'Successfully authenticated', user: foundAccount });
    } catch (err) {

      
      return res.status(500).send({ error: 'Internal system error', details: String(err) });
    }
  },

  register: async function (req, res) {
    try {
      const clientEmail = req.body?.email;
      const duplicateCheck = await User.findOne({ email: clientEmail });
      
      if (duplicateCheck) {
        return res.status(409).send({ error: 'The provided email is already registered to an account.' });
      }

      const newlyCreatedAccount = await User.create(req.body).fetch();
      return res.status(201).send(newlyCreatedAccount);
    } catch (err) {

      console.log("REAL REGISTRATION ERROR: ", err); 
      return res.status(500).send({ error: 'System error during registration', details: String(err) });
    }
  },

  updateProfile: async function (req, res) {
    try {
      const userId = req.params.id;
      if (!userId) return res.status(400).send({ error: 'User ID is required' });
      
      // Check if user is attempting to change their password
      if (req.body.password) {
        if (!req.body.currentPassword) {
          return res.status(400).send({ error: 'Current password is required to set a new password.' });
        }
        const existingUser = await User.findOne({ id: userId });
        if (!existingUser) return res.status(404).send({ error: 'User not found' });
        
        if (existingUser.password !== req.body.currentPassword) {
          return res.status(401).send({ error: 'Incorrect current password. Update denied.' });
        }
      }

      // Remove currentPassword from the payload so we don't save it to the DB
      const updatePayload = { ...req.body };
      delete updatePayload.currentPassword;

      const updatedUser = await User.updateOne({ id: userId }).set(updatePayload);
      if (!updatedUser) return res.status(404).send({ error: 'User not found' });
      
      return res.status(200).send(updatedUser);
    } catch (err) {
      return res.status(500).send({ error: 'System error during update', details: String(err) });
    }
  },

  getUser: async function (req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        const allUsers = await User.find();
        return res.status(200).send(allUsers);
      }
      
      const userRecord = await User.findOne({ id: userId });
      if (!userRecord) return res.status(404).send({ error: 'User not found' });
      
      return res.status(200).send(userRecord);
    } catch (err) {
      return res.status(500).send({ error: 'System error fetching user', details: String(err) });
    }
  }
};