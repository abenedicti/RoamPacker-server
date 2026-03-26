const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');

//* get all favorites for the logged user
router.get('/favorites', verifyToken, async (req, res, next) => {
  try {
    console.log('Fetching favorites for:', req.payload._id);
    const user = await User.findById(req.payload._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.favorites);
  } catch (error) {
    next(error);
  }
});

//* toggle favorite (add or remove)
router.put('/favorites/toggle', verifyToken, async (req, res, next) => {
  try {
    const { xid, name, city, country, kind, rate } = req.body;

    const user = await User.findById(req.payload._id);

    const existingFavorite = user.favorites.find((fav) => fav.xid === xid);

    if (existingFavorite) {
      //* remove favorite
      user.favorites = user.favorites.filter((fav) => fav.xid !== xid);
    } else {
      //* add favorite
      user.favorites.push({
        xid,
        name,
        city,
        country,
        kind,
        rate,
      });
    }

    await user.save();

    res.json(user.favorites);
  } catch (error) {
    next(error);
  }
});

//* get current user
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

//* get user profile
//! tested ok
router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('itineraries')
      .populate('matches', 'username email');

    res.json(user);
  } catch (error) {
    next(error);
  }
});

//* update user profile
//! tested ok
router.put('/:userId', verifyToken, async (req, res, next) => {
  try {
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

    if (!user) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    next(error);
  }
});
// GET /users/:userId/public
router.get('/:userId/public', verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ errorMessage: 'Invalid user ID' });
    }

    const user = await User.findById(userId).select(
      'username age gender nationality aboutMe photoUrl countryOfResidence',
    );

    if (!user) return res.status(404).json({ errorMessage: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
