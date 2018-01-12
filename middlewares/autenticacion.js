var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

// ========================================
//  VERIFICAR TOKEN ( Es importante el orden de los metodos ya que
//  este midelware bloquea las acciones que requieren token
//  Llamada http://localhost:3000/usuario?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Il9pZCI6IjVhNTdhNWU3Y2FkMDA1MzhlYzM4N2I2MCIsIm5vbWJyZSI6InRlc3QgMSIsImVtYWlsIjoidGVzdDFAdGVzdDEuY29tIiwicGFzc3dvcmQiOiI6KSIsIl9fdiI6MCwicm9sZSI6IkFETUlOX1JPTEUifSwiaWF0IjoxNTE1NzU5MzgxLCJleHAiOjE1MTU3NzM3ODF9.03uhPeTcoCcw9JCKstZSHtwO6_buhd4yjJrUy5uNyXo
// ========================================

exports.verificarToken = function (req, res, next) {
    var token = req.query.token;
    jwt.verify( token , SEED, ( err, decode ) =>{
        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decode.usuario;//decode tiene los datos que guardamos al generar el token

        // Si valido OK el token habilita todos los metodos de abajo
        next();
    });
}
