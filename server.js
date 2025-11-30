const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/video', (req, res) => {
    const range = req.headers.range;

    // 1. Check if the browser actually sent a range header
    if (!range) {
        return res.status(400).send("Requires Range header");
    }

    const videoPath = "video.mp4";
    const videoSize = fs.statSync(videoPath).size;

    // 2. Parse the Range Header: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // 3. Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // 4. Send the HTTP 206 (Partial Content) Header
    res.writeHead(206, headers);

    // 5. Create the video stream for this specific chunk and pipe it
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(8000, () => {
    console.log("Listening on port 8000!");
});