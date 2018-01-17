/**
 * Created by abrusutt on 15/01/2018.
 */
// Rutas
var express = require('express'); //Server Node Express
var fs = require('fs');

// Inicializar variables
var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var path = `./uploads/${ tipo }/${ img }`;

    // Tipos de entidades validas
    var colleccionesValidas = ['hospitales','medicos','usuarios'];
    if(colleccionesValidas.indexOf(tipo) < 0)
    {
        res.status(400).json({
            ok: false,
            mensaje: 'Colleccion no valida',
            error: { mensaje: 'Las collecciones validas son:' + colleccionesValidas.join(', ')}

        });
    }


    fs.exists( path, existe => {
        if( !existe )
        {
            path = './assets/no-img.jpg';
        }
        res.sendfile(path);
    });


});

module.exports = app;