/**
 * Created by abrusutt on 11/01/2018.
 * http://localhost:3000/hospital?token=
 */
var express = require('express'); //Server Node Express
var bcrypt = require('bcryptjs');
var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

var middlewareAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// Recuperar Modelo de Hospital
var Hospital = require('../models/hospital');

// ========================================
//  OBTENER TODOS LOS HOSPITALES
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario' , 'nombre email') //Agrega el objeto usuario al response
        .exec(
            ( err, hospitales ) =>{
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando hospitales',
                        errors: err
                    });
                }
                
                Hospital.count({}, (err , conteo )=> {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        desde: desde,
                        total: conteo
                    });
                });
        });
});


// ========================================
//  OBTENER HOSPITAL POR ID DE HOSPITAL
// ========================================

app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {

        if (err) {
            return res.status(500).json({ok: false, mensaje: 'Error al buscar hospital', errors: err});
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }

        res.status(200).json({ok: true, hospital: hospital});

    })

});
// ========================================
//  ACTUALIZAR HOSPITAL
// http://localhost:3000/hospital?token=
// ========================================
app.put('/:id', middlewareAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id , (err , hospital) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando hospital',
                errors: err
            });
        }

        if( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con id '+ id,
                errors: {message: 'No existe hospital con ese ID ' }
            });
        }


        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err, hospitalActualizado ) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar hospital',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });

    });

});

// ========================================
//  GUARDAR HOSPITAL
//  http://localhost:3000/hospital?token=
// ========================================
app.post('/',middlewareAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( ( err, hospitalPersistido ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error Guardando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalPersistido,
            usuariotoken: req.usuario //usuario que hizo la peticion
        });
    });

});

// ========================================
//  BORRAR HOSPITAL
// http://localhost:3000/hospital?token=
// ========================================

app.delete('/:id', middlewareAutenticacion.verificarToken, ( req, res ) => {
   var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err , hospitalBorrado ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con id '+ id,
                errors: {message: 'No existe hospital con ese ID ' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});



module.exports = app;