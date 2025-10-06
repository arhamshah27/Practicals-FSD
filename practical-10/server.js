const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Set view engine to handle HTML templates
app.set('view engine', 'ejs');

// Route to display the log viewer page
app.get('/', (req, res) => {
    res.render('index');
});

// API endpoint to read log file
app.get('/logs/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        // Ensure we only read .txt files from logs directory
        if (!filename.endsWith('.txt')) {
            throw new Error('Only .txt files are allowed');
        }

        const filePath = path.join(__dirname, 'logs', filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ success: true, content });
    } catch (error) {
        console.error('Error reading log file:', error);
        
        let errorMessage = 'An error occurred while reading the log file.';
        if (error.code === 'ENOENT') {
            errorMessage = 'Log file not found.';
            res.status(404);
        } else {
            res.status(500);
        }
        
        res.json({ success: false, error: errorMessage });
    }
});

// API endpoint to list available log files
app.get('/logs', async (req, res) => {
    try {
        const logsDir = path.join(__dirname, 'logs');
        const files = await fs.readdir(logsDir);
        const logFiles = files.filter(file => file.endsWith('.txt'));
        res.json({ success: true, files: logFiles });
    } catch (error) {
        console.error('Error reading logs directory:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error reading logs directory' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
