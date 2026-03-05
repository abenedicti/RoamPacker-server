const router = require('express').Router();
const Itinerary = require('../models/Itinerary.model');
const verifyToken = require('../middlewares/auth.middlewares');

//* create itinerary
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { title, destinations } = req.body;
    const itinerary = await Itinerary.create({
      creator: req.payload._id,
      title,
      destinations,
    });
    res.status(201).json(itinerary);
  } catch (error) {
    next(error);
  }
});

//* get all iti from the user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ creator: req.payload._id });
    res.json(itineraries);
  } catch (error) {
    next(error);
  }
});

//* to share iti with a user
router.put('/:itineraryId/share', verifyToken, async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.itineraryId,
      // add new value to the array without duplicates
      { $addToSet: { sharedWith: targetUserId } },
      { new: true },
    );
    res.json(itinerary);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
