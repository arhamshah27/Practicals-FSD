import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiCopy, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AISummarizer = ({ content, onSummaryGenerated, currentSummary = '' }) => {
  const { theme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(currentSummary);
  const [summaryStyle, setSummaryStyle] = useState('brief');
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const summaryStyles = [
    { value: 'brief', label: 'Brief', description: '2-3 sentences' },
    { value: 'detailed', label: 'Detailed', description: '4-5 sentences' },
    { value: 'bullet', label: 'Bullet Points', description: 'Key points list' },
    { value: 'key_insights', label: 'Key Insights', description: '3-5 main insights' }
  ];

  const generateSummary = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.ai.generateSummary({
        content: content,
        style: summaryStyle
      });

      const generatedSummary = response.data.summary;
      setSummary(generatedSummary);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(generatedSummary);
      }

      toast.success('AI summary generated successfully!');
    } catch (error) {
      console.error('AI summary error:', error);
      toast.error('Failed to generate AI summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy summary');
    }
  };

  const clearSummary = () => {
    setSummary('');
    if (onSummaryGenerated) {
      onSummaryGenerated('');
    }
  };

  const handleStyleChange = (style) => {
    setSummaryStyle(style);
    setShowOptions(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Blog Summarizer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate intelligent summaries using AI (Gemini)
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Style Selector */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {summaryStyles.find(s => s.value === summaryStyle)?.label}
            </button>
            
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                >
                  {summaryStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleStyleChange(style.value)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        summaryStyle === style.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      } ${style.value === 'brief' ? 'rounded-t-lg' : ''} ${
                        style.value === 'key_insights' ? 'rounded-b-lg' : ''
                      }`}
                    >
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {style.description}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={generateSummary}
            disabled={isGenerating || !content.trim()}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Display */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                AI Generated Summary
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearSummary}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors"
                  title="Clear summary"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {summary}
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                <span>Style: {summaryStyles.find(s => s.value === summaryStyle)?.label}</span>
                <span>Words: {summary.split(' ').length}</span>
                <span>Characters: {summary.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          <strong>How it works:</strong> Our AI analyzes your blog content and generates a summary based on the selected style.
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Brief:</strong> Perfect for social media and previews</li>
          <li><strong>Detailed:</strong> Comprehensive overview for readers</li>
          <li><strong>Bullet Points:</strong> Easy-to-scan key takeaways</li>
          <li><strong>Key Insights:</strong> Most important learnings highlighted</li>
        </ul>
      </div>

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-xs text-white font-bold">!</span>
          </div>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> AI summaries are generated using Google Gemini. 
            Always review and edit the generated content to ensure accuracy and match your voice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummarizer;
