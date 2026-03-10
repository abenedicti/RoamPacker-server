const router = require('express').Router();
const User = require('../models/User.model');
const verifyToken = require('../middlewares/auth.middlewares');
const fetchRandomUsers = require('../utils/fetchRandomUsers');
const mongoose = require('mongoose');

//! Recherche de matchs
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

    const matchedUsersList = []; //* to store real matches

    allUsers.forEach((user) => {
      let matchCount = 0;

      if (budget && user.budget <= budget) matchCount++;
      if (travelStyle && user.travelStyle === travelStyle) matchCount++;
      if (preferredCountry && user.preferredCountry === preferredCountry)
        matchCount++;
      if (
        interests?.length &&
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
      if (partyMood !== undefined && user.partyMood === partyMood) matchCount++;

      const totalCriteria = 8;
      const matchPercentage = Math.round((matchCount / totalCriteria) * 100);
      if (matchPercentage >= 50) {
        matchedUsersList.push(user); // push le user entier
      }
    });

    // add fake users
    const fakeUsersRaw = await fetchRandomUsers(10);
    const fakeUsers = fakeUsersRaw.map((u) => {
      const fakeId = new mongoose.Types.ObjectId();
      return new User({
        _id: fakeId,
        username: `${u.name.first} ${u.name.last}`,
        photoUrl: u.picture.large,
        interests: [u.nat],
        travelStyle: ['Relaxed', 'Adventure'][Math.floor(Math.random() * 2)],
        budget: Math.floor(Math.random() * 1000),
        startDate: new Date(),
        tripDuration: Math.floor(Math.random() * 14) + 1,
        favoriteFood: 'Pizza',
        preferredCountry: 'France',
        firstTrip: Math.random() < 0.5,
        partyMood: Math.random() < 0.5,
      });
    });

    // on renvoie tout pour frontend (mais on ne sauvegarde pas les fake users dans DB)
    res.json([...matchedUsersList, ...fakeUsers]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
