const router = require('express').Router();

const authRouter = require('./auth.routes');
router.use('/auth', authRouter);

const userRouter = require('./user.routes');
router.use('/users', userRouter);

const utilsRouter = require('./utils.routes');
router.use('/utils', utilsRouter);

module.exports = router;
