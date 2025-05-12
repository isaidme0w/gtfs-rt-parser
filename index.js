const express = require('express');
const axios = require('axios');
const protobuf = require('protobufjs');

const app = express();
const PORT = 3000;

app.get('/gtfs-rt', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('Brak parametru url');
    }
    
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const root = await protobuf.load('gtfs-realtime.proto');
        const FeedMessage = root.lookupType('transit_realtime.FeedMessage');
        const message = FeedMessage.decode(new Uint8Array(response.data));
        const object = FeedMessage.toObject(message, { longs: String, enums: String, bytes: String });
        
        res.json(object);
        console.log(`Plik GTFS-RT pod adresem '${url}' zwrócony pomyślnie.`);
    } catch (error) {
        res.status(500).send(`Błąd podczas pobierania lub przetwarzania pliku: ${error.message}`);
        console.log(`Błąd podczas pobierania lub przetwarzania pliku: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});