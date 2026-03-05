const { Schema, model } = require('mongoose');
const matchSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Match = model('Match', matchSchema);
module.exports = Match;
