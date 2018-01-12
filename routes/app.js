/**
 * Created by abrusutt on 11/01/2018.
 */
// Rutas
var express = require('express'); //Server Node Express
// Inicializar variables
var app = express();

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion Realizada Correctamente - Server OnLine'
    });
});

module.exports = app;