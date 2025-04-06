/* Librerias necesarias */

const express = require('express'); // Servidor web
const bodyParser = require('body-parser'); // Para poder leer los datos JSON que llegan en peticiones post
const AWS = require('aws-sdk'); // para usar DynamoDB (la base de datos en AWSs)
const nodemailer = require('nodemailer'); // Para enviar correos
const cors = require('cors'); // Para comunicar front y back aunque esten en dominios distintos 
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
require('dotenv').config({ path: 'local.env' }); // para usar variables de entorno



const app = express(); // crea una instancia del servidor llamada app
const port = process.env.PORT || 3000; // elegimos la puerta de entrada al servidor



AWS.config.update({ // conectamos nuestro Backend Con nuestro servicio de AWS
    region: 'eu-west-1', // Seleccionamos la region 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // keys guardadas en el archivo de variables de entorno
});



app.use(cors({  //habilita cors. 
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500', // esto es como decir "Permito que el navegador desde esta direccion haga peticiones a mi servidor express  que corre en esta otra"
    credentials: true,
}));


app.use(bodyParser.json()); // permite que express entienda los datos del JSON que el font manda en las peticiones


const dynamoDB = new AWS.DynamoDB.DocumentClient(); // creamos un cliente que nos permite facilmente hacer operaciones CRUD en la base de datos  

// backend/index.js
app.get('/api/google-maps-key', (req, res) => {
    console.log('Recibiendo solicitud para la clave de Google Maps');
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY});
});



// Obtener todos los usuarios
app.get('/users', async (req, res) => { // Peticion tipo get con una solicitud(req y una respuesta res) ademas asincrona para dar tiempo a la busqueda en la base de datos
    const params = {
        TableName: 'usuarios', //nombre de la tabla
    };

    try {
        const data = await dynamoDB.scan(params).promise(); // scan recupera todos los elementos de la tabla  y promise lo convierte la operacion en una promesa, await permite que se espere el resultado de la operacion
        res.json(data.Items); // si la operacion es exitosa de vuelve los items que son los usuarios en formato json
    } catch (error) {
        console.error('Error al obtener los usuarios:', error); // si hay algun error se captura y devuelve error 500
        res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }
});




// Registro de nuevo usuario
app.post('/register', async (req, res) => { // peticion tipo post
    const { nombre, direccion, telefono, dni, edad, email, password } = req.body; // hacemos destructurin del cuerpo  de la solucitud

    if (!password || password.length < 6) {  // pedimos que la contraseña tenga almenos 6 caracteres
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // encriptamos la contraseña , 10 concretamente es el numero de veces que lo hacemos , usamos await para esperar a que termine la encriptacion

        const newUser = { // se crea el objeto nuevo usuario con los datos del usuario
            TableName: 'usuarios',
            Item: {
                email,                // Email como clave primaria
                nombre,
                direccion,
                telefono,
                dni,
                edad,
                password: hashedPassword,
                tipoUsuario: 1,       // No validado
                estado: 'no cobrado', // Estado inicial
                createdAt: new Date().toISOString(), // fecha de creacion
            },
        };

        await dynamoDB.put(newUser).promise(); // con put añadimos el nuevo usuario a la base de datos una promesa que espera a que la operacion termine antes de seguir con el flujo

        const transporter = nodemailer.createTransport({ // esta es una fucion proporcionada por la libreria que crea una instancia que conecta un servicio de correo electronico  para enviar correos
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // credenciales de google
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // nuestro correo
            to: email, // envia al correo ingresado por el usuario
            subject: 'Confirma tu registro en FrailesFit', // un correo con el siguiente asunto
            html: ` y el siguiente cuerpo
        <p>Hola ${nombre},</p>
        <p>Gracias por registrarte en FrailesFit. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>
        <a href="http://${process.env.API_DOMAIN || 'localhost:3000'}/confirm/${email}">Confirmar cuenta</a>
      `,
        };

        transporter.sendMail(mailOptions, (error, info) => { // sendmail es un metodo para enviar un email (mailoptions es el cuerpo de nuestro email, ) (error ,info) es una funcion de callback que se ejecuta cuando el intento de envio a terminado 

            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ message: 'Error al enviar el correo de confirmación.' });// respuesta error 500 + mensaje 
            }
            res.status(200).json({ message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' });// su hubo exito respuesta 200 + mensaje 
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Hubo un problema al registrar el usuario.' }); // capturamos errores desde el hash de la contraseña (internal server error)
    }
});




// Confirmación de cuenta, cuando pinchamos en el enlace que mandamos, esta es la labor de este endpoint
app.get('/confirm/:email', async (req, res) => { // tipo get con el parametro dinamico que es el correo, asincrona ya que tendremos que haer un update a la DynamoDB 
    const { email } = req.params; // ejemplo /confirm/toni@gmail.com

    const updateParams = { // definimos el objeto para actualizar el tipo de usuario en la base de datos
        TableName: 'usuarios', // tabla a la que pertenecee
        Key: {
            email: email, // Usamos la clave primaria para buscar al usuario.
        }, // estas expresiones son la sintaxis especifica de DynamoDB 
        UpdateExpression: 'SET tipoUsuario = :tipo',
        ExpressionAttributeValues: {
            ':tipo': 2, // Validado
        },
    };

    try {
        await dynamoDB.update(updateParams).promise(); // hacemos la actulizacion en dynamoDB
        res.send('Tu cuenta ha sido confirmada. ¡Ya puedes ingresar con tu usuario!'); // damos al usuario el siguiente mensaje
    } catch (error) {
        console.error('Error al confirmar:', error); // añadimos el error 500 por si algo falla 
        res.status(500).send('Hubo un error al confirmar la cuenta.');
    }
});





// Login de usuario
app.post('/login', async (req, res) => {  // endPoit de tipo post donde vamos a enviar email y contraseña

    const { email, password } = req.body; // extremos correo y contraseña que el usuario han introducido

    // para leer este tipo de contenido es que necesitamos express.json

    const params = { // buscamos dentro de la tabla usuarios por email (clave primaria)
        TableName: 'usuarios',
        Key: {
            email: email,
        },
    };

    try {
        const result = await dynamoDB.get(params).promise(); // Buscamnos dentro de la base de datos un usuario con ese email.
        // devuelve sus datos si exsiste

        const user = result.Item; // usuario en la base de datos

        if (!user) { // mensaje cuando no se encuentra un usuario
            return res.status(401).json({ message: 'Usuario no encontrado.' }); // 401 , no autorizado
        }

        if (user.tipoUsuario !== 2) { // cuando el tipo de usuario es diferente a 2
            return res.status(401).json({ message: 'Cuenta no confirmada.' });
        }

        const match = await bcrypt.compare(password, user.password); // comparamos las contraseñas

        if (!match) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        // si es correcto respontemos con un 200 y con los datos del usuario
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            nombre: user.nombre,
            email: user.email,
            estado: user.estado,
            tipoUsuario: user.tipoUsuario,
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error); // si ocurre cualquier otro error dentro del try imprimimos error 500
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});


// Iniciar servidor, esto arranca el servidor express y lo pone a escuchar peticiones Http
app.listen(port, '0.0.0.0', () => { // 0.0.0.0 REPRESENTA todas las interfaces de red disponibles
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
