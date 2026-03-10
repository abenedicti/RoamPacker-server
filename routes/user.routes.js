const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');

//* get user profile
//! tested ok
router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('itineraries') // get full iti
      .populate('matches', 'username email')
      .populate('savedMatchedUsers', 'username photoUrl');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

//* update user profile
//! tested ok
router.put('/:userId', verifyToken, async (req, res, next) => {
  try {
    //* to avoid a user to modify another profil
    if (req.params.userId !== req.payload._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
//* delete user profile
//! tested ok
router.delete('/:userId', verifyToken, async (req, res, next) => {
  try {
    if (req.params.userId !== req.payload._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    // to check if the user exists in the DB
    if (!user) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
