const router = require('express').Router();

const authRouter = require('./auth.routes');
router.use('/auth', authRouter);

const userRouter = require('./user.routes');
router.use('/users', userRouter);

const matchRouter = require('./match.routes');
router.use('/matches', matchRouter);

const messageRouter = require('./message.routes');
router.use('/messages', messageRouter);

const itineraryRouter = require('./itinerary.routes');
router.use('/itineraries', itineraryRouter);

const utilsRouter = require('./utils.routes');
router.use('/utils', utilsRouter);

const findMatchRouter = require('./find-match.routes');
router.use('/find-match', findMatchRouter);

// public route for destination
const destinationsRouter = require('./destinations.routes');
router.use('/destinations', destinationsRouter);

module.exports = router;
