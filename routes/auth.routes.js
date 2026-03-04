const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/auth.middlewares');

//* create a router to split routes
const router = require('express').Router();

// Signup
/// POST './api/auth/signup' => Creating user document
router.post('/signup', async (req, res, next) => {
  console.log(req.body);
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({
      errorMessage: 'All fields are required (email, password, username',
    });
  }
  //*  require strong password
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,20}$/gm;
  if (passwordRegex.test(password) === false) {
    return res.status(400).json({
      errorMessage:
        'Password must follow this pattern (min 8 characters, max 20 characters, include lowercase, include uppercase, include number)',
    });
  }
  try {
    ///* check if the email already exist
    const foundUser = await User.findOne({ email: email });
    if (foundUser) {
      return res.status(400).json({
        errorMessage: 'User already registered with that email',
      });
    }
    //* hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const response = await User.create({
      email: email,
      password: hashedPassword,
      username: username,
    });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Login
/// POST '/api/auth/login' => Validating user credentials and sending the Token
router.post('/login', async (req, res, next) => {
  //* to validate the fields
  const { email, password } = req.body;
  if (!email || !password) {
    // return stop the route to continue
    return res
      .status(400)
      .json({ errorMessage: 'All fields are required (email, password' });
  }
  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(400).json({
        errorMessage: 'User not found with that email, please sign up first',
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password,
    );
    if (isPasswordCorrect === false) {
      res.status(400).json({ errorMessage: 'Wrong password' });
    }
    const payload = {
      _id: foundUser._id,
      email: foundUser.email,
    };
    //* authToken = storing the element in a secure place, payload =  know the info of who is loading
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    res.status(200).json({ authToken: authToken, payload: payload });
  } catch (error) {
    next(error);
  }
});

/// GET '/api/auth/verify' => Validate the token on new users accessing the client
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({ payload: req.payload });
});
module.exports = router;
