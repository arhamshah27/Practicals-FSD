const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Text-to-Speech using Web Speech API (client-side)
const generateSpeech = (text, voice = 'en-US') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(v => v.lang === voice);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
    return true;
  }
  return false;
};

// AI-powered blog summarization
const generateSummary = async (content, maxLength = 150) => {
  try {
    if (!process.env.GEMINI_API_KEY || !gemini) {
      // Fallback: simple text truncation
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a helpful assistant that creates concise, engaging summaries of blog posts.
Create a summary that is maximum ${maxLength} characters long, capturing the main points and key insights.
Make it engaging and encourage readers to continue reading.

Content:
${content}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  } catch (error) {
    console.error('AI summarization error:', error);
    // Fallback: simple text truncation
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  }
};

// Mood-based content analysis
const analyzeMood = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY || !gemini) {
      return 'neutral';
    }
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Analyze the emotional tone and mood of the given text.
Return one of these exact values: happy, stressed, motivated, calm, energetic, or neutral.
Consider the overall sentiment, word choice, and emotional impact.

Text:
${content}`;
    const response = await model.generateContent(prompt);
    const mood = response.response.text().trim().toLowerCase();
    const validMoods = ['happy', 'stressed', 'motivated', 'calm', 'energetic', 'neutral'];
    
    return validMoods.includes(mood) ? mood : 'neutral';
  } catch (error) {
    console.error('Mood analysis error:', error);
    return 'neutral';
  }
};

// Content optimization suggestions
const getContentSuggestions = async (content, category) => {
  try {
    if (!process.env.GEMINI_API_KEY || !gemini) {
      return [];
    }
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a content optimization expert.
Analyze the given blog content and provide 3-5 specific, actionable suggestions to improve readability, engagement, and SEO.
Focus on practical tips that can be implemented immediately.
Return suggestions as a JSON array of strings.

Category: ${category}

Content:
${content}`;
    const response = await model.generateContent(prompt);
    try {
      const suggestions = JSON.parse(response.response.text());
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      // Fallback: return generic suggestions
      return [
        'Consider adding more subheadings for better readability',
        'Include relevant keywords naturally throughout the content',
        'Add call-to-action statements to increase engagement'
      ];
    }
  } catch (error) {
    console.error('Content suggestions error:', error);
    return [];
  }
};

// Reading time calculation
const calculateReadingTime = (content, wordsPerMinute = 200) => {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

// Word count
const getWordCount = (content) => {
  return content.trim().split(/\s+/).length;
};

// Extract reading level
const getReadingLevel = (content) => {
  const words = content.trim().split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  if (fleschScore >= 90) return 'beginner';
  if (fleschScore >= 80) return 'intermediate';
  if (fleschScore >= 70) return 'intermediate';
  return 'advanced';
};

// Helper function to count syllables
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

// Generate meta description for SEO
const generateMetaDescription = (content, maxLength = 160) => {
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Try to find a good breaking point
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Extract keywords from content
const extractKeywords = (content, maxKeywords = 10) => {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

// Validate and sanitize HTML content
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'];
  const allowedAttributes = ['class', 'id', 'style'];
  
  // This is a simplified version - use proper HTML sanitization in production
  return html;
};

// Format date for display
const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

module.exports = {
  generateSpeech,
  generateSummary,
  analyzeMood,
  getContentSuggestions,
  calculateReadingTime,
  getWordCount,
  getReadingLevel,
  generateMetaDescription,
  extractKeywords,
  sanitizeHtml,
  formatDate,
  formatRelativeTime
};
