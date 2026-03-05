const router = require('express').Router();
const Message = require('../models/Message.model');
const verifyToken = require('../middlewares/auth.middlewares');

//* to send messages
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    const message = await Message.create({
      sender: req.payload._id,
      receiver: receiverId,
      text,
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

//* to get all conv
router.get('/conversations', verifyToken, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.payload._id }, { receiver: req.payload._id }],
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});
//* to get conv with a specific user
router.get(
  '/conversation/:otherUserId',
  verifyToken,
  async (req, res, next) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: req.payload._id, receiver: req.params.otherUserId },
          { sender: req.params.otherUserId, receiver: req.payload._id },
        ],
      })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
