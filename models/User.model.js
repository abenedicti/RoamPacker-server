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
    // matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // itineraries: [{ type: Schema.Types.ObjectId, ref: 'Itinerary' }],
    //* matching preferences
    interests: [String],
    travelStyle: String,
    travelDate: Date,
    favoriteFood: String,
    preferredCountry: String,
    spokenLanguages: String,
  },
  {
    timestamps: true,
  },
);
const User = model('User', userSchema);
module.exports = User;
