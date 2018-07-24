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

// Recuperar Modelo de Medico
var Medico = require('../models/medico');

// ========================================
//  OBTENER TODOS LOS MEDICOS
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario' , 'nombre email') //Agrega el objeto usuario al response
        .populate('hospital') //Agrega el objeto hospital al response
        .exec(
            ( err, medicos ) =>{
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Medico',
                        errors: err
                    });
                }

                Medico.count({}, (err , conteo )=> {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        desde: desde,
                        total: conteo
                    });
                });
        });
});

// ========================================
//  OBTENER 1 Medico TODOS LOS MEDICOS
// ========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById( id )
        .populate('usuario' , 'nombre email') //Agrega el objeto usuario al response
        .populate('hospital') //Agrega el objeto hospital al response
        .exec(( err, medico ) =>{
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando medico',
                errors: err
            });
        }

        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con id '+ id,
                errors: {message: 'No existe medico con ese ID ' }
            });
        }

         res.status(200).json({
             ok: true,
             medico: medico
         });

    });
});

// ========================================
//  ACTUALIZAR MEDICO
// ========================================
app.put('/:id', middlewareAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id , (err , medico) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando medico',
                errors: err
            });
        }

        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con id '+ id,
                errors: {message: 'No existe medico con ese ID ' }
            });
        }


        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;

        if( body.idHospital ){
            medico.hospital = body.hospital;
        }

        medico.save( ( err, medicoActualizado ) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });

    });

});

// ========================================
//  GUARDAR MEDICO
// ========================================
app.post('/',middlewareAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( ( err, medicoPersistido ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error Guardando medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoPersistido,
            usuariotoken: req.usuario //usuario que hizo la peticion
        });
    });

});

// ========================================
//  BORRAR MEDICO
// ========================================

app.delete('/:id', middlewareAutenticacion.verificarToken, ( req, res ) => {
   var id = req.params.id;

    Medico.findByIdAndRemove(id, ( err , medicoBorrado ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con id '+ id,
                errors: {message: 'No existe medico con ese ID ' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});



module.exports = app;