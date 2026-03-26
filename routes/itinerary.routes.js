const router = require('express').Router();
const Itinerary = require('../models/Itinerary.model');
const verifyToken = require('../middlewares/auth.middlewares');
const mongoose = require('mongoose');
const User = require('../models/User.model');

//* create itinerary
//! tested ok
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { title, points } = req.body; // "points" = array of city points with lat/lng/comment

    // create new itinerary linked to the logged-in user
    const newItinerary = await Itinerary.create({
      owner: req.payload._id, // the logged-in user becomes the owner
      title,
      points, // array of points
    });
    //* Update user's itineraries array (addToSet avoid duplicate)
    await User.findByIdAndUpdate(req.payload._id, {
      $addToSet: { itineraries: newItinerary._id },
    });

    res.status(201).json(newItinerary);
  } catch (error) {
    next(error);
  }
});

//* get all iti of logged-in user
//! tested ok
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const userItineraries = await Itinerary.find({ owner: req.payload._id });
    res.json(userItineraries);
  } catch (error) {
    next(error);
  }
});

//* get a specific iti
router.get('/:itineraryId', verifyToken, async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
      return res.status(400).json({ message: 'Invalid itinerary ID' });
    }

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(itinerary);
  } catch (error) {
    next(error);
  }
});

//* update itinerary
router.put('/:itineraryId', verifyToken, async (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { title, points } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
      return res.status(400).json({ message: 'Invalid itinerary ID' });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // check owner
    if (itinerary.owner.toString() !== req.payload._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // update fields
    if (title !== undefined) itinerary.title = title;
    if (points !== undefined) itinerary.points = points;

    await itinerary.save();

    res.json(itinerary);
  } catch (err) {
    next(err);
  }
});

//* share iti with another user
//! tested ok

router.put('/:itineraryId/share', verifyToken, async (req, res, next) => {
  try {
    const { targetUserId } = req.body;

    //* check iti id
    if (!mongoose.Types.ObjectId.isValid(req.params.itineraryId)) {
      return res.status(400).json({ errorMessage: 'Invalid itinerary ID' });
    }

    const itineraryToShare = await Itinerary.findById(req.params.itineraryId);
    if (!itineraryToShare) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    //* check if its connected user
    if (itineraryToShare.owner.toString() !== req.payload._id) {
      return res
        .status(403)
        .json({ message: 'Not authorized to share this itinerary' });
    }

    //* avoid deplicate
    await Itinerary.findByIdAndUpdate(
      req.params.itineraryId,
      { $addToSet: { sharedWith: targetUserId } },
      { new: true },
    );

    res.json({ message: 'Itinerary shared successfully' });
  } catch (error) {
    next(error);
  }
});

//* delete an itinerary
//! tested ok
router.delete('/:itineraryId', verifyToken, async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    // validate itinerary ID
    if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
      return res.status(400).json({ errorMessage: 'Invalid itinerary ID' });
    }

    // find the itinerary
    const itineraryToDelete = await Itinerary.findById(itineraryId);
    if (!itineraryToDelete) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // only the owner can delete
    if (itineraryToDelete.owner.toString() !== req.payload._id) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this itinerary' });
    }

    // delete the itinerary
    await Itinerary.findByIdAndDelete(itineraryId);

    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
