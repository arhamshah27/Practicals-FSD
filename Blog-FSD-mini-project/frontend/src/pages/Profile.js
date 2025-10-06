import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiEdit, 
  FiSave, 
  FiX, 
  FiUser, 
  FiMail, 
  FiMapPin, 
  FiLink, 
  FiCalendar,
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiSettings,
  FiBookOpen,
  FiTrendingUp,
  FiCamera,
  FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MoodSelector from '../components/common/MoodSelector';

const Profile = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();
  const { theme, mood, setUserMood } = useTheme();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: ''
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile','blogs','stats'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, blogsResponse, statsResponse] = await Promise.all([
        api.users.getUserByUsername(username),
        api.blogs.getUserBlogs({ username, limit: 10 }),
        isOwnProfile ? api.users.getUserStats() : Promise.resolve({ data: {} })
      ]);

      setUser(profileResponse.data);
      setUserBlogs(blogsResponse.data || []);
      setUserStats(statsResponse.data || {});
      
      // Initialize edit form
      setEditForm({
        username: profileResponse.data.username,
        email: profileResponse.data.email,
        bio: profileResponse.data.bio || '',
        location: profileResponse.data.location || '',
        website: profileResponse.data.website || '',
        avatar: profileResponse.data.avatar || ''
      });
    } catch (error) {
      toast.error('Failed to load user profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar || ''
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await updateProfile(editForm);
      setUser(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setEditForm(prev => ({
        ...prev,
        avatar: e.target.result
      }));
    };
    reader.readAsDataURL(file);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">User not found</p>
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'blogs', label: 'Blogs', icon: FiBookOpen },
    { id: 'stats', label: 'Statistics', icon: FiTrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {isOwnProfile && isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                  <FiCamera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {user.username}
                  </h1>
                  {user.bio && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-2">
                        <FiLink className="w-4 h-4" />
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600 transition-colors"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center gap-3">
                    <MoodSelector currentMood={mood} onMoodChange={setUserMood} />
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary flex items-center gap-2"
                        >
                          <FiSave className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn-outline flex items-center gap-2"
                        >
                          <FiX className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="btn-primary flex items-center gap-2"
                      >
                        <FiEdit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Blogs', value: userStats.totalBlogs || 0, icon: FiBookOpen },
                  { label: 'Views', value: userStats.totalViews || 0, icon: FiEye },
                  { label: 'Likes', value: userStats.totalLikes || 0, icon: FiHeart },
                  { label: 'Comments', value: userStats.totalComments || 0, icon: FiMessageSquare }
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows="4"
                        value={editForm.bio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Where are you located?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={editForm.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Username
                          </label>
                          <p className="text-gray-900 dark:text-white">{user.username}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Location
                          </label>
                          <p className="text-gray-900 dark:text-white">{user.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Website
                          </label>
                          {user.website ? (
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600 transition-colors"
                            >
                              {user.website}
                            </a>
                          ) : (
                            <p className="text-gray-900 dark:text-white">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {user.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Bio
                        </label>
                        <p className="text-gray-900 dark:text-white">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Blogs Tab */}
            {activeTab === 'blogs' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Blogs
                </h3>
                {userBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {userBlogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {blog.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiEye className="w-4 h-4" />
                                {blog.views || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <FiHeart className="w-4 h-4" />
                                {blog.likes?.length || 0} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <FiMessageSquare className="w-4 h-4" />
                                {blog.comments?.length || 0} comments
                              </span>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => navigate(`/edit-blog/${blog.slug}`)}
                                className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No blogs yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Start writing your first blog post!' : 'This user hasn\'t published any blogs yet.'}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/create-blog')}
                        className="btn-primary mt-4"
                      >
                        Create Blog
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Blog Statistics
                </h3>
                {isOwnProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Blogs', value: userStats.totalBlogs || 0, color: 'bg-blue-500' },
                      { label: 'Total Views', value: userStats.totalViews || 0, color: 'bg-green-500' },
                      { label: 'Total Likes', value: userStats.totalLikes || 0, color: 'bg-red-500' },
                      { label: 'Total Comments', value: userStats.totalComments || 0, color: 'bg-purple-500' },
                      { label: 'Average Views per Blog', value: userStats.totalBlogs ? Math.round(userStats.totalViews / userStats.totalBlogs) : 0, color: 'bg-yellow-500' },
                      { label: 'Engagement Rate', value: userStats.totalViews ? Math.round((userStats.totalLikes + userStats.totalComments) / userStats.totalViews * 100) : 0, color: 'bg-indigo-500' }
                    ].map((stat, index) => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {stat.label}
                          </h4>
                          <div className={`w-3 h-3 ${stat.color} rounded-full`}></div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.label.includes('Rate') ? `${stat.value}%` : stat.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Statistics are only visible to the profile owner.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
