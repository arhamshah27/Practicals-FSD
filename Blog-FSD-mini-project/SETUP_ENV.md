# Environment Setup Guide

## Backend Environment Variables

Create a file named `.env` in the `backend/` directory with the following content:

```bash
# MongoDB Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://arhamshah27:Jilmom12jildad34_@cluster0.irg9ify.mongodb.net/blog_platform?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=de7671247060526f430a979550b8b3a7b15cfe70337f430f22c6691dea349036ebd2e8741bb49d136d34b48f0a44041eab591706165a07fd73aab8fa0479beb8
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# AI Services (Required for blog summarization)

# Google Gemini API (for AI features) - REQUIRED
GEMINI_API_KEY=AIzaSyByEYzkVN4QZiVoCh8ZcPaX3WVFuBZUOUI

# Cloudinary Configuration (for image uploads)
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for password reset, etc.)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

## Frontend Environment Variables

Create a file named `.env` in the `frontend/` directory with the following content:

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# WebSocket URL (for real-time chat)
REACT_APP_WS_URL=http://localhost:5000

# OpenAI API (if needed on frontend)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Google Analytics (optional)
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id

# Sentry (for error tracking, optional)
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Environment
REACT_APP_ENV=development
```

## Important Notes:

1. **Never commit `.env` files to version control** - they contain sensitive information
2. **Copy the example files** and rename them to `.env`
3. **Update the values** with your actual API keys and configuration
4. **For development**, you can use the localhost URLs as shown above
5. **For production**, update the URLs to your actual domain

## Required Services:

### MongoDB Atlas (✅ Already Configured)
- **Cluster**: cluster0.irg9ify.mongodb.net
- **Username**: arhamshah27
- **Database**: blog_platform
- **Connection**: Your credentials are already set up in the .env template above
- **Note**: Make sure your IP address is whitelisted in MongoDB Atlas Network Access

### Google Gemini API (✅ Required for AI Blog Summarizer)
- Sign up at [Google AI Studio](https://ai.google.dev/)
- Get your API key from the dashboard
- Add your API key to the backend `.env` file as `GEMINI_API_KEY`
- The AI summarizer uses `gemini-1.5-flash` by default

### Cloudinary (for image uploads)
- Sign up at [Cloudinary](https://cloudinary.com/)
- Get your cloud name, API key, and secret

### Email Service (optional)
- Use Gmail with App Password
- Or use services like SendGrid, Mailgun, etc.

## Quick Start (Development):

1. **Backend**: Copy `backend/config.env.example` to `backend/.env` and update with your credentials
2. **Frontend**: Copy `frontend/env.example` to `frontend/.env`
3. **Your MongoDB Atlas is already configured** with the credentials above
4. **JWT_SECRET is pre-generated** for you
5. **Start the servers**:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

## Your Current Configuration:

- **MongoDB Atlas**: ✅ Connected to cluster0.irg9ify.mongodb.net
- **Database**: blog_platform (will be created automatically)
- **Username**: arhamshah27
- **JWT Secret**: Pre-generated secure key
- **Backend Port**: 5000
- **Frontend Port**: 3000

## Security Checklist:

- [x] JWT_SECRET is at least 32 characters long
- [x] MongoDB connection string is secure
- [ ] API keys are kept private
- [ ] .env files are in .gitignore
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled

## Important MongoDB Atlas Setup:

1. **Network Access**: Go to MongoDB Atlas → Network Access → Add IP Address
2. **Add Your IP**: Click "Add IP Address" and add your current IP address
3. **Or Allow All**: For development, you can temporarily allow access from anywhere (0.0.0.0/0)
4. **Database User**: Your user `arhamshah27` should have read/write permissions
5. **Cluster Status**: Ensure your cluster is running and accessible

## Next Steps:

1. Create the `.env` files using the templates above
2. Get your OpenAI API key and add it to the backend `.env`
3. Whitelist your IP in MongoDB Atlas
4. Start the backend server to test the connection
5. Start the frontend to begin development

## AI Features Available:

- **AI Blog Summarizer**: Automatically generate blog excerpts using Google Gemini
- **Multiple Summary Styles**: Brief, Detailed, Bullet Points, and Key Insights
- **Mood Analysis**: Analyze content emotional tone
- **Content Suggestions**: Get AI-powered writing improvement tips
- **Smart Excerpts**: Generate engaging summaries for social media and previews
