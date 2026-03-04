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
    budget: Number,
    firstTrip: Boolean,
    favorites: [String],
    itineraries: [{ type: Schema.Types.ObjectId, ref: 'Itinerary' }],
    //* matching preferences
    travelDate: Date,
    favoriteFood: String,
    preferredCountry: String,
    typeOfActivity: String,
    spokenLanguages: String,
  },
  {
    timestamps: true,
  },
);
const User = model('User', userSchema);
module.exports = User;
