const express = require('express');
const app = express();
const port = 3000; // El puerto en el que escuchará el servidor
const cors = require('cors');
const fs = require('fs');


const sql = require('mssql');

const config = {
  user: 'DESKTOP-03D2CE7\\Emi',
  server: 'DESKTOP-03D2CE7\\SQLEXPRESS',
  database: 'Think',
  options: {
    encrypt: true, // Si tu servidor SQL Server utiliza SSL
  },
};

app.use(express.json());

// Ruta para el registro de usuarios
app.post('/registrar', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Conectarse a SQL Server
    await sql.connect(config);

    // Ejecutar una consulta SQL para insertar el usuario en la base de datos
    const request = new sql.Request();
    const query = `INSERT INTO Usuarios (email, password) VALUES ('${email}', '${password}')`;

    await request.query(query);

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  } finally {
    // Cerrar la conexión a SQL Server
    sql.close();
  }
});

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

