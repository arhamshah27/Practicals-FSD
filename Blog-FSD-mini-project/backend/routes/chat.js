const express = require('express');
const ChatRoom = require('../models/Chat');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/chat/rooms
// @desc    Get all chat rooms for current user
// @access  Private
router.get('/rooms', auth, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      'participants.user': req.user._id,
      isActive: true
    })
      .populate('participants.user', 'username avatar')
      .populate('messages.sender', 'username avatar')
      .sort({ lastMessage: -1 });

    // Format chat rooms with unread count and last message
    const formattedRooms = chatRooms.map(room => {
      const userParticipant = room.participants.find(p => p.user._id.toString() === req.user._id.toString());
      const lastMessage = room.messages[room.messages.length - 1];
      
      return {
        _id: room._id,
        name: room.name,
        type: room.type,
        participants: room.participants,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender,
          messageType: lastMessage.messageType,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: room.messages.filter(msg => 
          !msg.isDeleted && 
          msg.sender._id.toString() !== req.user._id.toString() &&
          new Date(msg.createdAt) > new Date(userParticipant.lastSeen)
        ).length,
        lastSeen: userParticipant.lastSeen,
        settings: room.settings
      };
    });

    res.json({ chatRooms: formattedRooms });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ message: 'Server error fetching chat rooms' });
  }
});

// @route   POST /api/chat/rooms
// @desc    Create a new chat room
// @access  Private
router.post('/rooms', auth, async (req, res) => {
  try {
    const { type, participants, name, description } = req.body;

    if (!type || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'Type and participants are required' });
    }

    // Add current user to participants
    const allParticipants = [
      { user: req.user._id, role: 'admin' },
      ...participants.map(p => ({ user: p, role: 'member' }))
    ];

    const chatRoom = new ChatRoom({
      type,
      participants: allParticipants,
      name: type === 'group' ? name : undefined,
      groupInfo: type === 'group' ? {
        description,
        createdBy: req.user._id
      } : undefined
    });

    await chatRoom.save();
    await chatRoom.populate('participants.user', 'username avatar');

    res.status(201).json({
      message: 'Chat room created successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ message: 'Server error creating chat room' });
  }
});

// @route   GET /api/chat/rooms/:roomId
// @desc    Get chat room details and messages
// @access  Private
router.get('/rooms/:roomId', auth, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId)
      .populate('participants.user', 'username avatar')
      .populate('messages.sender', 'username avatar')
      .populate('messages.sharedBlog', 'title excerpt coverImage');

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user is participant
    if (!chatRoom.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat room' });
    }

    // Mark messages as read
    await chatRoom.markAsRead(req.user._id);

    // Filter out deleted messages
    const activeMessages = chatRoom.messages.filter(msg => !msg.isDeleted);

    res.json({
      chatRoom: {
        ...chatRoom.toObject(),
        messages: activeMessages
      }
    });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ message: 'Server error fetching chat room' });
  }
});

// @route   POST /api/chat/rooms/:roomId/messages
// @desc    Send a message to a chat room
// @access  Private
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { content, messageType = 'text', sharedBlogId, mediaUrl, fileName, fileSize } = req.body;
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user is participant
    if (!chatRoom.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to send messages to this chat room' });
    }

    const messageData = {
      sender: req.user._id,
      content,
      messageType
    };

    // Handle blog sharing
    if (messageType === 'blog' && sharedBlogId) {
      const blog = await Blog.findById(sharedBlogId);
      if (blog) {
        messageData.sharedBlog = {
          blogId: blog._id,
          title: blog.title,
          excerpt: blog.excerpt,
          coverImage: blog.coverImage
        };
      }
    }

    // Handle file/image sharing
    if (messageType === 'file' || messageType === 'image') {
      messageData.mediaUrl = mediaUrl;
      messageData.fileName = fileName;
      messageData.fileSize = fileSize;
    }

    // Add message to chat room
    await chatRoom.addMessage(messageData);
    await chatRoom.populate('messages.sender', 'username avatar');
    await chatRoom.populate('messages.sharedBlog', 'title excerpt coverImage');

    const newMessage = chatRoom.messages[chatRoom.messages.length - 1];

    res.status(201).json({
      status: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   PUT /api/chat/rooms/:roomId/messages/:messageId
// @desc    Edit a message
// @access  Private
router.put('/rooms/:roomId/messages/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const message = chatRoom.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await chatRoom.save();

    res.json({
      message: 'Message updated successfully',
      message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error editing message' });
  }
});

// @route   DELETE /api/chat/rooms/:roomId/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/rooms/:roomId/messages/:messageId', auth, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const message = chatRoom.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await chatRoom.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
});

// @route   POST /api/chat/rooms/:roomId/participants
// @desc    Add participant to chat room
// @access  Private
router.post('/rooms/:roomId/participants', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user is admin
    const userParticipant = chatRoom.participants.find(p => p.user.toString() === req.user._id.toString());
    if (!userParticipant || !['admin', 'moderator'].includes(userParticipant.role)) {
      return res.status(403).json({ message: 'Not authorized to add participants' });
    }

    await chatRoom.addParticipant(userId, role);
    await chatRoom.populate('participants.user', 'username avatar');

    res.json({
      message: 'Participant added successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ message: 'Server error adding participant' });
  }
});

// @route   DELETE /api/chat/rooms/:roomId/participants/:userId
// @desc    Remove participant from chat room
// @access  Private
router.delete('/rooms/:roomId/participants/:userId', auth, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user is admin or removing themselves
    const userParticipant = chatRoom.participants.find(p => p.user.toString() === req.user._id.toString());
    const targetParticipant = chatRoom.participants.find(p => p.user.toString() === req.params.userId);

    if (!userParticipant) {
      return res.status(403).json({ message: 'Not a participant in this chat room' });
    }

    if (req.params.userId !== req.user._id.toString() && !['admin', 'moderator'].includes(userParticipant.role)) {
      return res.status(403).json({ message: 'Not authorized to remove participants' });
    }

    await chatRoom.removeParticipant(req.params.userId);
    await chatRoom.populate('participants.user', 'username avatar');

    res.json({
      message: 'Participant removed successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ message: 'Server error removing participant' });
  }
});

// @route   GET /api/chat/search
// @desc    Search for users to start a chat with
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id }
    })
      .select('username avatar bio')
      .limit(limit);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

module.exports = router;
