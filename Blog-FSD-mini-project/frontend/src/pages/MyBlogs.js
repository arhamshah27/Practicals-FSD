import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBlogs = () => {
  const [tab, setTab] = useState('draft');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.blogs.getUserBlogs({ status: tab, limit: 20, mine: true });
      setBlogs(res.data || []);
    } catch (err) {
      setError('Failed to load your blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [tab]);

  const handleDelete = async (id) => {
    try {
      await api.blogs.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert('Failed to delete');
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Blogs</h1>
          <div className="flex gap-2">
            <button onClick={() => setTab('draft')} className={`px-4 py-2 rounded ${tab==='draft'?'bg-primary-500 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>Drafts</button>
            <button onClick={() => setTab('published')} className={`px-4 py-2 rounded ${tab==='published'?'bg-primary-500 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>Published</button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">No {tab} posts</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {blogs.map((b) => (
              <div key={b._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="mr-3 overflow-hidden">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{b.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{b.excerpt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/blog/${b.slug}`} className="p-2 text-gray-400 hover:text-primary-500" title="View"><FiEye className="w-4 h-4" /></Link>
                  <Link to={`/edit-blog/${b.slug}`} className="p-2 text-gray-400 hover:text-primary-500" title="Edit"><FiEdit className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(b._id)} className="p-2 text-gray-400 hover:text-red-500" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;


