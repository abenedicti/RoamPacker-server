/// to protect routes to enable only the user to access to his data
//* poss to do the authentification after creatings all models and routes but in this case, as mostly of the routes are private we start by that
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    // console.log(payload);
    //* we extract the payload from the token and pass it to the route inside the request.
    req.payload = payload;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ errorMessage: 'There is no token, or is invalid or expired' });
  }
}
module.exports = verifyToken;
