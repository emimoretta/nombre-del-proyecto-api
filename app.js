const express = require('express');
const app = express();
const port = 3000; // El puerto en el que escuchará el servidor
const cors = require('cors');
const fs = require('fs');

// Habilita CORS para todas las rutas
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
    // Lee el archivo "twits.json" y envía su contenido como respuesta
    fs.readFile('twits.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al leer los twits' });
      } else {
        const twits = JSON.parse(data);
        res.json({ twits });
      }
    });
  });

// Iniciar el servidor
app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});

