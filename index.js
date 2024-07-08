const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set view engine menggunakan EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk membaca body dari request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Untuk serving static files seperti CSS

// Halaman utama
app.get('/', (req, res) => {
    res.render('index');
});

// Handler untuk form submit video
app.post('/download', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.render('index', { error: 'URL tidak boleh kosong' });
    }

    try {
        const videoBuffer = await downloadVideo(url);
        res.set({
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${generateRandomFileName('mp4')}"`
        });
        res.send(videoBuffer);
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { error: 'Gagal mengunduh video. Silakan coba lagi.' });
    }
});

// Handler untuk form submit MP3
app.post('/download-mp3', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.render('index', { error: 'URL tidak boleh kosong' });
    }

    try {
        const audioBuffer = await downloadMP3(url);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${generateRandomFileName('mp3')}"`
        });
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { error: 'Gagal mengunduh MP3. Silakan coba lagi.' });
    }
});

// Fungsi untuk mengunduh video dari URL menggunakan Cobalt API
function downloadVideo(url) {
    return new Promise((resolve, reject) => {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url, vQuality: '1080' };
        const headers = { 'Accept': 'application/json' };

        request.post({ url: api_url, json: payload, headers }, (err, response, body) => {
            if (err) {
                reject(`Gagal mengunduh video. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                reject(`Gagal mengunduh video. Status code: ${response.statusCode}`);
            } else {
                if (body.status === 'redirect') {
                    resolve(downloadFromRedirect(body.url));
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
            }
        });
    });
}

// Fungsi untuk mengunduh MP3 dari URL menggunakan Cobalt API
function downloadMP3(url) {
    return new Promise((resolve, reject) => {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url, vQuality: '1080', isAudioOnly: 'true', isTTFullAudio: true };
        const headers = { 'Accept': 'application/json' };

        request.post({ url: api_url, json: payload, headers }, (err, response, body) => {
            if (err) {
                reject(`Gagal mengunduh MP3. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                reject(`Gagal mengunduh MP3. Status code: ${response.statusCode}`);
            } else {
                if (body.status === 'redirect') {
                    resolve(downloadFromRedirect(body.url));
                } else {
                    const audio_url = body.url;
                    // Menggunakan request untuk mengambil buffer dari audio
                    request.get({ url: audio_url, encoding: null }, (err, response, audioBuffer) => {
                        if (err) {
                            reject(`Gagal mengunduh MP3. Error: ${err}`);
                        } else {
                            resolve(audioBuffer);
                        }
                    });
                }
            }
        });
    });
}

// Fungsi untuk mengunduh dari URL redirect
function downloadFromRedirect(url) {
    return new Promise((resolve, reject) => {
        request.get({ url, encoding: null }, (err, response, buffer) => {
            if (err) {
                reject(`Gagal mengunduh file. Error: ${err}`);
            } else {
                resolve(buffer);
            }
        });
    });
}

// Fungsi untuk menghasilkan nama file acak
function generateRandomFileName(extension) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `file_${timestamp}_${random}.${extension}`;
}

// Mulai server Express
app.listen(port, () => {
    console.log(`Website berjalan di http://localhost:${port}`);
});
