import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiEye, 
  FiHeart, 
  FiMessageSquare, 
  FiTrendingUp,
  FiBookOpen,
  FiUsers,
  FiClock,
  FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MoodSelector from '../components/common/MoodSelector';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, mood, setUserMood } = useTheme();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, blogsResponse, historyResponse, draftsResponse] = await Promise.all([
          api.users.getUserStats(),
          api.blogs.getUserBlogs({ limit: 5 }),
          api.users.getReadingHistory(),
          api.blogs.getUserBlogs({ status: 'draft', limit: 5, mine: true })
        ]);

        setStats(statsResponse.data || { totalBlogs: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
        setRecentBlogs(blogsResponse.data || []);
        setReadingHistory(historyResponse.data || []);
        setDraftBlogs(draftsResponse.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.username}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Here's what's happening with your blog today
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              <MoodSelector currentMood={mood} onMoodChange={setUserMood} />
              <Link
                to="/create-blog"
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                New Blog
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Total Blogs',
              value: stats.totalBlogs,
              icon: FiBookOpen,
              color: 'bg-blue-500',
              textColor: 'text-blue-500'
            },
            {
              title: 'Total Views',
              value: stats.totalViews,
              icon: FiEye,
              color: 'bg-green-500',
              textColor: 'text-green-500'
            },
            {
              title: 'Total Likes',
              value: stats.totalLikes,
              icon: FiHeart,
              color: 'bg-red-500',
              textColor: 'text-red-500'
            },
            {
              title: 'Total Comments',
              value: stats.totalComments,
              icon: FiMessageSquare,
              color: 'bg-purple-500',
              textColor: 'text-purple-500'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stat.value ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Blogs */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Blogs
                </h2>
                <Link
                  to="/my-blogs"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  View all
                </Link>
              </div>

              {recentBlogs.length > 0 ? (
                <div className="space-y-4">
                  {recentBlogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {blog.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" />
                            {blog.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMessageSquare className="w-4 h-4" />
                            {blog.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/edit-blog/${blog.slug}`}
                          className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No blogs yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating your first blog post.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/create-blog"
                      className="btn-primary"
                    >
                      Create Blog
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions & Reading History */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/create-blog"
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Create New Blog</span>
                </Link>
                <Link
                  to="/my-blogs"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiEdit className="w-5 h-5" />
                  <span>Manage Blogs</span>
                </Link>
                <Link
                  to={`/profile/${user?.username}?tab=profile`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiUsers className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  to={`/profile/${user?.username}?tab=stats`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiBarChart2 className="w-5 h-5" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Reading History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Reading
              </h3>
              {readingHistory.length > 0 ? (
                <div className="space-y-3">
                  {readingHistory.slice(0, 5).map((item) => (
                    <Link
                      key={item._id}
                      to={`/blog/${item.slug}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FiClock className="w-3 h-3" />
                        <span>{item.readAt ? new Date(item.readAt).toLocaleDateString() : ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiBookOpen className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No reading history yet
                  </p>
                </div>
              )}
            </div>

            {/* Drafts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Drafts
                </h3>
              </div>
              {draftBlogs.length > 0 ? (
                <div className="space-y-3">
                  {draftBlogs.map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="truncate mr-3">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{d.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.excerpt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/edit-blog/${d.slug}`} className="px-3 py-1 text-sm btn-outline">Edit</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No drafts yet
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Mood-Based Recommendations */}
        {mood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiTrendingUp className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recommended for your mood: <span className="text-primary-500 capitalize">{mood}</span>
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Based on your current mood, we think you might enjoy these stories.
              </p>
              <Link
                to="/blogs"
                className="btn-outline"
              >
                Explore More Stories
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
