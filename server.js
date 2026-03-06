try {
  process.loadEnvFile();
} catch (error) {
  console.warn('.env file not found, using default environment values');
}

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
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

//* import file principal routes
const indexRouter = require('./routes/index.routes');
app.use('/api', indexRouter);

const handlingError = require('./errors/index');
handlingError(app);

//* testing route
app.get('/', (req, res, next) => {
  res.json('All good in here');
});

//* Centralized error handling (must be placed after routes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
