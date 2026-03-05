const router = require('express').Router();
const Match = require('../models/Match.model');
const verifyToken = require('../middlewares/auth.middlewares');

//* match between 2 users
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { otherUserId } = req.body;

    const existing = await Match.findOne({
      users: { $all: [req.payload._id, otherUserId] },
    });

    if (existing)
      return res.status(400).json({ message: 'Match already exists' });

    const newMatch = await Match.create({
      users: [req.payload._id, otherUserId],
    });

    res.status(201).json(newMatch);
  } catch (error) {
    next(error);
  }
});

//* get all matches
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const matches = await Match.find({ users: req.payload._id }).populate(
      'users',
      'username email',
    );
    res.json(matches);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
