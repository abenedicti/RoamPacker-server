const router = require('express').Router();
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');
const fetchRandomUsers = require('../utils/fetchRandomUsers');

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

    allUsers.forEach(async (user) => {
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
        //* save match in user
        await User.findByIdAndUpdate(currentUserId, {
          $addToSet: { matches: user._id },
        });

        await User.findByIdAndUpdate(user._id, {
          $addToSet: { matches: currentUserId },
        });
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

    // add fake users
    const fakeUsersRaw = await fetchRandomUsers(10);
    const fakeUsers = fakeUsersRaw.map((u, i) => ({
      id: `fake-${i}`,
      username: `${u.name.first} ${u.name.last}`,
      photoUrl: '', // ou url placeholder
      interests: [u.nat],
      travelStyle: ['Relaxed', 'Adventure'][Math.floor(Math.random() * 2)],
      budget: Math.floor(Math.random() * 1000),
      startDate: new Date(),
      tripDuration: Math.floor(Math.random() * 14) + 1,
      favoriteFood: 'Pizza',
      preferredCountry: 'France',
      firstTrip: Math.random() < 0.5,
      partyMood: Math.random() < 0.5,
      matchPercentage: Math.floor(Math.random() * 50) + 50,
    }));

    res.json([...matchedUsersList, ...fakeUsers]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
