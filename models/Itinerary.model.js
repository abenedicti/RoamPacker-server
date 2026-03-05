const { Schema, model } = require('mongoose');

const pointSchema = new Schema({
  city: String,
  lat: Number,
  lng: Number,
  comment: String,
});

const itinerarySchema = new Schema(
  {
    owner: {
      // user create iti
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    points: [pointSchema],

    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // add createdAt et updatedAt automatically
  },
);

const Itinerary = model('Itinerary', itinerarySchema);
module.exports = Itinerary;
