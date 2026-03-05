const router = require('express').Router();
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');

//! tested ok
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const {
      budget,
      interests,
      travelStyle,
      startDate,
      tripDuration,
      favoriteFood,
      preferredCountry,
      firstTrip,
      partyMood,
    } = req.body;

    const currentUserId = req.payload._id;

    //* fetch all users except the current user
    const allUsers = await User.find({ _id: { $ne: currentUserId } });

    const matchedUsersList = []; // to store matched users

    allUsers.forEach((user) => {
      let matchCount = 0;

      if (budget && user.budget <= budget) matchCount++;
      if (travelStyle && user.travelStyle === travelStyle) matchCount++;
      if (preferredCountry && user.preferredCountry === preferredCountry)
        matchCount++;
      if (
        interests &&
        interests.length &&
        user.interests.some((i) => interests.includes(i))
      )
        matchCount++;
      if (
        startDate &&
        user.startDate &&
        new Date(user.startDate).toDateString() ===
          new Date(startDate).toDateString()
      )
        matchCount++;

      if (tripDuration && user.tripDuration === tripDuration) matchCount++;

      if (favoriteFood && user.favoriteFood === favoriteFood) matchCount++;

      if (firstTrip !== undefined && user.firstTrip === firstTrip) matchCount++;
      if (partyMood && user.partyMood === partyMood) matchCount++;

      const totalCriteria = 8;
      const matchPercentage = Math.round((matchCount / totalCriteria) * 100);

      //* min 4 common criteria to consider the match (50%)
      if (matchPercentage >= 50) {
        matchedUsersList.push({
          id: user._id,
          username: user.username,
          budget: user.budget,
          interests: user.interests,
          travelStyle: user.travelStyle,
          startDate: user.startDate,
          tripDuration: user.tripDuration,
          favoriteFood: user.favoriteFood,
          preferredCountry: user.preferredCountry,
          firstTrip: user.firstTrip,
          partyMood: user.partyMood,
          matchPercentage,
        });
      }
    });

    res.json(matchedUsersList);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
