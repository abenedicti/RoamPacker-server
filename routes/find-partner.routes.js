const router = require('express').Router();
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');

router.post('/find-partner', verifyToken, async (req, res, next) => {
  try {
    const {
      budget,
      interests,
      travelStyle,
      travelDate,
      favoriteFood,
      preferredCountry,
      firstTrip,
      partyMood,
    } = req.body;

    const currentUserId = req.payload._id;

    //* fetch all user but userself
    const allUsers = await User.find({ _id: { $ne: currentUserId } });

    //* filter by criterias
    const matchedUsers = allUsers.filter((user) => {
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
        travelDate &&
        user.travelDate &&
        new Date(user.travelDate).toDateString() ===
          new Date(travelDate).toDateString()
      )
        matchCount++;
      if (favoriteFood && user.favoriteFood === favoriteFood) matchCount++;
      if (firstTrip !== undefined && user.firstTrip === firstTrip) matchCount++;
      if (partyMood && user.partyMood === partyMood) matchCount++;

      const totalCriteria = 8;
      const matchPercentage = Math.round((matchCount / totalCriteria) * 100);
      //* min 4 commun criterias to consider the match = 50%
      if (matchPercentage >= 50) {
        //! to be sent to frontend
        const simpleUser = {
          id: user._id,
          username: user.username,
          budget: user.budget,
          interests: user.interests,
          travelStyle: user.travelStyle,
          travelDate: user.travelDate,
          favoriteFood: user.favoriteFood,
          preferredCountry: user.preferredCountry,
          firstTrip: user.firstTrip,
          partyMood: user.partyMood,
          matchPercentage: matchPercentage,
        };
        matchedUsers.push(simpleUser);
      }
    });

    res.json(matchedUsers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
