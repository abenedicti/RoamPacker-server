const router = require('express').Router();
const Message = require('../models/Message.model');
const verifyToken = require('../middlewares/auth.middlewares');
const mongoose = require('mongoose');

//* to send messages
//! tested ok
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    // check if valid id
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ errorMessage: 'Invalid receiver ID' });
    }
    // convert  in ObjectId
    const senderObjectId = new mongoose.Types.ObjectId(req.payload._id);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const newMessage = await Message.create({
      sender: senderObjectId,
      receiver: receiverObjectId,
      text,
    });
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});

//* to get all conv
//! tested ok
router.get('/conversations', verifyToken, async (req, res, next) => {
  try {
    const userId = req.payload._id;

    const allMessages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json(allMessages);
  } catch (error) {
    next(error);
  }
});
//* to get conv with a specific user
//! tested ok
router.get(
  '/conversation/:otherUserId',
  verifyToken,
  async (req, res, next) => {
    try {
      const currentUserId = req.payload._id;
      const otherUserId = req.params.otherUserId;

      // check if valid id
      if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        return res.status(400).json({ errorMessage: 'Invalid otherUserId' });
      }

      const conversationMessages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId },
        ],
      })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort({ createdAt: 1 });

      res.status(200).json(conversationMessages);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
