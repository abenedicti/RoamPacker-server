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

    //*save search criteria
    await User.findByIdAndUpdate(currentUserId, {
      matchingCriteria: {
        budget,
        interests: Array.isArray(interests)
          ? interests
          : interests?.length
            ? interests.split(',').map((i) => i.trim())
            : [],
        travelStyle,
        startDate,
        tripDuration,
        favoriteFood,
        preferredCountry,
        firstTrip,
        partyMood,
      },
    });

    //* fetch all users except the current user
    const allUsers = await User.find({
      _id: { $ne: currentUserId },
    });

    const matchedUsersList = []; //* to store real matches

    allUsers.forEach((user) => {
      const criteria = user.matchingCriteria;
      if (!criteria) return; // skip users with no saved criteria

      let matchCount = 0;
      if (criteria.budget && criteria.budget <= budget) matchCount++;
      if (criteria.travelStyle && criteria.travelStyle === travelStyle)
        matchCount++;
      if (
        criteria.preferredCountry &&
        criteria.preferredCountry === preferredCountry
      )
        matchCount++;
      if (
        criteria.interests?.length &&
        interests?.length &&
        criteria.interests.some((i) => interests.includes(i))
      )
        matchCount++;
      if (
        criteria.startDate &&
        startDate &&
        new Date(criteria.startDate).toDateString() ===
          new Date(startDate).toDateString()
      )
        matchCount++;
      if (criteria.tripDuration && criteria.tripDuration === tripDuration)
        matchCount++;
      if (criteria.favoriteFood && criteria.favoriteFood === favoriteFood)
        matchCount++;
      if (criteria.firstTrip !== undefined && criteria.firstTrip === firstTrip)
        matchCount++;
      if (criteria.partyMood !== undefined && criteria.partyMood === partyMood)
        matchCount++;

      const totalCriteria = 8;
      const matchPercentage = Math.round((matchCount / totalCriteria) * 100);

      if (matchPercentage >= 50) {
        matchedUsersList.push({
          ...user.toObject(),
          matchPercentage,
          budget: criteria.budget,
          interests: criteria.interests,
          travelStyle: criteria.travelStyle,
          startDate: criteria.startDate,
          tripDuration: criteria.tripDuration,
          favoriteFood: criteria.favoriteFood,
          preferredCountry: criteria.preferredCountry,
          firstTrip: criteria.firstTrip,
          partyMood: criteria.partyMood,
        });
      }
    });

    //* Add isFake = false for real users
    matchedUsersList.forEach((u) => {
      u.isFake = false;
    });

    //* add fake users
    const interestsPool = [
      'Hiking',
      'Food',
      'Museums',
      'Beach',
      'Nightlife',
      'Photography',
      'Road trips',
      'Culture',
      'Nature',
      'Shopping',
    ];
    const travelStyles = [
      'Adventure',
      'Relaxed',
      'Backpacking',
      'Luxury',
      'Cultural',
      'Road Trip',
    ];
    const fakeUsersRaw = await fetchRandomUsers(10);
    const fakeUsers = fakeUsersRaw.map((u) => {
      const fakeId = new mongoose.Types.ObjectId();
      return {
        _id: fakeId,
        username: `${u.name.first} ${u.name.last}`,
        photoUrl: u.picture.large,
        interests: [
          interestsPool[Math.floor(Math.random() * interestsPool.length)],
          interestsPool[Math.floor(Math.random() * interestsPool.length)],
        ],
        travelStyle:
          travelStyles[Math.floor(Math.random() * travelStyles.length)],
        budget: Math.floor(Math.random() * 1000),
        startDate: new Date(),
        tripDuration: Math.floor(Math.random() * 14) + 1,
        favoriteFood: 'Pizza',
        preferredCountry: 'France',
        firstTrip: Math.random() < 0.5,
        partyMood: Math.random() < 0.5,
        matchPercentage: Math.floor(Math.random() * 50) + 50,
        isFake: true, //* flag fake users
      };
    });

    console.log(
      'Real matched users:',
      matchedUsersList.map((u) => u.username),
    );

    res.json([...matchedUsersList, ...fakeUsers]);
  } catch (error) {
    console.error('Error in find-match route:', error);
    next(error);
  }
});

module.exports = router;
