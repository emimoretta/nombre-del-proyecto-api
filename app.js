const express = require('express');
const app = express();
const port = 3000; // El puerto en el que escuchará el servidor
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/think', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definición del modelo de usuario
const Usuario = mongoose.model('Usuario', {
  email: String,
  password: String,
});

// Ruta para manejar la solicitud de registro de usuario
app.post('/registrar', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya está registrado' });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario con los datos recibidos
    const nuevoUsuario = new Usuario({
      email: email,
      password: hashedPassword,
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    res.status(200).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/iniciar-sesion', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por su email
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseñas hasheadas
    const contrasenaValida = await bcrypt.compare(password, usuario.password);

    if (!contrasenaValida) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


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

