const mongoose = require('mongoose');

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const response = await mongoose.connect(process.env.MONGODB_URI);
    // first connection to DB [0], name = roampackerDB
    const dbName = response.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  } catch (err) {
    console.error('Error connecting to mongo: ', err);
  }
}

module.exports = connectDB;
