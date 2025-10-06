import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX,
  FiClock,
  FiUser,
  FiEye,
  FiBookmark,
  FiCode,
  FiArrowLeft
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CodePlayground from '../components/blog/CodePlayground';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [currentVoice, setCurrentVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [showCodePlayground, setShowCodePlayground] = useState(false);
  const [currentCodeBlock, setCurrentCodeBlock] = useState(null);
  
  const speechRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await api.blogs.getBlogBySlug(slug);
        setBlog(response.data);
        setIsLiked(response.data.likes?.includes(user?._id) || false);
        setLikeCount(response.data.likes?.length || 0);
        setCommentCount(response.data.comments?.length || 0);
        setViewCount(response.data.views || 0);
        
        // Increment view count
        await api.blogs.incrementViews(response.data._id);
      } catch (err) {
        setError('Blog not found');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, user?._id]);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
          setCurrentVoice(availableVoices[0]);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this blog');
      return;
    }

    try {
      const response = await api.blogs.toggleLike(blog._id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    const content = newComment.trim();
    if (!content) return;
    try {
      setIsPostingComment(true);
      const res = await api.blogs.addComment(blog._id, { content });
      const created = res.data?.comment || res.data;
      const updated = [...(blog.comments || []), created];
      setBlog({ ...blog, comments: updated });
      setCommentCount(updated.length);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const startVoiceNarration = () => {
    if (!currentVoice) {
      toast.error('No voice available');
      return;
    }

    if (isPlaying) {
      stopVoiceNarration();
      return;
    }

    const text = blog.content.replace(/<[^>]*>/g, '');
    
    if (speechRef.current) {
      speechSynthesis.cancel();
    }

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.voice = currentVoice;
    utteranceRef.current.rate = speechRate;
    utteranceRef.current.pitch = 1;
    utteranceRef.current.volume = isMuted ? 0 : 1;

    utteranceRef.current.onstart = () => setIsPlaying(true);
    utteranceRef.current.onend = () => setIsPlaying(false);
    utteranceRef.current.onerror = () => {
      setIsPlaying(false);
      toast.error('Voice narration failed');
    };

    speechSynthesis.speak(utteranceRef.current);
    speechRef.current = utteranceRef.current;
  };

  const stopVoiceNarration = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : 1;
    }
  };

  const handleCodeBlockClick = (codeBlock) => {
    setCurrentCodeBlock(codeBlock);
    setShowCodePlayground(true);
  };

  const extractCodeBlocks = (content) => {
    const codeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g;
    const blocks = [];
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        id: index++,
        code: match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
        language: 'javascript' // Default to JavaScript, could be enhanced to detect language
      });
    }

    return blocks;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Blog not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const codeBlocks = extractCodeBlocks(blog.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Code Playground Modal */}
      {showCodePlayground && currentCodeBlock && (
        <CodePlayground
          codeBlock={currentCodeBlock}
          onClose={() => setShowCodePlayground(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>
        </motion.div>

        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Title and Meta */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
              {blog.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                <span>{blog.author?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>{blog.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <FiEye className="w-4 h-4" />
                <span>{viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                <span>{commentCount} comments</span>
              </div>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {blog.category && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  {blog.category}
                </span>
              )}
              {blog.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Voice Narration Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Voice Narration
              </h3>
              
              {/* Voice Selection */}
              <select
                value={voices.findIndex(v => v === currentVoice)}
                onChange={(e) => setCurrentVoice(voices[e.target.value])}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>

              {/* Speed Control */}
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-lg transition-colors ${
                  isMuted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={startVoiceNarration}
                className={`p-3 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                }`}
              >
                {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
        >
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>

        {/* Code Playground Section */}
        {codeBlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiCode className="w-6 h-6 text-primary-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Code Playground
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click on any code block below to run it in our interactive playground.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codeBlocks.map((block) => (
                <div
                  key={block.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleCodeBlockClick(block)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Code Block {block.id + 1}
                    </span>
                    <FiCode className="w-4 h-4 text-primary-500" />
                  </div>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    <code>{block.code.substring(0, 100)}{block.code.length > 100 ? '...' : ''}</code>
                  </pre>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              isLiked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
            <span className="ml-1">({likeCount})</span>
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <FiMessageSquare className="w-5 h-5" />
            <span>Comment</span>
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <FiShare2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <FiBookmark className="w-5 h-5" />
            <span>Bookmark</span>
          </button>
        </motion.div>

        {/* Author Info */}
        {blog.author && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              {blog.author.avatar && (
                <img
                  src={blog.author.avatar}
                  alt={blog.author.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {blog.author.username}
                </h3>
                {blog.author.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {blog.author.bio}
                  </p>
                )}
                <Link
                  to={`/profile/${blog.author.username}`}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium mt-2 inline-block"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Comments ({commentCount})
          </h3>
          
          {user ? (
            <div className="mb-6">
              <textarea
                placeholder="Add a comment..."
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="mt-3 flex justify-end">
                <button onClick={handleAddComment} disabled={isPostingComment || !newComment.trim()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPostingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please login to leave a comment
              </p>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {blog.comments?.length > 0 ? (
              blog.comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-start gap-3">
                    {comment.user?.avatar && (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail;
