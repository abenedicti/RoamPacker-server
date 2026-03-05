// routes/utils.routes.js
const express = require('express');
const router = express.Router();
const fetchRandomUsers = require('../utils/fetchRandomUsers');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

//* Create random users
router.post('/generate-users', async (req, res, next) => {
  try {
    const numberOfUsers = req.body.number || 10;
    const randomUsers = await fetchRandomUsers(numberOfUsers);

    // to map toward User Model
    const usersForMatch = randomUsers.map((randomUser) => ({
      email: randomUser.email,
      username: `${randomUser.name.first}_${randomUser.name.last}`,
      password: bcrypt.hashSync('Password123!', 10), // here for testing
      // add the other fields later
    }));

    //* to save users in database
    const createdUsers = await User.insertMany(usersForMatch);

    res.status(201).json({
      message: `${createdUsers.length} users created successfully!`,
      users: createdUsers,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
