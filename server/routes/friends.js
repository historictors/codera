const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const currentUserId = req.user.userId;

    // Find target user
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === currentUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already friends
    const areAlreadyFriends = currentUser.friends.some(
      friend => friend.user.toString() === targetUser._id.toString()
    );

    if (areAlreadyFriends) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    const requestAlreadySent = currentUser.friendRequests.sent.some(
      request => request.user.toString() === targetUser._id.toString()
    );

    if (requestAlreadySent) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if request already received
    const requestAlreadyReceived = currentUser.friendRequests.received.some(
      request => request.user.toString() === targetUser._id.toString()
    );

    if (requestAlreadyReceived) {
      return res.status(400).json({ message: 'Friend request already received from this user' });
    }

    // Add to sent requests
    currentUser.friendRequests.sent.push({
      user: targetUser._id,
      sentAt: new Date()
    });

    // Add to received requests for target user
    targetUser.friendRequests.received.push({
      user: currentUser._id,
      sentAt: new Date()
    });

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(userId);

    if (!requesterUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    const requestIndex = currentUser.friendRequests.received.findIndex(
      request => request.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    // Remove from requests
    currentUser.friendRequests.received.splice(requestIndex, 1);
    
    const sentRequestIndex = requesterUser.friendRequests.sent.findIndex(
      request => request.user.toString() === currentUserId
    );
    
    if (sentRequestIndex !== -1) {
      requesterUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }

    // Add to friends
    currentUser.friends.push({
      user: userId,
      addedAt: new Date()
    });

    requesterUser.friends.push({
      user: currentUserId,
      addedAt: new Date()
    });

    await currentUser.save();
    await requesterUser.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline friend request
router.post('/decline', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(userId);

    if (!requesterUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from requests
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
      request => request.user.toString() !== userId
    );

    requesterUser.friendRequests.sent = requesterUser.friendRequests.sent.filter(
      request => request.user.toString() !== currentUserId
    );

    await currentUser.save();
    await requesterUser.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.delete('/remove', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(userId);

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from friends
    currentUser.friends = currentUser.friends.filter(
      friend => friend.user.toString() !== userId
    );

    friendUser.friends = friendUser.friends.filter(
      friend => friend.user.toString() !== currentUserId
    );

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.userId }
    })
      .select('username email avatar stats isOnline')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;