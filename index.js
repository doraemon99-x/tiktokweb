const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set view engine menggunakan EJS (opsional, tergantung kebutuhan Anda)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk membaca body dari request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Untuk serving static files seperti CSS

// Halaman utama
app.get('/', (req, res) => {
    res.render('index');
});

// Handler untuk form submit
app.post('/download', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.render('index', { error: 'URL tidak boleh kosong' });
    }

    try {
        const videoBuffer = await downloadVideo(url);
        res.set({
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'attachment; filename="video.mp4"'
        });
        res.send(videoBuffer);
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { error: 'Gagal mengunduh video. Silakan coba lagi.' });
    }
});

// Fungsi untuk mengunduh video dari URL menggunakan Cobalt API
function downloadVideo(url) {
    return new Promise((resolve, reject) => {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url };
        const headers = { 'Accept': 'application/json' };

        request.post({ url: api_url, json: payload, headers }, (err, response, body) => {
            if (err) {
                reject(`Gagal mengunduh video. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                reject(`Gagal mengunduh video. Status code: ${response.statusCode}`);
            } else {
                const video_url = body.url;
                
                // Menggunakan request untuk mengambil buffer dari video
                request.get({ url: video_url, encoding: null }, (err, response, videoBuffer) => {
                    if (err) {
                        reject(`Gagal mengunduh video. Error: ${err}`);
                    } else {
                        resolve(videoBuffer);
                    }
                });
            }
        });
    });
}

// Mulai server Express
app.listen(port, () => {
    console.log(`Website berjalan di http://localhost:${port}`);
});
