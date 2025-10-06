import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiHeart, FiMessageSquare } from 'react-icons/fi';

const About = () => {
  const features = [
    {
      icon: FiBookOpen,
      title: 'Rich Content Creation',
      description: 'Create beautiful blog posts with our advanced rich text editor, supporting images, code blocks, and markdown.'
    },
    {
      icon: FiUsers,
      title: 'Community Driven',
      description: 'Connect with fellow writers and readers, share your stories, and discover amazing content from our community.'
    },
    {
      icon: FiHeart,
      title: 'Personalized Experience',
      description: 'Get recommendations based on your mood and reading preferences, making every visit unique to you.'
    },
    {
      icon: FiMessageSquare,
      title: 'Real-time Interaction',
      description: 'Engage with content through likes, comments, and real-time chat with other community members.'
    }
  ];

  const stats = [
    { label: 'Active Writers', value: '1000+' },
    { label: 'Published Stories', value: '5000+' },
    { label: 'Community Members', value: '10000+' },
    { label: 'Daily Readers', value: '5000+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About Our
            <span className="text-primary-500 block">Story Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're building a community where every voice matters, every story has value, 
            and every reader finds something that resonates with their soul.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              To democratize storytelling by providing a platform where anyone can share their experiences, 
              insights, and creativity with the world. We believe that every person has a unique perspective 
              worth sharing, and every story has the power to inspire, educate, or simply entertain.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              We're a passionate team of developers, designers, and storytellers dedicated to 
              creating the best possible platform for our community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Alex Johnson',
                  role: 'Founder & CEO',
                  bio: 'Passionate about democratizing storytelling and building inclusive communities.'
                },
                {
                  name: 'Sarah Chen',
                  role: 'Lead Developer',
                  bio: 'Full-stack developer with a love for creating seamless user experiences.'
                },
                {
                  name: 'Marcus Rodriguez',
                  role: 'Head of Design',
                  bio: 'Creative designer focused on making beautiful, accessible interfaces.'
                }
              ].map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Ready to share your story with the world? Start writing today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
