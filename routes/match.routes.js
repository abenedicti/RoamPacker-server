const router = require('express').Router();
const Match = require('../models/Match.model');
const verifyToken = require('../middlewares/auth.middlewares');
const mongoose = require('mongoose');
const User = require('../models/User.model');

//* match between 2 users
//! tested ok
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { otherUserId } = req.body;

    const existingMatch = await Match.findOne({
      users: { $all: [req.payload._id, otherUserId] },
    });

    if (existingMatch)
      return res.status(400).json({ message: 'Match already exists' });

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ errorMessage: 'Invalid user ID' });
    }

    // create match
    const newMatch = await Match.create({
      users: [req.payload._id, otherUserId],
    });
    //* Update both users' matches array (addToSet avoid duplicate)
    await User.findByIdAndUpdate(req.payload._id, {
      $addToSet: { matches: otherUserId },
    });
    //* also add the match to the other user
    await User.findByIdAndUpdate(otherUserId, {
      $addToSet: { matches: req.payload._id },
    });

    res.status(201).json(newMatch);
  } catch (error) {
    next(error);
  }
});

//* get all matches
//! tested ok
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const matches = await Match.find({ users: req.payload._id })
      .populate('users', 'username email')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    next(error);
  }
});

// POST /api/matches/save
router.post('/save', verifyToken, async (req, res, next) => {
  try {
    const { match } = req.body;

    if (!match || !match.username) {
      return res.status(400).json({ errorMessage: 'Match data is required' });
    }

    //* add all object in savedMatchedUsers
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { $push: { savedMatchedUsers: match } }, //push full obj
      { new: true },
    );

    res.status(200).json(updatedUser.savedMatchedUsers);
  } catch (err) {
    console.error('Error saving match:', err);
    next(err);
  }
});

// DELETE /matches/:matchId
router.delete('/:matchId', verifyToken, async (req, res, next) => {
  try {
    const { matchId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { $pull: { savedMatchedUsers: { _id: matchId } } }, // supprime l'objet avec ce _id
      { new: true },
    );

    res.status(200).json(updatedUser.savedMatchedUsers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
