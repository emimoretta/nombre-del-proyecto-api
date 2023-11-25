const express = require('express');
const app = express();
const port = 3000; // El puerto en el que escuchará el servidor
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Twit = require('./models/twit');


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

    res.status(200).json({token, mensaje: 'Usuario registrado con éxito' });
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
    const token = jwt.sign({ userId: usuario._id }, 'secreto');
    res.status(200).json({token, mensaje: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.post('/crear-twit', async (req, res) => {
  try {
    // Extraer el token de la cabecera de autorización
    const token = req.headers.authorization.split(' ')[1];
    
    // Verificar y decodificar el token para obtener el ID del usuario
    const decodedToken = jwt.verify(token, 'secreto');
    const userId = decodedToken.userId;

    const { texto } = req.body;

    // Crear un nuevo twit con el ID del usuario, texto y fecha/hora
    const nuevoTwit = new Twit({
      userId,
      texto,
      fechaHora: new Date(),
      
    });

    // Guardar el twit en la base de datos
    await nuevoTwit.save();
    res.status(201).json({ mensaje: 'Twit creado exitosamente' });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el twit' });
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

