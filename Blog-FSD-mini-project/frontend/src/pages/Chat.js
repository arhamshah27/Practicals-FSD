import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiSearch, 
  FiMoreVertical, 
  FiImage, 
  FiPaperclip,
  FiSmile,
  FiMic,
  FiPhone,
  FiVideo,
  FiUser,
  FiUsers,
  FiMessageCircle,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShare2
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Chat = () => {
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendMessage, sendTyping } = useSocket();
  const { theme } = useTheme();
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on('receive_message', (data) => {
        if (data.roomId === currentRoom?._id) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        if (data.roomId === currentRoom?._id && data.userId !== user._id) {
          setTypingUsers(prev => new Set(prev).add(data.username));
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.username);
              return newSet;
            });
          }, 3000);
        }
      });

      // Listen for user join/leave
      socket.on('user_joined', (data) => {
        if (data.roomId === currentRoom?._id) {
          toast.success(`${data.username} joined the chat`);
        }
      });

      socket.on('user_left', (data) => {
        if (data.roomId === currentRoom?._id) {
          toast.info(`${data.username} left the chat`);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_joined');
        socket.off('user_left');
      };
    }
  }, [socket, currentRoom, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await api.chat.getChatRooms();
      setChatRooms(response.data || []);
      
      // Set first room as current if available
      if (response.data?.length > 0 && !currentRoom) {
        setCurrentRoom(response.data[0]);
        fetchMessages(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.chat.getRoomMessages(roomId);
      setMessages(response.data || []);
      
      // Join the room via socket
      if (socket) {
        joinRoom(roomId);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleRoomSelect = (room) => {
    if (currentRoom) {
      leaveRoom(currentRoom._id);
    }
    setCurrentRoom(room);
    fetchMessages(room._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      setSending(true);
      const messageData = {
        roomId: currentRoom._id,
        content: newMessage.trim(),
        type: 'text'
      };

      const response = await api.chat.sendMessage(messageData);
      const message = response.data;
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Send via socket for real-time
      if (socket) {
        sendMessage(currentRoom._id, message);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && currentRoom) {
      sendTyping(currentRoom._id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.users.searchUsers(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const createNewChat = async (selectedUser) => {
    try {
      const response = await api.chat.createChatRoom({
        type: 'direct',
        participants: [selectedUser._id]
      });
      
      const newRoom = response.data;
      setChatRooms(prev => [newRoom, ...prev]);
      setCurrentRoom(newRoom);
      setShowUserSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      
      toast.success(`Started chat with ${selectedUser.username}`);
    } catch (error) {
      toast.error('Failed to create chat room');
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setSending(true);
      
      // For now, we'll simulate file upload
      // In production, you'd upload to Cloudinary or similar
      const messageData = {
        roomId: currentRoom._id,
        content: `Sent a ${type}: ${file.name}`,
        type: type,
        mediaUrl: URL.createObjectURL(file) // Temporary URL
      };

      const response = await api.chat.sendMessage(messageData);
      const message = response.data;
      
      setMessages(prev => [...prev, message]);
      
      if (socket) {
        sendMessage(currentRoom._id, message);
      }
      
      toast.success(`${type} sent successfully`);
    } catch (error) {
      toast.error(`Failed to send ${type}`);
    } finally {
      setSending(false);
    }
  };

  const shareBlog = async (blog) => {
    if (!currentRoom) return;

    try {
      const messageData = {
        roomId: currentRoom._id,
        content: `Shared blog: ${blog.title}`,
        type: 'blog',
        sharedBlog: {
          id: blog._id,
          title: blog.title,
          excerpt: blog.excerpt,
          coverImage: blog.coverImage,
          slug: blog.slug
        }
      };

      const response = await api.chat.sendMessage(messageData);
      const message = response.data;
      
      setMessages(prev => [...prev, message]);
      
      if (socket) {
        sendMessage(currentRoom._id, message);
      }
      
      toast.success('Blog shared successfully');
    } catch (error) {
      toast.error('Failed to share blog');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {chatRooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleRoomSelect(room)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentRoom?._id === room._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    {room.type === 'direct' ? (
                      <FiUser className="w-6 h-6 text-primary-600" />
                    ) : (
                      <FiUsers className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {room.type === 'direct' 
                        ? room.participants.find(p => p._id !== user._id)?.username || 'Unknown User'
                        : room.name || 'Group Chat'
                      }
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {room.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {room.lastMessage && (
                    <span className="text-xs text-gray-400">
                      {formatTime(room.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      {currentRoom.type === 'direct' ? (
                        <FiUser className="w-5 h-5 text-primary-600" />
                      ) : (
                        <FiUsers className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {currentRoom.type === 'direct' 
                          ? currentRoom.participants.find(p => p._id !== user._id)?.username || 'Unknown User'
                          : currentRoom.name || 'Group Chat'
                        }
                      </h2>
                      {typingUsers.size > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {Array.from(typingUsers).join(', ')} typing...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                      <FiPhone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                      <FiVideo className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                      <FiMoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.author === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.author === user._id ? 'order-2' : 'order-1'}`}>
                      {message.author !== user._id && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {message.author?.username || 'Unknown User'}
                          </span>
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.author === user._id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        {message.type === 'blog' && message.sharedBlog ? (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-900 dark:text-white">
                            <h4 className="font-medium mb-2">{message.sharedBlog.title}</h4>
                            {message.sharedBlog.coverImage && (
                              <img
                                src={message.sharedBlog.coverImage}
                                alt={message.sharedBlog.title}
                                className="w-full h-32 object-cover rounded mb-2"
                              />
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {message.sharedBlog.excerpt}
                            </p>
                            <button
                              onClick={() => window.open(`/blog/${message.sharedBlog.slug}`, '_blank')}
                              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                            >
                              Read Blog
                            </button>
                          </div>
                        ) : message.type === 'image' ? (
                          <img
                            src={message.mediaUrl}
                            alt="Shared image"
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      <span className={`text-xs text-gray-400 mt-1 block ${
                        message.author === user._id ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onInput={handleTyping}
                      placeholder="Type a message..."
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <FiImage className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'file')}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation from the sidebar or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Start New Chat
                </h2>
                
                <div className="mb-4">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => createNewChat(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </h3>
                        {user.bio && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
