import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiUser, FiHeart, FiEye } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { user } = useAuth();
  const { theme, mood } = useTheme();
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [moodBlogs, setMoodBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const [featuredResponse, moodResponse] = await Promise.all([
          api.blogs.getBlogs({ featured: true, limit: 6 }),
          user ? api.blogs.getMoodBlogs(mood) : Promise.resolve({ data: [] })
        ]);

        setFeaturedBlogs(featuredResponse.data || []);
        setMoodBlogs(moodResponse.data || []);
      } catch (err) {
        setError('Failed to load blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [user, mood]);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Share Your
              <span className="text-primary-500 block">Story</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Create, discover, and connect through the power of storytelling. 
              Your voice matters, and your stories can inspire the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-16 h-16 bg-primary-300 rounded-full opacity-20"
        />
      </section>

      {/* Featured Blogs Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover the most compelling stories from our community
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                variants={itemVariants}
                className="group"
              >
                <Link to={`/blog/${blog.slug}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                    {blog.coverImage && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {blog.category && (
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                            {blog.category}
                          </span>
                        )}
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {blog.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-500 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {blog.author?.avatar && (
                            <img
                              src={blog.author.avatar}
                              alt={blog.author.username}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {blog.author?.username || 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <span className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" />
                            {blog.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {blog.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {featuredBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/blogs" className="btn-outline text-lg px-8 py-3">
                View All Stories
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Mood-Based Recommendations */}
      {user && moodBlogs.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Stories for Your Mood
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Based on your current mood: <span className="text-primary-500 capitalize">{mood}</span>
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {moodBlogs.slice(0, 3).map((blog) => (
                <motion.div
                  key={blog._id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-500 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {blog.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" />
                            {blog.likes?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience the next generation of storytelling
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Rich Text Editor',
                description: 'Create beautiful content with images, code blocks, and markdown support.'
              },
              {
                icon: '🎭',
                title: 'Personalized Experience',
                description: 'Get recommendations based on your mood and reading preferences.'
              },
              {
                icon: '🔊',
                title: 'Voice Narration',
                description: 'Listen to your favorite stories with our text-to-speech feature.'
              },
              {
                icon: '💬',
                title: 'Real-time Chat',
                description: 'Share and discuss stories with friends in real-time.'
              },
              {
                icon: '⚡',
                title: 'Code Playground',
                description: 'Run JavaScript code snippets directly in tech blog posts.'
              },
              {
                icon: '🎯',
                title: 'Smart Analytics',
                description: 'Track your reading habits and discover new content.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
