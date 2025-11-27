const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { runCompression, runDecompression } = require('./services/compressionService');

const app = express();
const port = 3000;


const uploadDir = 'uploads';
const compressedDir = 'compressed';
[uploadDir, compressedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });


app.use(express.static(path.join(__dirname, 'public')));


app.post('/compress', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    const originalFilename = req.file.originalname;
    const fileExt = path.extname(originalFilename).toLowerCase();
    const baseFilename = req.file.filename;

    console.log(`Processing file: ${originalFilename} (saved as ${inputPath})`);

  
    if (fileExt === '.txt' || fileExt === '.rtf' || fileExt === '.c' || fileExt === '.js' || fileExt === '.css' || fileExt === '.html' || fileExt === '.pdf') {
        console.log('Text file detected. Using C Huffman compression...');
        const outputFilename = `${baseFilename}.huff`;
        const outputPath = path.join(compressedDir, outputFilename);
        const downloadFilename = `${originalFilename}.huff`;

        try {
            await runCompression(inputPath, outputPath); 
            res.download(outputPath, downloadFilename, (err) => {
                if (err) console.error('Download error:', err);
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        } catch (error) {
            console.error('C Compression error:', error);
            res.status(500).send(error.message);
            fs.unlinkSync(inputPath); 
        }
    }

  
    else if (fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.png') {
        console.log(`Image file detected (${fileExt}). Using JS (sharp) compression...`);
        const outputFilename = `${baseFilename}_compressed${fileExt}`;
        const outputPath = path.join(compressedDir, outputFilename);
        const downloadFilename = `${path.basename(originalFilename, fileExt)}_compressed${fileExt}`;

        try {
            let sharpInstance = sharp(inputPath);

            if (fileExt === '.jpg' || fileExt === '.jpeg') {
                sharpInstance = sharpInstance.jpeg({ quality: 50 });
            }

            else if (fileExt === '.png') {
                sharpInstance = sharpInstance.png({ compressionLevel: 8 });
            }

            await sharpInstance.toFile(outputPath);

            res.download(outputPath, downloadFilename, (err) => {
                if (err) console.error('Download error:', err);
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        } catch (error) {
            console.error('Sharp Compression error:', error);
            res.status(500).send(error.message);
            fs.unlinkSync(inputPath);
        }
    }

    else {
        console.log(`File type ${fileExt} is not supported for compression.`);
        fs.unlinkSync(inputPath); 
        res.status(400).send(`File type (${fileExt}) is not compressible. Please upload a .txt, .js, .css, .html, .jpg, or .png file.`);
    }
});


app.post('/decompress', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    if (path.extname(req.file.originalname).toLowerCase() !== '.huff') {
        fs.unlinkSync(inputPath);
        return res.status(400).send('Invalid file. Please upload a .huff file to decompress.');
    }

    const outputFilename = req.file.filename.replace('.huff', '');
    const outputPath = path.join(compressedDir, outputFilename);
    const downloadFilename = req.file.originalname.replace('.huff', '');

    try {
        await runDecompression(inputPath, outputPath); 
        res.download(outputPath, downloadFilename, (err) => {
            if (err) console.error('Download error:', err);
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Decompression error:', error);
        res.status(500).send(error.message);
        fs.unlinkSync(inputPath);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Your frontend is now available!');
});