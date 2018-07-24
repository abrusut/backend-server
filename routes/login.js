/**
 * Created by abrusutt on 11/01/2018.
 */
var express = require('express'); //Server Node Express
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET_ID = require('../config/config').GOOGLE_SECRET_ID;

// Inicializar variables
var app = express();

// Recuperar Modelo de Usuario
var Usuario = require('../models/usuario');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

var middlewareAutenticacion = require('../middlewares/autenticacion');

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
//  RENUEVA TOKEN
// ========================================
app.get('/renuevatoken',middlewareAutenticacion.verificarToken, (req, res) =>{

    var _token = jwt.sign({ usuario:req.usuario }, SEED, { expiresIn:14400 });

    return res.status(200).json({
        ok: true,
        token:_token
    });
    
});



// ========================================
//  LOGUEAR UN USUARIO GOOGLE
// https://developers.google.com/identity/sign-in/web/backend-auth
// ========================================
app.post('/google',( req, res ) => {

    var token = req.body.token || 'XXX';
    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        function(err, login) {
            if ( err )
            {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al validar token google',
                    errors: err
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];

            Usuario.findOne({email: payload.email}, ( err , usuario ) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        errors: err
                    });
                }

                if( usuario )
                {
                    //Control si no fue un usuario creado desde google
                    if( !usuario.google )
                    {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Debe usar la autenticacion normal email-pasword',
                            errors: err
                        });
                    }else{
                        // Es un usuario comun de email y password le devuelvo un token

                        // Crear TOKEN ( payload, sid , fecha_expiracion (14400 = 4hs))
                        usuario.password = ':)'; //Elimino la password para no mandarla en el TOKEN
                        var token = jwt.sign({ usuario:usuario }, SEED, { expiresIn:14400 });

                        return res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id,
                            menu: obtenerMenu(usuario.role)
                        });
                    }
                }else{
                    // Si el usuario no existe para ese correo lo doy de alta
                    var usuario = new Usuario();
                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save ( ( err, usuarioPersistido ) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al guardar usuario',
                                errors: err
                            });
                        }
                    });
                    // Crear TOKEN ( payload, sid , fecha_expiracion (14400 = 4hs))
                    usuario.password = ':)'; //Elimino la password para no mandarla en el TOKEN
                    var token = jwt.sign({ usuario:usuario }, SEED, { expiresIn:14400 });

                    return res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id,
                        menu: obtenerMenu(usuario.role)
                    });
                }
            });





        });

});

// ========================================
//  LOGUEAR UN USUARIO EMAIL-PASSWORD
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
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });


    });
});

function obtenerMenu( ROLE ){
    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard'  },
                { titulo: 'Progress', url: '/progress'  },
                { titulo: 'Graficos', url: '/graficas1'  },
                { titulo: 'Promesas', url: '/promesas'  },
                { titulo: 'rxjs', url: '/rxjs'  }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //{ titulo: 'Usuarios', url: '/usuarios'  },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos'  }

            ]
        }
    ];

    if( ROLE === 'ADMIN_ROLE' ){
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios'  });//Agrega opcion al principio del array
    }

    return menu;
}


module.exports = app;