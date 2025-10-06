import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiEye, FiTrash2, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    fetchBlogs();
  }, [filter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getUserBlogs({
        status: filter === 'all' ? undefined : filter,
        mine: true
      });
      setBlogs(response.data || []);
    } catch (err) {
      setError('Failed to load blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await api.blogs.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      // Refresh the blogs list
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog');
      console.error('Error deleting blog:', err);
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
            onClick={fetchBlogs}
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Blogs
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your blog posts and drafts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'published'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'draft'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Drafts
              </button>
            </div>
            <Link
              to="/create-blog"
              className="btn-primary"
            >
              Create New Blog
            </Link>
          </div>
        </div>

        {blogs.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${blog.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiEye className="w-4 h-4" />
                          {blog.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          {blog.likes?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiMessageSquare className="w-4 h-4" />
                          {blog.comments?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-gray-400 hover:text-primary-500 transition-colors"
                            title="View"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/edit-blog/${blog.slug}`}
                            className="text-gray-400 hover:text-primary-500 transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
    </div>
  );
};

export default ManageBlogs;