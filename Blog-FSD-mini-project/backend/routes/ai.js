const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generateSummary, analyzeMood, getContentSuggestions } = require('../library/helper');

// Stub TTS endpoint to prevent crashes; actual speech happens client-side
router.post('/speech', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    // Inform client to use Web Speech API locally
    return res.json({ success: true, message: 'Use client-side speech synthesis', data: { supported: true } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process speech request' });
  }
});

// Generate AI summary for blog content
router.post('/summary', auth, async (req, res) => {
  try {
    const { content, style = 'brief' } = req.body;

    if (!content || content.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 50 characters long'
      });
    }

    // Generate summary using AI provider
    const summary = await generateSummary(content, style === 'bullet' || style === 'key_insights' ? 200 : 150);
    
    res.json({
      success: true,
      data: {
        summary,
        style,
        wordCount: summary.split(' ').length,
        characterCount: summary.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI summary',
      error: error.message
    });
  }
});

// Analyze content mood
router.post('/mood', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 20 characters long'
      });
    }

    const mood = await analyzeMood(content);
    
    res.json({
      success: true,
      data: {
        mood,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze content mood',
      error: error.message
    });
  }
});

// Get content optimization suggestions
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { content, category = 'general' } = req.body;

    if (!content || content.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 100 characters long'
      });
    }

    const suggestions = await getContentSuggestions(content, category);
    
    res.json({
      success: true,
      data: {
        suggestions,
        category,
        count: suggestions.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Content suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content suggestions',
      error: error.message
    });
  }
});

// Generate multiple summary styles at once
router.post('/summaries', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 100 characters long'
      });
    }

    const styles = ['brief', 'detailed', 'bullet', 'key_insights'];
    const summaries = {};

    // Generate summaries for all styles
    for (const style of styles) {
      try {
        const summary = await generateSummary(content, style === 'bullet' || style === 'key_insights' ? 200 : 150);
        summaries[style] = {
          summary,
          wordCount: summary.split(' ').length,
          characterCount: summary.length
        };
      } catch (error) {
        summaries[style] = {
          error: 'Failed to generate summary for this style'
        };
      }
    }

    res.json({
      success: true,
      data: {
        summaries,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Multiple summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summaries',
      error: error.message
    });
  }
});

// Health check for AI services
router.get('/health', async (req, res) => {
  try {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      data: {
        gemini: hasGemini ? 'configured' : 'not_configured',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service health check failed',
      error: error.message
    });
  }
});

module.exports = router;
