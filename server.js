//* instead of trycatch => can be used in all environments, compatible with all Node packages
require('dotenv').config();
// try {
//   process.loadEnvFile();
// } catch (error) {
//   console.warn('.env file not found, using default environment values');
// }

const router = require('express').Router();
//* create backend app
const express = require('express');
//* for routes and middlwares
const app = express();

//* global config to execute with app
const config = require('./config');
config(app); // apply middlewares

//* connection with MongoDB
const connectDB = require('./db');
//! to connect again after each request otherwise connect DB and run the server (line 37)
// app.use(async (req, res, next) => {
//   await connectDB();
//   next();
// });

//* import file principal routes
const indexRouter = require('./routes/index.routes');
app.use('/api', indexRouter);

//* testing route
app.get('/', (req, res, next) => {
  res.json('All good in here');
});

//* Centralized error handling (must be placed after routes)

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });
