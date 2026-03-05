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
    favorites: [String],
    matches: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
