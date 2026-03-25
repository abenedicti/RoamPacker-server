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
      deletedFor: [],
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
      deletedFor: { $ne: userId },
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
        deletedFor: { $ne: currentUserId },
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
//* Delete conversation only for current user
router.delete(
  '/conversation/:otherUserId',
  verifyToken,
  async (req, res, next) => {
    try {
      const currentUserId = req.payload._id;
      const otherUserId = req.params.otherUserId;

      if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        return res.status(400).json({ errorMessage: 'Invalid otherUserId' });
      }

      //* Find all messages between the two users
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId },
        ],
      });

      //* Mark each message as deleted for the current user
      await Promise.all(
        messages.map(async (msg) => {
          if (!msg.deletedFor.includes(currentUserId)) {
            msg.deletedFor.push(currentUserId);
            await msg.save();
          }
        }),
      );

      res
        .status(200)
        .json({ message: 'Conversation deleted for current user' });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
