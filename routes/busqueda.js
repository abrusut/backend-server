/**
 * Created by abrusutt on 15/01/2018.
 */
// Rutas
var express = require('express'); //Server Node Express
// Inicializar variables
var app = express();

// Recuperar Modelo de Hospital
var Hospital = require('../models/hospital');

// Recuperar Modelo de Medico
var Medico = require('../models/medico');

// Recuperar Modelo de Usuario
var Usuario = require('../models/usuario');


//==========================================
//  BUSQUEDA ESPECIFICA
//==========================================
app.get('/colleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda , 'i'); //Sin importar mayusculas y minusculas

    var promesa;
    if( tabla ) {
        switch (tabla) {
            case 'medicos':
                promesa = buscarMedicos(busqueda, regex);
                break;
            case 'usuarios':
                promesa = buscarUsuario(busqueda, regex);
                break;
            case 'hospitales':
                promesa = buscarHospitales(busqueda, regex);
                break;
            default:
                res.status(400).json({
                    ok: false,
                    mensaje: 'Los tipos de Busquedas son Medicos, Hospitales, Usuarios',
                    error: {mensaje: 'Los tipos de Busquedas son Medicos, Hospitales, Usuarios'}
                });
                break
        }


        promesa.then( data => {
            res.status(200).json({
                ok: true,
                mensaje: 'Peticion Realizada Correctamente',
                [tabla]: data // Va entre [] para que muestre el valor de la variable
            });
        });
    }
});
//==========================================
//  BUSQUEDA GENERAL
//==========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda , 'i'); //Sin importar mayusculas y minusculas

    Promise.all( [
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuario(busqueda, regex)
        ]
    ).then( respuestas => {
        /**Devuelve un array con los resultados por el orden de llamada de llamada
         * 0 = Hospitales
         * 1 = Medicos
         * 2 = Usuarios
         * **/
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion Realizada Correctamente',
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(busqueda , regex){
    return new Promise( ( resolve, reject ) => {
        Hospital.find({nombre: regex})
                .populate('usuario', 'nombre email img role')
                .exec( ( err, hospitales ) => {
                    if( err ){
                        reject('Error al cargar Hospitales', err);
                    }else{
                        resolve(hospitales);
                    }
                });
    });
}

function buscarMedicos(busqueda , regex){
    return new Promise( ( resolve, reject ) => {
        Medico.find({nombre: regex})
            .populate('usuario','nombre img email')
            .populate('hospital')
            .exec( ( err, medicos ) => {
            if( err ){
                reject('Error al cargar Medicos', err);
            }else{
                resolve(medicos);
            }
        });
    });
}

function buscarUsuario(busqueda , regex){
    return new Promise( ( resolve, reject ) => {
        Usuario.find({ }, 'nombre email img role')
                .or( [ { 'nombre' : regex },{ 'email' : regex } ])
                .exec( ( err , usuarios ) =>{
                    if( err ){
                        reject('Error al cargar Usuarios', err);
                    }else{
                        resolve(usuarios);
                    }

                });
    });
}

module.exports = app;