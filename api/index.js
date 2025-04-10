/* Librerias necesarias */

const express = require('express'); // Servidor web
const bodyParser = require('body-parser'); // Para poder leer los datos JSON que llegan en peticiones post
const AWS = require('aws-sdk'); // para usar DynamoDB (la base de datos en AWSs)
const nodemailer = require('nodemailer'); // Para enviar correos
const cors = require('cors'); // Para comunicar front y back aunque esten en dominios distintos 
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
require('dotenv').config({ path: 'local.env' }); // para usar variables de entorno
const { v4: uuidv4 } = require('uuid');




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
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
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

// Eliminar un usuario
app.delete('/users/:email', async (req, res) => {
    const { email } = req.params; // Obtenemos el email del parámetro de la URL

    const params = {
        TableName: 'usuarios',
        Key: {
            email: email, // Usamos el email como clave primaria
        },
    };

    try {
        await dynamoDB.delete(params).promise(); // Eliminamos el usuario de la base de datos
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ error: 'No se pudo eliminar el usuario' });
    }
});



// Actualizar usuario
app.put('/users/:email', async (req, res) => {
    const email = req.params.email;
    const updatedUser = req.body; // Datos del usuario actualizado

    const params = {
        TableName: 'usuarios',
        Key: { email }, // La clave primaria es el email
        UpdateExpression: 'set #nombre = :nombre, #apellidos = :apellidos, #direccion = :direccion, #telefono = :telefono, #dni = :dni, #edad = :edad, #tipoUsuario = :tipoUsuario',
        ExpressionAttributeNames: {
            '#nombre': 'nombre',
            '#apellidos': 'apellidos',  // Añadido
            '#direccion': 'direccion',
            '#telefono': 'telefono',
            '#dni': 'dni',
            '#edad': 'edad',
            '#tipoUsuario': 'tipoUsuario',
        },
        ExpressionAttributeValues: {
            ':nombre': updatedUser.nombre,
            ':apellidos': updatedUser.apellidos,  // Añadido
            ':direccion': updatedUser.direccion,
            ':telefono': updatedUser.telefono,
            ':dni': updatedUser.dni,
            ':edad': updatedUser.edad,
            ':tipoUsuario': updatedUser.tipoUsuario,
        },
        ReturnValues: 'ALL_NEW', // Devuelve todos los atributos del usuario actualizado
    };

    try {
        const result = await dynamoDB.update(params).promise(); // Actualizar el usuario en la base de datos
        res.json(result.Attributes); // Devolver el usuario actualizado
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ error: 'No se pudo actualizar el usuario' });
    }
});



// Registro de nuevo usuario
app.post('/register', async (req, res) => {
    const { nombre, apellidos, direccion, telefono, dni, edad, email, password } = req.body;

    // Validación de campos obligatorios
    if (!email || !nombre || !apellidos || !direccion || !telefono || !dni || !edad || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (email, nombre, apellidos, etc.)' });
    }

    if (!password || password.length < 6) {  // pedimos que la contraseña tenga almenos 6 caracteres
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // encriptamos la contraseña

        const newUser = { // se crea el objeto nuevo usuario con los datos del usuario
            TableName: 'usuarios',
            Item: {
                email,
                nombre,
                apellidos,
                direccion,
                telefono,
                dni,
                edad,
                password: hashedPassword,
                tipoUsuario: 1,  // No validado
                createdAt: new Date().toISOString(),  // Fecha de creación
            },
        };

        await dynamoDB.put(newUser).promise(); // guardamos el usuario en la base de datos

        // Añadimos el pago base en la tabla PagosUsuarios
        const fechaActual = new Date();
        const nombreMes = fechaActual.toLocaleString('es-ES', { month: 'long' }); // abril, mayo, etc.
        const anioActual = fechaActual.getFullYear();
        const numeroMes = fechaActual.getMonth() + 1; // enero = 0, así que sumamos 1
        const mesAnio = `${anioActual}-${String(numeroMes).padStart(2, '0')}`; // Ejemplo: 2025-04

        const nuevoPago = {
            TableName: 'Pagos',
            Item: {
                email,
                mes_anio: mesAnio,         // <-- Aquí añadimos la Sort Key
                nombre,
                apellidos,
                mes: nombreMes,
                anio: anioActual,
                estado: 'no pagado',
                fechaPago: '',
                cantidad: '',
                metodo: ''
            }
        };

        await dynamoDB.put(nuevoPago).promise(); // Guardamos el pago inicial

        // Envío de correo de confirmación
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"FrailesFit" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Confirma tu registro en FrailesFit',
            text: `Hola ${nombre},\n\nGracias por registrarte en FrailesFit.\n\nConfirma tu cuenta haciendo clic en el siguiente enlace:\nhttp://${process.env.API_DOMAIN || 'localhost:3000'}/confirm/${email}\n\nSi no has solicitado este registro, puedes ignorar este mensaje.\n\nUn saludo,\nEl equipo de FrailesFit`,
            html: `
                <p>Hola ${nombre},</p>
                <p>Gracias por registrarte en <strong>FrailesFit</strong>.</p>
                <p>Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
                <p><a href="http://${process.env.API_DOMAIN || 'localhost:3000'}/confirm/${email}">Confirmar cuenta</a></p>
                <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
                <p style="color: gray;">Un saludo,<br>El equipo de FrailesFit</p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ message: 'Error al enviar el correo de confirmación.' });
            }
            res.status(200).json({ message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' });
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Hubo un problema al registrar el usuario.' });
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
        const tipoUsuario = Number(user.tipoUsuario);

        if (tipoUsuario !== 2 && tipoUsuario !== 0) {
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
            tipoUsuario: user.tipoUsuario,
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error); // si ocurre cualquier otro error dentro del try imprimimos error 500
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});



// pagos 
app.get('/api/pagos', async (req, res) => {
    const params = {
        TableName: 'Pagos',
    };

    try {
        const result = await dynamoDB.scan(params).promise();
        res.json(result.Items); // Devuelve todos los pagos como JSON
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ message: 'Error al obtener los pagos' });
    }
});


// actualizar un pago
app.put('/api/pagos/:email/:mes_anio', async (req, res) => {
    const email = req.params.email;
    const mes_anio = req.params.mes_anio; // Ej: '2025-04'
    const updatedData = req.body;

    const updateParams = {
        TableName: 'Pagos',
        Key: {
            email: email,
            mes_anio: mes_anio
        },
        UpdateExpression: 'set mes = :mes, anio = :anio, estado = :estado, fechaPago = :fechaPago, cantidad = :cantidad, metodo = :metodo',
        ExpressionAttributeValues: {
            ':mes': updatedData.mes,
            ':anio': updatedData.anio,
            ':estado': updatedData.estado,
            ':fechaPago': updatedData.fechaPago,
            ':cantidad': updatedData.cantidad,
            ':metodo': updatedData.metodo,
        },
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const result = await dynamoDB.update(updateParams).promise();
        res.json({ message: 'Pago actualizado correctamente', updatedAttributes: result.Attributes });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el pago', error: error.message });
    }
});


// borrar un pago
app.delete('/api/pagos/:email/:mes_anio', async (req, res) => {
    const { email, mes_anio } = req.params;

    const deleteParams = {
        TableName: 'Pagos',
        Key: {
            email,
            mes_anio
        },
    };

    try {
        await dynamoDB.delete(deleteParams).promise();
        console.log(`Pago eliminado: ${email}, ${mes_anio}`);
        res.json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el pago:', error.message);
        res.status(500).json({ message: 'Error al eliminar el pago', error: error.message });
    }
});


// Ruta para guardar un nuevo pago
app.post('/api/pagos/nuevo', async (req, res) => {
    const { email, nombre, apellidos, mes, anio, cantidad, fechaPago, estado, metodo } = req.body;

    // Verificación de campos obligatorios
    if (!email || !mes || !anio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (email, mes o año)' });
    }

    // Generación del campo mes_anio
    const mes_anio = `${anio}-${String(mes).padStart(2, '0')}`;

    // Datos para almacenar en DynamoDB
    const newPago = {
        TableName: 'Pagos',  // Nombre de tu tabla en DynamoDB
        Item: {
            email: email,
            nombre: nombre,
            apellidos: apellidos,
            mes: mes,
            anio: anio,
            cantidad: cantidad,
            fechaPago: fechaPago,
            estado: estado || 'no pagado',  // Si no se especifica el estado, se asume 'no pagado'
            mes_anio: mes_anio,
            metodo: metodo,
        }
    };

    try {
        // Guardar el pago en DynamoDB
        await dynamoDB.put(newPago).promise();

        // Responder con éxito
        res.status(200).json({ message: 'Nuevo pago creado correctamente' });
    } catch (error) {
        console.error('Error al guardar el pago en DynamoDB:', error);
        res.status(500).json({ message: 'Hubo un error al guardar el pago en la base de datos.' });
    }
});





// Ruta para añadir un ejercicio
app.post('/ejercicios', async (req, res) => {
    const { nombre, imagenUrl, grupoMuscular } = req.body;

    // Genera un ejercicioId único
    const ejercicioId = `${grupoMuscular.toLowerCase()}-${uuidv4()}`;

    const params = {
        TableName: 'Ejercicios',
        Item: {
            ejercicioId,
            nombre,
            imagenUrl,
            grupoMuscular,
            repeticiones: "",  // Campo vacío
            observaciones: ""  // Campo vacío
        },
    };

    try {
        // Realiza la operación de inserción en DynamoDB con el SDK v2
        await dynamoDB.put(params).promise();
        res.status(200).json({ message: 'Ejercicio añadido exitosamente', ejercicioId });
    } catch (error) {
        console.error('Error añadiendo ejercicio:', error);
        res.status(500).json({ error: 'Error al añadir el ejercicio' });
    }
});



// Iniciar servidor, esto arranca el servidor express y lo pone a escuchar peticiones Http
app.listen(port, '0.0.0.0', () => { // 0.0.0.0 REPRESENTA todas las interfaces de red disponibles
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
