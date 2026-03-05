const { Schema, model } = require('mongoose');
const itinerarySchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  title: String,

  destinations: [
    {
      city: String,
      lat: Number,
      lng: Number,
      comment: String,
    },
  ],

  sharedWith: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
const Itinerary = model('Itinerary', itinerarySchema);
module.exports = Itinerary;
