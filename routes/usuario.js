/**
 * Created by abrusutt on 11/01/2018.
 */
var express = require('express'); //Server Node Express
var bcrypt = require('bcryptjs');
var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

var middlewareAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// Recuperar Modelo de Usuario
var Usuario = require('../models/usuario');

// ========================================
//  OBTENER TODOS LOS USUARIOS
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Paginado
    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            ( err, usuarios ) =>{
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando usuarios',
                        errors: err
                    });
                }


                Usuario.count({}, (err , conteo )=> {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        desde: req.query.desde,
                        total: conteo
                    });
                });
        });
});

// ========================================
//  ACTUALIZAR USUARIO
// ========================================
app.put('/:id', [ middlewareAutenticacion.verificarToken,middlewareAutenticacion.verificarAdminOMismoUsuario ], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id , (err , usuario) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con id '+ id,
                errors: {message: 'No existe usuario con ese ID ' }
            });
        }


        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( err, usuarioActualizado ) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar usuario',
                    errors: err
                });
            }

            usuarioActualizado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            });
        });

    });

});

// ========================================
//  GUARDAR USUARIO
// ========================================
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioPersistido ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error Guardando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioPersistido,
            usuariotoken: req.usuario //usuario que hizo la peticion
        });
    });

});

// ========================================
//  BORRAR USUARIO
// ========================================

app.delete('/:id', [ middlewareAutenticacion.verificarToken,middlewareAutenticacion.verificarAdminOMismoUsuario ], ( req, res ) => {
   var id = req.params.id;

    Usuario.findByIdAndRemove(id, ( err , usuarioBorrado ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con id '+ id,
                errors: {message: 'No existe usuario con ese ID ' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});



module.exports = app;