const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'blog', 'file'],
    default: 'text'
  },
  // For blog sharing
  sharedBlog: {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    },
    title: String,
    excerpt: String,
    coverImage: String
  },
  // For file/image sharing
  mediaUrl: String,
  fileName: String,
  fileSize: Number,
  // For reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'moderator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowBlogSharing: {
      type: Boolean,
      default: true
    },
    maxParticipants: {
      type: Number,
      default: 50
    }
  },
  // For group chats
  groupInfo: {
    description: String,
    avatar: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatRoomSchema.index({ participants: 1, lastMessage: -1 });
chatRoomSchema.index({ type: 1, isActive: 1 });

// Virtual for unread message count
chatRoomSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => !msg.isDeleted).length;
});

// Method to add message
chatRoomSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastMessage = new Date();
  return this.save();
};

// Method to mark messages as read for a user
chatRoomSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastSeen = new Date();
    return this.save();
  }
  return this;
};

// Method to check if user is participant
chatRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to add participant
chatRoomSchema.methods.addParticipant = function(userId, role = 'member') {
  if (!this.isParticipant(userId)) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastSeen: new Date()
    });
    return this.save();
  }
  return this;
};

// Method to remove participant
chatRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
