/**
 * Created by abrusutt on 11/01/2018.
 */
var express = require('express'); //Server Node Express
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

// Recuperar Modelo de Usuario
var Usuario = require('../models/usuario');


// ========================================
//  PROBAR QUE ANDA EL ROUTE LOGIN
// ========================================
app.get('/', ( req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Route Login funciona'
    });
});

// ========================================
//  LOGUEAR UN USUARIO
// ========================================

app.post('/',( req, res ) => {
    var body = req.body;

    Usuario.findOne({email: body.email}, ( err , usuarioDB ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email ',
                errors: {message: 'Credenciales incorrectas - email' }
            });
        }

        // Comparara Password
        if( !bcrypt.compareSync(body.password, usuarioDB.password))
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password ',
                errors: {message: 'Credenciales incorrectas - password' }
            });
        }

        // Crear TOKEN ( payload, sid , fecha_expiracion (14400 = 4hs))
        usuarioDB.password = ':)'; //Elimino la password para no mandarla en el TOKEN
        var token = jwt.sign({ usuario:usuarioDB }, SEED, { expiresIn:14400 });

        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });


    });
});

module.exports = app;