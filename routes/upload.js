/**
 * Created by abrusutt on 15/01/2018.
 */
// Rutas
var express = require('express'); //Server Node Express
const fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app = express();

// Recuperar Modelo de Usuario
var Usuario = require('../models/usuario');

// Recuperar Modelo de Medico
var Medico = require('../models/medico');

// Recuperar Modelo de Hospital
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());


app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion Realizada Correctamente - Server OnLine'
    });
});


app.put('/:colleccion/:id', function(req, res) {
    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ningun archivo',
            error: { mensaje: 'No selecciono ningun archivo'}

        });
    }

    // Obtener parametros
    var colleccion = req.params.colleccion;
    var id = req.params.id;

    // Tipos de entidades validas
    var colleccionesValidas = ['hospitales','medicos','usuarios'];
    if(colleccionesValidas.indexOf(colleccion) < 0)
    {
        res.status(400).json({
            ok: false,
            mensaje: 'Colleccion no valida',
            error: { mensaje: 'Las collecciones validas son:' + colleccionesValidas.join(', ')}

        });
    }


    // Obtener nombre archivo
    var archivo = req.files.imagen; // Imagen es el campo del formulario
    var nombreSplit = archivo.name.split('.');
    var extension = nombreSplit[nombreSplit.length -1 ];

    // Validar extensiones
    var extensionesValidas = [ 'jpg','gif', 'png', 'jpeg' ];
    if( extensionesValidas.indexOf(extension) < 0 ) //No encontro esa extension
    {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { mensaje: 'Las extensiones validas son:' + extensionesValidas.join(', ')}
        });
    }

    // Definimos nombre segun ID entidad, mas numero random para que no quede cache en navegador
    var nombreArchivoFinal = `${ id }-${new Date().getMilliseconds()}.${ extension }`;
    var path = `./uploads/${ colleccion }/${ nombreArchivoFinal }`;

    // Mover el archivo a un path del server
    archivo.mv(path, err => {
        if ( err ){
           return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo(colleccion, id, nombreArchivoFinal, res);

    });
});

function subirPorTipo( colleccion, id, nombreArchivo, res)
{

    if( colleccion === 'usuarios' )
    {
        Usuario.findById(id , (err , usuario) =>{

            if( !usuario )
            {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors:{mensaje:'El usuario no existe'}
                });
            }
           // Si existe elimino la imagen anterior
           var  pathViejo= `./uploads/usuarios/${ usuario.img }`;
           if ( fs.existsSync(pathViejo))
           {
               try {
                   fs.unlinkSync(pathViejo);
               } catch (err) {
                  /** return res.status(500).json({
                       ok: false,
                       mensaje: 'Error borrando Imagen de usuario',
                       errors:err,
                       pathViejo:pathViejo
                   });
                   **/
               }

           }

           try{
               //Actualizo la imagen en el usuario
               usuario.img = nombreArchivo;
               usuario.save( (err, usuarioActualizado ) => {
                   return res.status(200).json({
                       ok: true,
                       mensaje: 'Imagen de usuario actualizada',
                       usuario:usuarioActualizado,
                       pathViejo:pathViejo
                    });

               });
           } catch (err) {
               console.error(err);
           }

        });
    }

    if( colleccion === 'hospitales' )
    {
        Hospital.findById(id , (err , hospital) =>{

            if( !hospital )
            {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors:{mensaje:'El hospital no existe'}
                });
            }

            // Si existe elimino la imagen anterior
            var  pathViejo= `./uploads/hospitales/${ hospital.img }`;
            if ( fs.existsSync(pathViejo))
            {
                try {
                    fs.unlinkSync(pathViejo);
                } catch (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error borrando Imagen del hospital',
                        errors:err,
                        pathViejo:pathViejo
                    });
                }

            }

            //Actualizo la imagen en el usuario
            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado ) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital:hospitalActualizado,
                    pathViejo:pathViejo
                });

            });

        });

    }

    if( colleccion === 'medicos' )
    {
        Medico.findById(id , (err , medico) =>{

            if( !medico )
            {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors:{mensaje:'El medico no existe'}
                });
            }

            // Si existe elimino la imagen anterior
            var  pathViejo= `./uploads/medicos/${ medico.img }`;
            if ( fs.existsSync(pathViejo))
            {
                try {
                    fs.unlinkSync(pathViejo);
                } catch (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error borrando Imagen del medico',
                        errors:err,
                        pathViejo:pathViejo
                    });
                }

            }

            //Actualizo la imagen en el usuario
            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado ) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico:medicoActualizado,
                    pathViejo:pathViejo
                });

            });

        });
    }
}


module.exports = app;