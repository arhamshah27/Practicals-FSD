// Import required modules
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

// Create an Express application
const app = express();
const port = 3003;

// Set up the view engine to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files (like CSS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to display the contact form
app.get('/', (req, res) => {
  res.render('index', { message: null, error: null });
});

// Route to handle the form submission and send the email
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.render('index', { message: null, error: 'All fields are required.' });
  }

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Set up email data
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Your email address
    subject: `New message from ${name} via portfolio contact form`,
    text: `You have received a new message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.render('index', { message: null, error: 'Failed to send message. Please try again later.' });
    }
    res.render('index', { message: 'Your message has been sent successfully!', error: null });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
