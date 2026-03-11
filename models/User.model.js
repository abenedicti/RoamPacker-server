const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    username: String,
    nationality: String,
    age: Number,
    gender: String,
    countryOfResidence: String,
    aboutMe: String,
    spokenLanguages: String,
    photoUrl: String,
    favorites: [
      {
        xid: String, //* OpenTripMap id
        name: String,
        city: String,
        country: String,
        kind: String,
        rate: Number,
      },
    ],
    matches: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedMatchedUsers: [
      {
        _id: String,
        username: String,
        photoUrl: String,
        interests: [String],
        travelStyle: String,
        budget: Number,
        startDate: Date,
        tripDuration: Number,
        favoriteFood: String,
        preferredCountry: String,
        firstTrip: Boolean,
        partyMood: Boolean,
        aboutMe: String,
        spokenLanguages: String,
        matchPercentage: Number,
      },
    ],
    itineraries: [{ type: Schema.Types.ObjectId, ref: 'Itinerary' }],
    //* matching preferences
    firstTrip: Boolean,
    partyMood: Boolean,
    budget: Number,
    interests: [String],
    travelStyle: String,
    startDate: Date,
    tripDuration: Number,
    favoriteFood: String,
    preferredCountry: String,
  },
  {
    timestamps: true,
  },
);
const User = model('User', userSchema);
module.exports = User;
