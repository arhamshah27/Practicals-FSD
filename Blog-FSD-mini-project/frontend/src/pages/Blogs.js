import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiClock, 
  FiUser, 
  FiHeart, 
  FiEye,
  FiTrendingUp,
  FiBookOpen,
  FiTag
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MoodSelector from '../components/common/MoodSelector';
import { AnimatePresence } from 'framer-motion';

const Blogs = () => {
  const { user } = useAuth();
  const { theme, mood, setUserMood } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 
    'Business', 'Education', 'Entertainment', 'Sports', 
    'Politics', 'Science', 'Art', 'Music', 'Fashion', 'Other'
  ];

  const moods = [
    'happy', 'stressed', 'motivated', 'calm', 'energetic'
  ];
  const allowedMoods = new Set(moods);

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: FiClock },
    { value: 'popular', label: 'Most Popular', icon: FiTrendingUp },
    { value: 'views', label: 'Most Viewed', icon: FiEye },
    { value: 'likes', label: 'Most Liked', icon: FiHeart }
  ];

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, selectedCategory, selectedMood, sortBy, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchQuery,
        category: selectedCategory ? selectedCategory.toLowerCase() : undefined,
        mood: allowedMoods.has(selectedMood) ? selectedMood : (allowedMoods.has(mood) ? mood : undefined),
        sortBy
      };

      const response = await api.blogs.getBlogs(params);
      setBlogs(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalBlogs(response.total || 0);
    } catch (err) {
      setError('Failed to load blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'category') {
      setSelectedCategory(selectedCategory === value ? '' : value);
    } else if (filterType === 'mood') {
      setSelectedMood(selectedMood === value ? '' : value);
    } else if (filterType === 'sort') {
      setSortBy(value);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedMood('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Stories
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Explore amazing stories from our community
              </p>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <MoodSelector currentMood={mood} onMoodChange={setUserMood} />
                <Link
                  to="/create-blog"
                  className="btn-primary flex items-center gap-2"
                >
                  <FiBookOpen className="w-5 h-5" />
                  Write Story
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </form>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleFilterChange('category', category)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Moods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((moodOption) => (
                        <button
                          key={moodOption}
                          onClick={() => handleFilterChange('mood', moodOption)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedMood === moodOption
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {moodOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Sort By
                    </label>
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('sort', option.value)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === option.value
                              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={clearFilters}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {blogs.length} of {totalBlogs} stories
              {selectedCategory && ` in ${selectedCategory}`}
              {selectedMood && ` for ${selectedMood} mood`}
            </p>
            
            {totalBlogs > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Blogs Grid/List */}
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </motion.div>
        ) : blogs.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
            }
          >
            {blogs.map((blog) => (
              <motion.div
                key={blog._id}
                variants={itemVariants}
                className={viewMode === 'grid' 
                  ? 'group'
                  : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden'
                }
              >
                <Link to={`/blog/${blog.slug}`}>
                  {viewMode === 'grid' ? (
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
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
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
                  ) : (
                    <div className="flex">
                      {blog.coverImage && (
                        <div className="w-48 h-32 overflow-hidden">
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {blog.category && (
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                              {blog.category}
                            </span>
                          )}
                          {blog.mood && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full flex items-center gap-1">
                              <FiTag className="w-3 h-3" />
                              {blog.mood}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              {blog.author?.username || 'Anonymous'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              {blog.readTime} min read
                            </span>
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
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FiBookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No stories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
