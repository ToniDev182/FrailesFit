/* ===============================
   Librerías necesarias
   =============================== */

const express = require('express'); // Servidor web
const bodyParser = require('body-parser'); // Para poder leer los datos JSON que llegan en peticiones post
const fs = require("fs"); // Es un módulo nativo de Node.js para interactuar con el sistema de archivos
const AWS = require('aws-sdk'); // Para usar DynamoDB (la base de datos en AWS)
const cors = require('cors'); // Para comunicar front y back aunque estén en dominios distintos
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
require('dotenv').config({ path: 'local.env' }); // Para usar variables de entorno
const { v4: uuidv4 } = require('uuid'); // Crea un id de forma aleatoria
const nodemailer = require("nodemailer"); // Para enviar correos
const PDFDocument = require("pdfkit"); // Para generar archivos PDF en Node.js
const axios = require('axios'); // Para hacer peticiones HTTP, en este caso para meter imágenes en el PDF


// Crear instancia del servidor Express
const app = express();

// Puerto (por defecto  si no se especifica otro en las variables de entorno)
const port = process.env.PORT;

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor HTTP escuchando en el puerto ${port}`);
});

/* ===============================
   Configuración AWS DynamoDB
   =============================== */

AWS.config.update({
    region: 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient(); // Cliente para operaciones CRUD


/* ===============================
   Middlewares
   =============================== */

// Habilita CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

// Permite leer datos en formato JSON en las peticiones POST
app.use(bodyParser.json());
app.use(express.json());


/* ===============================
   Rutas
   =============================== */

// Ruta de prueba
app.get('/prueba', (req, res) => {
    console.log('>> Se ha accedido a /prueba');
    res.json({ msg: 'OK desde HTTPS' });
});

// Ruta para obtener la clave de Google Maps
app.get('/api/google-maps-key', (req, res) => {
    console.log('Recibiendo solicitud para la clave de Google Maps');
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});



// Obtener todos los usuarios
app.get('/users', async (req, res) => {
    // Petición tipo GET con una solicitud (req) y una respuesta (res)
    // Además, es asincrónica para esperar a la búsqueda en la base de datos

    const params = {
        TableName: 'usuarios', // nombre de la tabla en DynamoDB
    };

    try {
        // scan recupera todos los elementos de la tabla 
        // y .promise() convierte la operación en una promesa
        const data = await dynamoDB.scan(params).promise();

        // Ordenamos los usuarios por nombre y, si hay empate, por apellidos
        const usuariosOrdenados = data.Items.sort((a, b) => {
            const nombreA = a.nombre?.toLowerCase() || '';      // Prevención si viene nulo
            const nombreB = b.nombre?.toLowerCase() || '';
            const apellidosA = a.apellidos?.toLowerCase() || '';
            const apellidosB = b.apellidos?.toLowerCase() || '';

            if (nombreA === nombreB) {
                return apellidosA.localeCompare(apellidosB); // Si los nombres son iguales, compara apellidos
            }

            return nombreA.localeCompare(nombreB); // Si no, compara por nombre
        });

        // Si la operación es exitosa devuelve los usuarios ordenados en formato JSON
        res.json(usuariosOrdenados);
    } catch (error) {
        // Si hay algún error se captura y se devuelve error 500
        console.error('Error al obtener los usuarios:', error);
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
    const emailAntiguo = req.params.email;
    const usuarioActualizado = req.body;
    const emailNuevo = usuarioActualizado.email;

    try {
        if (emailAntiguo !== emailNuevo) {
            // 1. Crear nuevo usuario con el nuevo email
            await dynamoDB.put({
                TableName: 'usuarios',
                Item: usuarioActualizado,
            }).promise();

            // 2. Eliminar usuario antiguo
            await dynamoDB.delete({
                TableName: 'usuarios',
                Key: { email: emailAntiguo },
            }).promise();

            return res.json({ mensaje: 'Usuario actualizado con nuevo email' });
        } else {
            // Si el email no cambió, simplemente actualiza los demás campos
            const params = {
                TableName: 'usuarios',
                Key: { email: emailAntiguo },
                UpdateExpression: 'set #nombre = :nombre, #apellidos = :apellidos, #direccion = :direccion, #telefono = :telefono, #dni = :dni, #edad = :edad, #tipoUsuario = :tipoUsuario',
                ExpressionAttributeNames: {
                    '#nombre': 'nombre',
                    '#apellidos': 'apellidos',
                    '#direccion': 'direccion',
                    '#telefono': 'telefono',
                    '#dni': 'dni',
                    '#edad': 'edad',
                    '#tipoUsuario': 'tipoUsuario',
                },
                ExpressionAttributeValues: {
                    ':nombre': usuarioActualizado.nombre,
                    ':apellidos': usuarioActualizado.apellidos,
                    ':direccion': usuarioActualizado.direccion,
                    ':telefono': usuarioActualizado.telefono,
                    ':dni': usuarioActualizado.dni,
                    ':edad': usuarioActualizado.edad,
                    ':tipoUsuario': usuarioActualizado.tipoUsuario,
                },
                ReturnValues: 'ALL_NEW',
            };

            const result = await dynamoDB.update(params).promise();
            res.json(result.Attributes);
        }
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
            text: `Hola ${nombre},\n\nGracias por registrarte en FrailesFit.\n\nConfirma tu cuenta haciendo clic en el siguiente enlace:\nhttps://${process.env.API_DOMAIN}/confirm/${email}\n\nSi no has solicitado este registro, puedes ignorar este mensaje.\n\nUn saludo,\nEl equipo de FrailesFit`,
            html: `
                <p>Hola ${nombre},</p>
                <p>Gracias por registrarte en <strong>FrailesFit</strong>.</p>
                <p>Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
                <p><a href="https://${process.env.API_DOMAIN}/confirm/${email}">Confirmar cuenta</a></p>
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



// Obtener todos los pagos
app.get('/api/pagos', async (req, res) => {
    // Petición tipo GET con una solicitud (req) y una respuesta (res)
    // Es asincrónica para esperar a la operación de base de datos

    const params = {
        TableName: 'Pagos', // nombre de la tabla en DynamoDB
    };

    try {
        // Recuperamos todos los pagos de la tabla
        const data = await dynamoDB.scan(params).promise();

        // Ordenamos los pagos por nombre y, si hay empate, por apellidos
        const pagosOrdenados = data.Items.sort((a, b) => {
            const nombreA = a.nombre?.toLowerCase() || '';
            const nombreB = b.nombre?.toLowerCase() || '';
            const apellidosA = a.apellidos?.toLowerCase() || '';
            const apellidosB = b.apellidos?.toLowerCase() || '';

            if (nombreA === nombreB) {
                return apellidosA.localeCompare(apellidosB); // Compara apellidos si los nombres son iguales
            }

            return nombreA.localeCompare(nombreB); // Compara por nombre si son diferentes
        });

        // Si todo va bien, devolvemos los pagos ordenados en formato JSON
        res.json(pagosOrdenados);
    } catch (error) {
        // Si ocurre un error, lo capturamos y enviamos un error 500
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


app.post('/api/pagos', async (req, res) => {
    const data = req.body;

    // Validación básica de datos
    if (!data.email || !data.mes_anio || !data.mes || !data.anio || !data.estado || !data.metodo) {
        return res.status(400).json({ message: 'Faltan datos necesarios para el pago' });
    }

    const params = {
        TableName: 'Pagos',
        Item: {
            email: data.email,
            mes_anio: data.mes_anio,
            mes: data.mes,
            anio: data.anio,
            estado: data.estado,
            fechaPago: data.fechaPago || new Date().toISOString(), // Si no se pasa una fecha, se usa la actual
            cantidad: data.cantidad,
            metodo: data.metodo,
            nombre: data.nombre,
            apellidos: data.apellidos
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).json({ message: 'Pago insertado correctamente' });
    } catch (error) {
        console.error('Error al insertar el pago:', error);
        res.status(500).json({
            message: 'Error al insertar el pago',
            error: error.message
        });
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


/////////////////////// Ejercios (Rutinas) ///////////////////////


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
        // Realiza la operación de inserción en DynamoDB 
        await dynamoDB.put(params).promise();
        res.status(200).json({ message: 'Ejercicio añadido exitosamente', ejercicioId });
    } catch (error) {
        console.error('Error añadiendo ejercicio:', error);
        res.status(500).json({ error: 'Error al añadir el ejercicio' });
    }
});



// Ruta para obtener todos los ejercicios
app.get('/ejercicios', async (req, res) => {
    const params = {
        TableName: 'Ejercicios',
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.status(200).json({
            message: 'Ejercicios obtenidos correctamente',
            ejercicios: data.Items,
        });
    } catch (error) {
        console.error('Error obteniendo ejercicios:', error);
        res.status(500).json({ error: 'Error al obtener los ejercicios' });
    }
});


// Endpoint para guardar la rutina
app.post('/rutinas', async (req, res) => {
    const { email, nombre, rutina } = req.body;


    if (!email || !rutina || !nombre) {
        return res.status(400).json({ error: "El email, nombre y rutina son obligatorios" });
    }

    const params = {
        TableName: "Rutinas",
        Item: {
            email: email,
            nombre: nombre,
            rutina: rutina,
            ultimaActualizacion: new Date().toISOString(),
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(200).json({ message: "Rutina guardada correctamente" });
    } catch (error) {
        console.error("Error al guardar la rutina:", error);
        res.status(500).json({ error: "Hubo un error al guardar la rutina" });
    }
});

// Endpoint para obtener la rutina por correo
app.get('/rutinas/:email', async (req, res) => {
    const { email } = req.params;

    const params = {
        TableName: 'Rutinas',
        Key: { email }
    };

    try {
        const data = await dynamoDB.get(params).promise();

        if (data.Item && data.Item.rutina) {

            res.status(200).json({
                nombre: data.Item.nombre || '',
                ultimaActualizacion: data.Item.ultimaActualizacion || '',
                rutina: data.Item.rutina
            });
        } else {
            res.status(404).json({ error: 'No se encontró la rutina para este usuario' });
        }
    } catch (error) {
        console.error('Error obteniendo la rutina:', error);
        res.status(500).json({ error: 'Hubo un error al obtener la rutina' });
    }
});

/////////////////////// Envio Carrito ///////////////////////

// Realizar un pedido a numbre de un usuario desde el carrito

app.post('/api/realizar-pedido', async (req, res) => { // Escuchamos  la peticion del front

    const { email, cartItems } = req.body; // Escuchamos los datos recibidos desde el front

    if (!email) { // verificamos que el correo no esté vacio
        console.error('No se ha proporcionado un email');
        return res.status(400).json({ message: 'Email no proporcionado.' });
    }

    if (!cartItems || cartItems.length === 0) { // verificamos que no envie el carrito vacio
        console.error('El carrito está vacío');
        return res.status(400).json({ message: 'El carrito está vacío.' }); // 400 peticion mal hecha por parte del cliente
    }

    try {
        const userResponse = await dynamoDB.get({ // buscamos el usuario en la BBDD usando su email 
            TableName: 'usuarios',
            Key: { email }
        }).promise();

        if (!userResponse.Item) {
            console.error(`Usuario con email ${email} no encontrado`);
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }
        // Extraemos nombre y el email y los almacenamos mediante Destructuring
        const { nombre, email: userEmail } = userResponse.Item;
        const doc = new PDFDocument();  // Aqui creamos el documento pdf
        const archivoPdf = `./${userEmail}_pedido.pdf`; // basamos su nombre en su correo. 
        const writeStream = fs.createWriteStream(archivoPdf); // "abre un archivo para escribir en el"
        doc.pipe(writeStream); // "Empieza a mandar el contenido de este documento hacia el archivo que abrimos antes"


        doc.fontSize(20).text('Resumen de Pedido - FrailesFit', { align: 'center' }); // Escribe el titutlo Principal del pedido
        doc.moveDown();
        doc.fontSize(12).text(`Nombre del cliente: ${nombre}`);
        doc.text(`Email: ${userEmail}`); // nombre e email del cliente
        doc.moveDown();
        doc.fontSize(14).text('Productos del carrito:', { underline: true }); // Añadimos subtiulo con subrallado 
        doc.moveDown();

        // Productos
        // creamos un bucle para recorrer los productos e ir pintando sus elementos 
        for (const item of cartItems) {
            doc.fontSize(12).text(`Producto: ${item.nombre}`); // nombre
            doc.text(`Talla: ${item.talla || 'N/A'}`); // talla , si la hayS
            doc.text(`Cantidad: ${item.cantidad}`); // cantidad 
            doc.text(`Precio unitario: ${item.precio.toFixed(2)} €`); // precio con redondeo de hasta 2 decimales
            doc.text(`Subtotal: ${(item.precio * item.cantidad).toFixed(2)} €`); // total con redondeo 

            // Comprobamos si el item tiene una imagen asociada
            if (item.imagen) {
                try {
                    // Usamos Axios para hacer una solicitud GET a la URL de la imagen
                    // Esto nos devuelve la imagen en formato binario (arraybuffer)
                    const response = await axios.get(item.imagen, { responseType: 'arraybuffer' });

                    // Convertimos la respuesta binaria en un Buffer, que es lo que PDFKit necesita para insertar imágenes
                    const imageBuffer = Buffer.from(response.data, 'binary');

                    // Insertamos la imagen en el PDF. 
                    // fit: [100, 100] redimensiona la imagen para ajustarse a un tamaño de 100px por 100px.
                    // align: 'left' alinea la imagen a la izquierda.
                    doc.image(imageBuffer, {
                        fit: [100, 100],
                        align: 'left'
                    });
                } catch (error) {
                    // Si hubo un error al intentar cargar la imagen, lo mostramos en consola.
                    console.error(`No se pudo cargar la imagen de ${item.nombre}: ${item.imagen}`, error.message);
                }
            }

            // Después de insertar la imagen, agregamos un espacio en blanco de 2 líneas (espaciado)
            doc.moveDown(2);

        }

        // Total
        // reduce es un metodo de arrays que acumula un valor, acc = acumulador, item = valor actual,  0 = valor inicial. 
        const total = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        // damos un poco de espacio 
        doc.moveDown();
        // y mostramos el todal
        doc.fontSize(14).text(`Total del pedido: ${total.toFixed(2)} €`, { align: 'right', underline: true });

        doc.end();
        // Cuando el Pdf ha sido escrito está listo para ser enviado mediante la ejecucion de esta funcion. 
        writeStream.on('finish', async () => {
            const transporter = nodemailer.createTransport({ // creamos un transportador para enviar un correo electronico.
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            // Opciones del corro electronico
            const mailOptions = {
                from: `"FrailesFit" <${process.env.EMAIL_USER}>`,
                to: 'frailesfit@gmail.com',
                subject: `Nuevo pedido realizado por ${nombre}`,
                text: `Estimado equipo de FrailesFit,

Se ha recibido un nuevo pedido realizado por ${nombre} (${userEmail}).

Adjunto encontrarán el resumen detallado del pedido en formato PDF, incluyendo productos, cantidades, tallas y total facturado.

Por favor, procedan a la gestión del mismo según los procedimientos habituales.

Un cordial saludo,

Sistema de pedidos de FrailesFit
`,
                attachments: [ // Adjuntos
                    {
                        filename: `${userEmail}_pedido.pdf`,
                        path: archivoPdf, //  Ruta del archivo
                    },
                ],
            };
            // enviamos el correo
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo:', error);
                    return res.status(500).json({ message: 'Error al enviar el correo de confirmación.' });
                }

                fs.unlinkSync(archivoPdf); // Si el correo se envió correctamente, eliminamos el archivo PDF generado para evitar acumular archivos innecesarios
                return res.status(200).json({ message: 'Pedido realizado con éxito. El administrador ha sido notificado.' });
            });
        });

    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        return res.status(500).json({ message: 'Hubo un problema al procesar el pedido.' });
    }
});

/////////////////////// Envio Formulario ///////////////////////

app.post('/enviar-email', async (req, res) => {
    const { nombre, email, tel, mensaje, usuarioEmail } = req.body; // Recibimos los datos del formulario

    // Validamos los datos
    if (!nombre || !email || !mensaje || !usuarioEmail) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Configuración del transporte de correo usando nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Usuario de correo electrónico
            pass: process.env.EMAIL_PASS, // Contraseña o aplicación específica
        },
    });

    // Configuración del correo a enviar
    const mailOptions = {
        from: `"FrailesFit" <${process.env.EMAIL_USER}>`, // Remitente (tu correo)
        to: 'frailesfit@gmail.com', // Correo del administrador
        subject: `Nuevo mensaje de ${nombre}`, // Asunto del correo
        text: `
      Se ha recibido un nuevo mensaje desde el formulario de contacto:
  
      Nombre: ${nombre}
      Email: ${email}
      Teléfono: ${tel}
      Mensaje: ${mensaje}
  
    Email Usuario: ${usuarioEmail} 
      `,
    };

    try {
        // Enviamos el correo al administrador
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado al administrador exitosamente.');

        // Correo de confirmación al usuario
        const mailOptionsCliente = {
            from: `"FrailesFit" <${process.env.EMAIL_USER}>`,
            to: email, // Correo del usuario
            subject: `Confirmación de mensaje recibido - FrailesFit`,
            text: `
        Hola ${nombre},
  
        Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
  
        Un cordial saludo,
        El equipo de FrailesFit
        `,
        };

        // Enviar correo de confirmación al usuario
        await transporter.sendMail(mailOptionsCliente);
        console.log('Correo de confirmación enviado al usuario.');

        // Respuesta al frontend indicando que todo fue bien
        return res.status(200).json({ message: 'Formulario enviado exitosamente.' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ message: 'Hubo un error al enviar el correo. Intenta más tarde.' });
    }
});


