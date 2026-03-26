const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  itineraryId: { type: Schema.Types.ObjectId, ref: 'Itinerary' },
  itineraryLink: { type: String },
  itineraryThumbnail: { type: String },
  createdAt: { type: Date, default: Date.now },
  deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Message = model('Message', messageSchema);
module.exports = Message;
