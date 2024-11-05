const express = require('express');
const multer = require('multer');
const path = require('path');
const { transformXML } = require('./src/services/transformer');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Static files
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Copy existing XSL and CSS files
// Reference to: src/xsl/xrechnung-viewer.css
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Main route
app.get('/', (req, res) => {
    res.render('index');
});

// Upload handler
app.post('/upload', upload.single('xrechnung'), async (req, res) => {
    try {
        const result = await transformXML(req.file.path);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 