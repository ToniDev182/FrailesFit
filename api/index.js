const express = require('express')
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
require('dotenv').config({ path: 'local.env' });

const app = express()
const port = 3000

AWS.config.update({
    region: 'eu-west-1', 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.get('/', (req, res) => {
  res.send('FrailesFitAPI')
})

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Ruta para obtener todos los usuarios
app.get('/users', async (req, res) => {
    const params = {
        TableName: 'usuarios'
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})