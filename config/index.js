const express = require('express');
//* Logs incoming requests and responses to the terminal
const morgan = require('morgan');
//* authorize request from frontend
const cors = require('cors');

// Middleware configuration
function config(app) {
  //* Enables Express to trust reverse proxies for deployment
  app.set('trust proxy', 1);

  //* Configures CORS to allow requests only from the specified origin or '*' to allowed all
  app.use(
    cors({
      origin: [process.env.ORIGIN],
    }),
  );

  //* to log requests in the console
  app.use(morgan('dev'));

  //* to read JSON requests
  app.use(express.json());

  //*  allow to read incoming request bodies with URL-encoded data (form submissions)
  app.use(express.urlencoded({ extended: false }));
}
//* export to read in server.js
module.exports = config;
