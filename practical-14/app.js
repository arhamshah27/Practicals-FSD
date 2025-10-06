const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Multer Configuration ---

// 1. Define storage location
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Use a unique filename to avoid overwrites: timestamp + original name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 2. Create a file filter to allow only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file
        cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
};

// 3. Initialize multer with storage, size limits, and file filter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2 // 2 MB size limit
    },
    fileFilter: fileFilter
});


// --- Routes ---

// Route to display the upload form
app.get('/', (req, res) => {
    res.render('upload-form', { message: null, messageType: '' });
});

// Route to handle the file upload
// 'resume' is the name of the input field in the form
app.post('/upload', (req, res) => {
    // Use the upload middleware. The 'resume' string must match the name attribute in the form's input
    upload.single('resume')(req, res, function (err) {
        // Handle Multer-specific errors
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).render('upload-form', {
                    message: 'File is too large. Maximum size is 2MB.',
                    messageType: 'error'
                });
            }
            // A Multer error occurred when uploading.
            return res.status(400).render('upload-form', { message: err.message, messageType: 'error' });
        } else if (err) {
            // An unknown error occurred (e.g., our custom file type error)
            return res.status(400).render('upload-form', { message: err.message, messageType: 'error' });
        }

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).render('upload-form', {
                message: 'Please select a file to upload.',
                messageType: 'error'
            });
        }

        // If everything is fine, send a success message
        res.render('upload-form', {
            message: `File "${req.file.originalname}" uploaded successfully!`,
            messageType: 'success'
        });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
