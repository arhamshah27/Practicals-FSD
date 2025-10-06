// Import required modules
const express = require('express');
const session = require('express-session');
const path = require('path');

// Create an Express application
const app = express();
const port = 3002;

// Set up the view engine to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files (like CSS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure and use the express-session middleware
app.use(session({
  secret: 'a-secret-key-for-the-session',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true if using HTTPS
}));

// Middleware to check if the user is authenticated
const checkAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

// Route to display the login page
app.get('/', (req, res) => {
  res.render('login');
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    // Create a session for the user
    req.session.user = {
      name: username,
      loginTime: new Date().toLocaleTimeString(),
    };
    res.redirect('/profile');
  }
});

// Route to display the user's profile (protected)
app.get('/profile', checkAuth, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Route to handle user logout
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/profile');
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
